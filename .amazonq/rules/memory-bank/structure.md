# Project Structure

## Directory Organization

```
s3-bucket-logging-athena/
├── bin/                          # CDK application entry point
│   └── s3-bucket-logging-athena.ts
├── lib/                          # CDK stack implementation
│   └── s3-bucket-logging-athena-stack.ts
├── cdk.out/                      # CDK synthesis output
├── .amazonq/rules/memory-bank/   # Documentation and rules
├── package.json                  # Dependencies and scripts
├── cdk.json                      # CDK configuration
├── jest.config.js               # Test configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## Core Components

### Application Entry Point (`bin/`)
- **s3-bucket-logging-athena.ts**: CDK app initialization with stack instantiation
- Configures Lake Formation integration (`lakeformationEnabled: true`)
- Single stack deployment pattern

### Stack Implementation (`lib/`)
- **s3-bucket-logging-athena-stack.ts**: Main infrastructure stack
- Comprehensive AWS service integration
- Configurable properties for customization

### Configuration Files
- **cdk.json**: CDK framework configuration with feature flags
- **package.json**: Node.js dependencies and build scripts
- **tsconfig.json**: TypeScript compiler configuration
- **jest.config.js**: Testing framework setup

## Architectural Components

### Storage Layer
```typescript
// S3 Logging Bucket
- Encrypted storage (S3_MANAGED)
- Block public access
- Lifecycle rules for automatic cleanup
- Resource policies for service access
```

### Data Catalog Layer
```typescript
// Glue Database & Tables
- s3_access_logs_db database
- mybucket_logs table (S3 access logs)
- cloudtrail_logs table (CloudTrail events)
- Partition projection for performance
```

### Event Processing Layer
```typescript
// EventBridge + Lambda
- S3 tagging event detection
- Automatic logging configuration
- Tag-based activation/deactivation
```

### Monitoring Layer
```typescript
// CloudTrail (Optional)
- Lake Formation event capture
- Multi-region trail support
- S3 integration for log storage
```

## Component Relationships

### Event Flow Architecture
1. **Trigger**: S3 bucket tagged with `analyse-logging=true`
2. **Detection**: EventBridge rule captures tag change events
3. **Processing**: Lambda function configures S3 logging
4. **Storage**: Access logs stored in partitioned format
5. **Analysis**: Athena queries via Glue catalog

### Data Flow Architecture
1. **Collection**: S3 server access logs (2-4 hour delay)
2. **Storage**: Partitioned by timestamp and bucket
3. **Cataloging**: Glue tables with partition projection
4. **Querying**: Athena analysis with pre-built queries

### Integration Patterns
- **Event-Driven**: EventBridge triggers automated configuration
- **Serverless**: Lambda-based processing without infrastructure management
- **Analytics-Ready**: Pre-configured Glue catalog for immediate querying
- **Cost-Optimized**: Partition projection reduces query costs

## Customization Points

### Stack Properties
```typescript
interface S3BucketLoggingAthenaStackProps {
  lakeformationEnabled?: boolean;    // CloudTrail integration
  logRetention?: cdk.Duration;       // Log lifecycle management
  bucketName?: string;               // Custom bucket naming
  databaseName?: string;             // Glue database name
  s3TableName?: string;              // S3 logs table name
  cloudTrailTableName?: string;      // CloudTrail table name
  bucketRemovalPolicy?: RemovalPolicy; // Stack deletion behavior
  enableAutoTagging?: boolean;       // EventBridge rule toggle
  tagKey?: string;                   // Custom tag key monitoring
  projectionStartDate?: string;      // Partition projection range
}
```

### Deployment Patterns
- **Single Stack**: All components in one CloudFormation stack
- **Configurable**: Properties-based customization
- **Environment Agnostic**: No hardcoded environment values
- **Secure by Default**: Encryption and access controls enabled

## Security Architecture

### Access Control
- S3 bucket policies for service principals
- Lambda execution role with minimal permissions
- CloudTrail service permissions (when enabled)

### Data Protection
- S3 server-side encryption
- SSL enforcement on bucket access
- Block public access configuration

### Compliance Features
- CloudTrail integration for audit trails
- Lifecycle policies for data retention
- Resource tagging for governance