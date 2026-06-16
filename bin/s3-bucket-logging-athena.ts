#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { S3BucketLoggingAthenaStack } from '../lib/s3-bucket-logging-athena-stack';

const app = new cdk.App();
new S3BucketLoggingAthenaStack(app, 'S3BucketLoggingAthenaStack', {
  lakeformationEnabled: true,
});


cdk.Tags.of(app).add('source', 'https://github.com/JeromeGuyon/s3-bucket-logging-athena');