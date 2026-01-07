#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { S3BucketLoggingAthenaStack } from '../lib/s3-bucket-logging-athena-stack';

const app = new cdk.App();
new S3BucketLoggingAthenaStack(app, 'S3BucketLoggingAthenaStack', {
  lakeformationEnabled: true,
});
