import { S3Client, GetBucketLoggingCommand, PutBucketLoggingCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client();

const LOGGING_BUCKET = process.env.LOGGING_BUCKET;
const TAG_KEY = process.env.TAG_KEY!;

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
    } else if (!analyseLoggingTag || analyseLoggingTag !== 'true') {
      // Disable logging only if target is our logging bucket
      if (hasLogging && currentTarget === LOGGING_BUCKET) {
        await s3.send(new PutBucketLoggingCommand({
          Bucket: bucketName,
          BucketLoggingStatus: {}
        }));
        console.log('Disabled logging for bucket:', bucketName);
      }
    }
  } catch (error) {
    console.error('Error handling bucket logging:', error);
  }
};