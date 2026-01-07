import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface S3BucketLoggingAthenaStackProps extends cdk.StackProps {
  /** Enable CloudTrail integration for Lake Formation correlation */
  lakeformationEnabled?: boolean;

  /** Duration to retain log files before automatic deletion */
  logRetention?: cdk.Duration;

  /** Custom name for the logging bucket */
  bucketName?: string;

  /** Custom name for the Glue database */
  databaseName?: string;

  /** Custom name for the S3 access logs table */
  s3TableName?: string;

  /** Custom name for the CloudTrail logs table */
  cloudTrailTableName?: string;

  /** S3 bucket removal policy for stack deletion */
  bucketRemovalPolicy?: cdk.RemovalPolicy;

  /** Enable/disable EventBridge rule for automatic tagging detection */
  enableAutoTagging?: boolean;

  /** Custom tag key to monitor for enabling logging */
  tagKey?: string;

  /** Start date for partition projection (format: YYYY/MM/DD) */
  projectionStartDate?: string;
}

export class S3BucketLoggingAthenaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: S3BucketLoggingAthenaStackProps) {
    super(scope, id, props);

    const lakeformationEnabled = props?.lakeformationEnabled ?? false;
    const logRetention = props?.logRetention ?? cdk.Duration.days(30);
    const bucketRemovalPolicy = props?.bucketRemovalPolicy ?? cdk.RemovalPolicy.DESTROY;
    const databaseName = props?.databaseName ?? 's3_access_logs_db';
    const s3TableName = props?.s3TableName ?? 'mybucket_logs';
    const cloudTrailTableName = props?.cloudTrailTableName ?? 'cloudtrail_logs';
    const tagKey = props?.tagKey ?? 'analyse-logging';
    const projectionStartDate = props?.projectionStartDate ?? '2026/01/01';

    // Create a S3 bucket for logging Athena queries
    const loggingBucket = new s3.Bucket(this, 'LoggingBucket', {
      bucketName: props?.bucketName,
      removalPolicy: bucketRemovalPolicy,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      lifecycleRules: [{
        id: 'DeleteOldLogs',
        enabled: true,
        expiration: logRetention
      }]
    });

    // Add bucket policy to allow S3 service to write access logs
    loggingBucket.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'S3ServerAccessLogsPolicy',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('logging.s3.amazonaws.com')],
      actions: ['s3:PutObject'],
      resources: [`${loggingBucket.bucketArn}/access-logs/*`],
      conditions: {
        StringEquals: {
          'aws:SourceAccount': this.account
        }
      }
    }));

    // Add bucket policy to allow CloudTrail to write logs (only if Lake Formation enabled)
    if (lakeformationEnabled) {
      loggingBucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'AWSCloudTrailAclCheck',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudtrail.amazonaws.com')],
        actions: ['s3:GetBucketAcl'],
        resources: [loggingBucket.bucketArn]
      }));

      loggingBucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'AWSCloudTrailWrite',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudtrail.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${loggingBucket.bucketArn}/trails-lakeformation/AWSLogs/${this.account}/*`],
        conditions: {
          StringEquals: {
            's3:x-amz-acl': 'bucket-owner-full-control'
          }
        }
      }));
    }

    // Create Glue database
    const database = new glue.CfnDatabase(this, 'S3AccessLogsDB', {
      catalogId: this.account,
      databaseInput: {
        name: databaseName
      }
    });

    // Create Glue table for S3 access logs
    new glue.CfnTable(this, 'S3AccessLogsTable', {
      catalogId: this.account,
      databaseName: database.ref,
      tableInput: {
        name: s3TableName,
        tableType: 'EXTERNAL_TABLE',
        parameters: {
          'projection.enabled': 'true',
          'projection.timestamp.type': 'date',
          'projection.timestamp.format': 'yyyy/MM/dd',
          'projection.timestamp.interval': '1',
          'projection.timestamp.interval.unit': 'DAYS',
          'projection.timestamp.range': `${projectionStartDate},NOW`,
          'projection.bucket.type': 'injected',
          'storage.location.template': `s3://${loggingBucket.bucketName}/access-logs/${this.account}/${this.region}/\${bucket}/\${timestamp}`
        },
        storageDescriptor: {
          columns: [
            { name: 'bucketowner', type: 'string' },
            { name: 'bucket_name', type: 'string' },
            { name: 'requestdatetime', type: 'string' },
            { name: 'remoteip', type: 'string' },
            { name: 'requester', type: 'string' },
            { name: 'requestid', type: 'string' },
            { name: 'operation', type: 'string' },
            { name: 'key', type: 'string' },
            { name: 'request_uri', type: 'string' },
            { name: 'httpstatus', type: 'string' },
            { name: 'errorcode', type: 'string' },
            { name: 'bytessent', type: 'bigint' },
            { name: 'objectsize', type: 'bigint' },
            { name: 'totaltime', type: 'string' },
            { name: 'turnaroundtime', type: 'string' },
            { name: 'referrer', type: 'string' },
            { name: 'useragent', type: 'string' },
            { name: 'versionid', type: 'string' },
            { name: 'hostid', type: 'string' },
            { name: 'sigv', type: 'string' },
            { name: 'ciphersuite', type: 'string' },
            { name: 'authtype', type: 'string' },
            { name: 'endpoint', type: 'string' },
            { name: 'tlsversion', type: 'string' },
            { name: 'accesspointarn', type: 'string' },
            { name: 'aclrequired', type: 'string' }
          ],
          location: `s3://${loggingBucket.bucketName}/access-logs/${this.account}/${this.region}`,
          inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
          outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
          serdeInfo: {
            serializationLibrary: 'org.apache.hadoop.hive.serde2.RegexSerDe',
            parameters: {
              'input.regex': '([^ ]*) ([^ ]*) \\[(.*?)\\] ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) (\"[^\"]*\"|-) (-|[0-9]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) (\"[^\"]*\"|-) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*).*'
            }
          }
        },
        partitionKeys: [
          { name: 'timestamp', type: 'string' },
          { name: 'bucket', type: 'string' },
        ]
      }
    });

    // Create CloudTrail for Lake Formation events (only if enabled)
    if (lakeformationEnabled) {
      new cloudtrail.Trail(this, 'LakeFormationTrail', {
        bucket: loggingBucket,
        s3KeyPrefix: 'trails-lakeformation',
        isMultiRegionTrail: false,
        enableFileValidation: true,
        managementEvents: cloudtrail.ReadWriteType.READ_ONLY
      });

      // Create CloudTrail table for Athena
      new glue.CfnTable(this, 'CloudTrailTable', {
        catalogId: this.account,
        databaseName: database.ref,
        tableInput: {
          name: cloudTrailTableName,
          tableType: 'EXTERNAL_TABLE',
          parameters: {
            'projection.enabled': 'true',
            'projection.timestamp.type': 'date',
            'projection.timestamp.format': 'yyyy/MM/dd',
            'projection.timestamp.interval': '1',
            'projection.timestamp.interval.unit': 'DAYS',
            'projection.timestamp.range': `${projectionStartDate},NOW`,
            'storage.location.template': `s3://${loggingBucket.bucketName}/trails-lakeformation/AWSLogs/${this.account}/CloudTrail/${this.region}/\${timestamp}`
          },
          storageDescriptor: {
            columns: [
              { name: 'eventversion', type: 'string' },
              { name: 'useridentity', type: 'struct<type:string,principalid:string,arn:string,accountid:string,invokedby:string,accesskeyid:string,username:string,onbehalfof:struct<userid:string,identitystorearn:string>,sessioncontext:struct<attributes:struct<mfaauthenticated:string,creationdate:string>,sessionissuer:struct<type:string,principalid:string,arn:string,accountid:string,username:string>,ec2roledelivery:string,webidfederationdata:struct<federatedprovider:string,attributes:map<string,string>>>>' },
              { name: 'eventtime', type: 'string' },
              { name: 'eventsource', type: 'string' },
              { name: 'eventname', type: 'string' },
              { name: 'awsregion', type: 'string' },
              { name: 'sourceipaddress', type: 'string' },
              { name: 'useragent', type: 'string' },
              { name: 'errorcode', type: 'string' },
              { name: 'errormessage', type: 'string' },
              { name: 'requestparameters', type: 'string' },
              { name: 'responseelements', type: 'string' },
              { name: 'additionaleventdata', type: 'string' },
              { name: 'requestid', type: 'string' },
              { name: 'eventid', type: 'string' },
              { name: 'readonly', type: 'string' },
              { name: 'resources', type: 'array<struct<arn:string,accountid:string,type:string>>' },
              { name: 'eventtype', type: 'string' },
              { name: 'apiversion', type: 'string' },
              { name: 'recipientaccountid', type: 'string' },
              { name: 'serviceeventdetails', type: 'string' },
              { name: 'sharedeventid', type: 'string' },
              { name: 'vpcendpointid', type: 'string' },
              { name: 'vpcendpointaccountid', type: 'string' },
              { name: 'eventcategory', type: 'string' },
              { name: 'addendum', type: 'struct<reason:string,updatedfields:string,originalrequestid:string,originaleventid:string>' },
              { name: 'sessioncredentialfromconsole', type: 'string' },
              { name: 'edgedevicedetails', type: 'string' },
              { name: 'tlsdetails', type: 'struct<tlsversion:string,ciphersuite:string,clientprovidedhostheader:string>' }
            ],
            location: `s3://${loggingBucket.bucketName}/trails-lakeformation/AWSLogs/${this.account}/CloudTrail/${this.region}`,
            inputFormat: 'com.amazon.emr.cloudtrail.CloudTrailInputFormat',
            outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
            serdeInfo: {
              serializationLibrary: 'org.apache.hive.hcatalog.data.JsonSerDe'
            }
          },
          partitionKeys: [
            { name: 'timestamp', type: 'string' }
          ]
        }
      });
    }

    // Lambda function to handle S3 tagging events
    const tagHandler = new NodejsFunction(this, 'S3TagHandler', {
      entry: path.join(__dirname, 'lambda', 's3-tag-handler.ts'),
      environment: {
        LOGGING_BUCKET: loggingBucket.bucketName,
        TAG_KEY: tagKey
      }
    });

    // Grant S3 permissions to Lambda
    tagHandler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetBucketLogging', 's3:PutBucketLogging'],
      resources: ['*']
    }));

    // EventBridge rule to detect S3 bucket tagging
    new events.Rule(this, 'S3TaggingRule', {
      eventPattern: {
        source: ['aws.tag'],
        detailType: ['Tag Change on Resource'],
        detail: {
          service: ['s3'],
          'changed-tag-keys': [tagKey]
        }
      },
      targets: [new targets.LambdaFunction(tagHandler)]
    });


  }
}