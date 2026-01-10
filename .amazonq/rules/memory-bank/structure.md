# Project Structure

## Directory Organization

### Root Level Configuration
```
/
├── package.json          # Node.js dependencies and scripts
├── cdk.json             # CDK application configuration
├── tsconfig.json        # TypeScript compiler configuration
├── jest.config.js       # Jest testing framework configuration
└── README.md           # Comprehensive project documentation
```

### Source Code Structure
```
bin/
└── s3-bucket-logging-athena.ts    # CDK application entry point

lib/
├── s3-bucket-logging-athena-stack.ts    # Main CDK stack definition
└── lambda/
    └── s3-tag-handler.ts               # Lambda function for S3 tagging events
```

### Build and Documentation
```
cdk.out/                 # CDK synthesis output (generated)
doc/
└── archi.drawio.png    # Architecture diagram
```

## Core Components

### CDK Stack (`lib/s3-bucket-logging-athena-stack.ts`)
The main infrastructure stack that provisions:
- **S3 Logging Bucket**: Centralized storage for access logs with lifecycle policies
- **Glue Database**: `s3_access_logs_db` for Athena queries
- **Glue Tables**: 
  - `mybucket_logs`: S3 access logs with partition projection
  - `cloudtrail_logs`: CloudTrail events (optional, for Lake Formation)
- **EventBridge Rule**: Monitors S3 bucket tagging events
- **CloudTrail**: Lake Formation event logging (optional)

### Lambda Function (`lib/lambda/s3-tag-handler.ts`)
Event-driven function that:
- Responds to S3 bucket tagging changes via EventBridge
- Enables/disables S3 server access logging based on `analyse-logging` tag
- Manages CloudTrail logging for Lake Formation integration
- Uses Resource Groups API to coordinate CloudTrail state across multiple buckets

### Application Entry Point (`bin/s3-bucket-logging-athena.ts`)
CDK application bootstrap that:
- Instantiates the main stack
- Configures stack properties and environment settings
- Handles CDK context and deployment parameters

## Architectural Patterns

### Event-Driven Architecture
- **EventBridge Integration**: Automatic detection of S3 bucket tagging changes
- **Lambda Triggers**: Serverless response to configuration events
- **Decoupled Components**: Loose coupling between logging configuration and analysis infrastructure

### Data Lake Pattern
- **Partitioned Storage**: Organized by account, region, bucket, and date for optimal query performance
- **Schema Evolution**: Glue tables support S3 access log format changes
- **Partition Projection**: Dynamic partition discovery without manual maintenance

### Infrastructure as Code
- **CDK Constructs**: Type-safe infrastructure definition using TypeScript
- **Configurable Parameters**: Flexible deployment options via stack properties
- **Resource Relationships**: Proper dependency management and IAM policies

## Component Relationships

### Data Flow Architecture
1. **Configuration Trigger**: User tags S3 bucket with `analyse-logging=true`
2. **Event Processing**: EventBridge detects tag change and triggers Lambda
3. **Logging Setup**: Lambda configures S3 access logging with partitioned format
4. **Data Collection**: S3 service writes access logs to logging bucket (2-4 hour delay)
5. **Analysis Ready**: Glue tables enable Athena queries on collected logs

### Lake Formation Integration Flow
1. **Enhanced Setup**: Lambda also enables CloudTrail when Lake Formation is configured
2. **Event Correlation**: CloudTrail captures Lake Formation data access events
3. **Advanced Analysis**: SQL queries correlate Athena query IDs with S3 operations
4. **Comprehensive Insights**: Combined analysis of CloudTrail and S3 access logs

### Resource Dependencies
- **S3 Bucket Policies**: Allow S3 service and CloudTrail to write logs
- **IAM Roles**: Lambda execution role with S3, CloudTrail, and Resource Groups permissions
- **Glue Database**: Container for both S3 and CloudTrail log tables
- **EventBridge Rule**: Filters S3 tagging events for the Lambda function

## Configuration Management

### Stack Properties Interface
```typescript
S3BucketLoggingAthenaStackProps {
  lakeformationEnabled?: boolean;     # Enable CloudTrail integration
  logRetention?: Duration;            # Log file retention period
  bucketName?: string;               # Custom logging bucket name
  databaseName?: string;             # Custom Glue database name
  s3TableName?: string;              # Custom S3 logs table name
  cloudTrailTableName?: string;      # Custom CloudTrail table name
  bucketRemovalPolicy?: RemovalPolicy; # Stack deletion behavior
  enableAutoTagging?: boolean;       # EventBridge rule toggle
  tagKey?: string;                   # Custom tag key for monitoring
  projectionStartDate?: string;      # Partition projection start date
}
```

### Environment Considerations
- **Multi-Region Support**: Stack can be deployed in any AWS region
- **Account Isolation**: Logs are partitioned by AWS account ID
- **Resource Naming**: Configurable names prevent conflicts in shared environments