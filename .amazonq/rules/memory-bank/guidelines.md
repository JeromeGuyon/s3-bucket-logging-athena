# Development Guidelines

## Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Always enable strict TypeScript compilation with `strict: true`
- **Type Safety**: Use explicit typing, avoid `any` types, enable `noImplicitAny`
- **Null Safety**: Enable `strictNullChecks` for robust null/undefined handling
- **Module System**: Use `NodeNext` module resolution for modern Node.js compatibility
- **Target**: Compile to ES2022 for modern JavaScript features

### Import and Module Patterns
```typescript
// AWS SDK v3 - Use specific client imports
import { S3Client, GetBucketLoggingCommand, PutBucketLoggingCommand } from '@aws-sdk/client-s3';
import { CloudTrailClient, GetTrailStatusCommand } from '@aws-sdk/client-cloudtrail';

// CDK - Use specific construct imports
import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
```

### Error Handling Standards
- **Comprehensive Logging**: Always log errors with context using `console.error`
- **Graceful Degradation**: Handle errors without breaking the entire flow
- **Specific Error Messages**: Include operation context in error messages
```typescript
try {
  await s3.send(new GetBucketLoggingCommand({ Bucket: bucketName }));
} catch (error) {
  console.error('Error handling bucket logging:', error);
}
```

## Structural Conventions

### File Organization
- **Entry Points**: Use `bin/` directory for CDK application entry points with shebang `#!/usr/bin/env node`
- **Infrastructure**: Place CDK stacks in `lib/` directory with descriptive names
- **Lambda Functions**: Organize Lambda code in `lib/lambda/` subdirectory
- **Configuration**: Keep configuration files at project root level

### Naming Conventions
- **Files**: Use kebab-case for file names (`s3-bucket-logging-athena-stack.ts`)
- **Classes**: Use PascalCase for class names (`S3BucketLoggingAthenaStack`)
- **Interfaces**: Use PascalCase with descriptive suffixes (`S3BucketLoggingAthenaStackProps`)
- **Constants**: Use UPPER_SNAKE_CASE for environment variables (`LOGGING_BUCKET`, `TAG_KEY`)
- **Functions**: Use camelCase for function names (`manageCloudTrailLogging`)

### CDK Stack Patterns
- **Props Interface**: Always define a props interface extending `cdk.StackProps`
- **Optional Parameters**: Use optional properties with default values via nullish coalescing
- **Resource Naming**: Support custom resource names through props for flexibility
```typescript
export interface S3BucketLoggingAthenaStackProps extends cdk.StackProps {
  lakeformationEnabled?: boolean;
  logRetention?: cdk.Duration;
  bucketName?: string;
}

const lakeformationEnabled = props?.lakeformationEnabled ?? false;
const logRetention = props?.logRetention ?? cdk.Duration.days(30);
```

## Implementation Patterns

### AWS SDK Client Initialization
- **Module Level**: Initialize AWS SDK clients at module level for reuse
- **Default Configuration**: Use default client configuration unless specific settings needed
```typescript
const s3 = new S3Client();
const cloudtrail = new CloudTrailClient();
```

### Environment Variable Handling
- **Required Variables**: Use non-null assertion for required environment variables
- **Optional Variables**: Handle optional environment variables with conditional logic
```typescript
const LOGGING_BUCKET = process.env.LOGGING_BUCKET;
const TAG_KEY = process.env.TAG_KEY!;  // Required
const TRAIL_ARN = process.env.TRAIL_ARN;  // Optional
```

### Conditional Resource Creation
- **Feature Flags**: Use boolean flags to conditionally create resources
- **Resource Dependencies**: Properly handle dependencies when resources are conditionally created
```typescript
if (lakeformationEnabled) {
  trail = new cloudtrail.Trail(this, 'LakeFormationTrail', {
    bucket: loggingBucket,
    s3KeyPrefix: 'trails-lakeformation'
  });
}
```

### Async/Await Patterns
- **Consistent Usage**: Always use async/await for asynchronous operations
- **Error Boundaries**: Wrap async operations in try-catch blocks
- **Sequential Operations**: Use await for operations that must complete sequentially
```typescript
const status = await cloudtrail.send(new GetTrailStatusCommand({ Name: TRAIL_ARN }));
const isLogging = status.IsLogging;
```

## Security Best Practices

### IAM Policy Patterns
- **Least Privilege**: Grant minimal required permissions
- **Resource-Specific**: Use specific resource ARNs when possible
- **Condition-Based**: Apply conditions for additional security constraints
```typescript
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
```

### S3 Security Configuration
- **Encryption**: Always enable S3 encryption (minimum S3_MANAGED)
- **Public Access**: Block all public access by default
- **SSL Enforcement**: Require SSL for all bucket operations
```typescript
const loggingBucket = new s3.Bucket(this, 'LoggingBucket', {
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true
});
```

## Testing Configuration

### Jest Setup
- **Test Environment**: Use Node.js environment for CDK and Lambda testing
- **Test Location**: Place tests in dedicated `test/` directory
- **File Patterns**: Use `*.test.ts` pattern for test files
- **TypeScript Integration**: Use ts-jest for TypeScript test compilation
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
```

## Documentation Standards

### Code Comments
- **Minimal Comments**: Write self-documenting code, use comments sparingly
- **Complex Logic**: Comment complex business logic and AWS service interactions
- **Configuration**: Document configuration options and their impacts

### Interface Documentation
- **JSDoc Comments**: Use JSDoc for interface and complex function documentation
- **Parameter Descriptions**: Document all interface properties with clear descriptions
```typescript
export interface S3BucketLoggingAthenaStackProps extends cdk.StackProps {
  /** Enable CloudTrail integration for Lake Formation correlation */
  lakeformationEnabled?: boolean;
  
  /** Duration to retain log files before automatic deletion */
  logRetention?: cdk.Duration;
}
```

## Performance Considerations

### Resource Optimization
- **Lifecycle Policies**: Implement automatic cleanup for cost optimization
- **Partition Projection**: Use Glue partition projection for query performance
- **Conditional Resources**: Only create resources when needed to minimize costs

### Lambda Efficiency
- **Client Reuse**: Initialize AWS SDK clients outside handler function
- **Error Handling**: Implement robust error handling to prevent function failures
- **Resource Cleanup**: Ensure proper resource cleanup in error scenarios