import { S3Client, GetBucketLoggingCommand, PutBucketLoggingCommand } from '@aws-sdk/client-s3';
import { CloudTrailClient, GetTrailStatusCommand, StartLoggingCommand, StopLoggingCommand } from '@aws-sdk/client-cloudtrail';
import { ResourceGroupsTaggingAPIClient, GetResourcesCommand } from '@aws-sdk/client-resource-groups-tagging-api';

const s3 = new S3Client();
const cloudtrail = new CloudTrailClient();
const resourceGroups = new ResourceGroupsTaggingAPIClient();

const LOGGING_BUCKET = process.env.LOGGING_BUCKET;
const TAG_KEY = process.env.TAG_KEY!;
const TRAIL_ARN = process.env.TRAIL_ARN;

const checkOtherBucketsWithTag = async (): Promise<boolean> => {
  try {
    const response = await resourceGroups.send(new GetResourcesCommand({
      ResourceTypeFilters: ['s3:bucket'],
      TagFilters: [{
        Key: TAG_KEY,
        Values: ['true']
      }]
    }));
    return (response.ResourceTagMappingList?.length || 0) > 1;
  } catch (error) {
    console.error('Error checking other buckets with tag:', error);
    return false;
  }
};

const manageCloudTrailLogging = async (enable: boolean) => {
  if (!TRAIL_ARN) return;
  
  try {
    const status = await cloudtrail.send(new GetTrailStatusCommand({ Name: TRAIL_ARN }));
    const isLogging = status.IsLogging;
    
    if (enable && !isLogging) {
      await cloudtrail.send(new StartLoggingCommand({ Name: TRAIL_ARN }));
      console.log('Started CloudTrail logging');
    } else if (!enable && isLogging) {
      const hasOtherTaggedBuckets = await checkOtherBucketsWithTag();
      if (!hasOtherTaggedBuckets) {
        await cloudtrail.send(new StopLoggingCommand({ Name: TRAIL_ARN }));
        console.log('Stopped CloudTrail logging');
      }
    }
  } catch (error) {
    console.error('Error managing CloudTrail logging:', error);
  }
};

export const handler = async (event: any) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  const resourceArn = event.resources[0];
  const bucketName = resourceArn.split(':').pop();

  // Get current tags from the event
  const tags = event.detail.tags || {};
  const analyseLoggingTag = tags[TAG_KEY];

  try {
    // Get current logging configuration
    const currentLogging = await s3.send(new GetBucketLoggingCommand({ Bucket: bucketName }));
    const hasLogging = currentLogging.LoggingEnabled;
    const currentTarget = hasLogging?.TargetBucket;

    if (analyseLoggingTag === 'true') {
      // Enable logging if not already enabled
      if (!hasLogging) {
        await s3.send(new PutBucketLoggingCommand({
          Bucket: bucketName,
          BucketLoggingStatus: {
            LoggingEnabled: {
              TargetBucket: LOGGING_BUCKET,
              TargetPrefix: 'access-logs/',
              TargetObjectKeyFormat: {
                PartitionedPrefix: {
                  PartitionDateSource: 'EventTime'
                }
              }
            }
          }
        }));
        console.log('Enabled logging for bucket:', bucketName);
      }
      // Enable CloudTrail logging if not already enabled
      await manageCloudTrailLogging(true);
    } else if (!analyseLoggingTag || analyseLoggingTag !== 'true') {
      // Disable logging only if target is our logging bucket
      if (hasLogging && currentTarget === LOGGING_BUCKET) {
        await s3.send(new PutBucketLoggingCommand({
          Bucket: bucketName,
          BucketLoggingStatus: {}
        }));
        console.log('Disabled logging for bucket:', bucketName);
      }
      // Check if we should disable CloudTrail logging
      await manageCloudTrailLogging(false);
    }
  } catch (error) {
    console.error('Error handling bucket logging:', error);
  }
};