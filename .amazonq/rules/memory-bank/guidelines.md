# Development Guidelines

## Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Always enable strict TypeScript compilation
- **Type Safety**: Use explicit types for all public interfaces and function parameters
- **Module System**: Use ES6 imports/exports with CommonJS compilation target
- **Version**: Maintain TypeScript ~5.9.3 for consistency

### File Organization Patterns
- **Entry Points**: Place application entry points in `bin/` directory
- **Implementation**: Keep stack implementations in `lib/` directory
- **Configuration**: Store configuration files at project root
- **Tests**: Organize tests in dedicated `test/` directory

### Naming Conventions
- **Files**: Use kebab-case for file names (e.g., `s3-bucket-logging-athena.ts`)
- **Classes**: Use PascalCase for class names (e.g., `S3BucketLoggingAthenaStack`)
- **Interfaces**: Use PascalCase with descriptive suffixes (e.g., `S3BucketLoggingAthenaStackProps`)
- **Variables**: Use camelCase for variables and properties

## CDK Development Patterns

### Stack Structure
```typescript
// Always extend cdk.Stack with proper typing
export class S3BucketLoggingAthenaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: S3BucketLoggingAthenaStackProps) {
    super(scope, id, props);
    // Implementation
  }
}
```

### Interface Design
```typescript
// Extend cdk.StackProps for stack properties
export interface S3BucketLoggingAthenaStackProps extends cdk.StackProps {
  /** Use JSDoc comments for property documentation */
  lakeformationEnabled?: boolean;
  
  /** Provide default values via nullish coalescing */
  logRetention?: cdk.Duration;
}
```

### Property Handling
```typescript
// Use nullish coalescing for default values
const lakeformationEnabled = props?.lakeformationEnabled ?? false;
const logRetention = props?.logRetention ?? cdk.Duration.days(30);
```

### Resource Configuration
```typescript
// Use descriptive logical IDs for resources
const loggingBucket = new s3.Bucket(this, 'LoggingBucket', {
  // Always specify security configurations
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  enforceSSL: true,
});
```

## Security Best Practices

### S3 Security Standards
- **Encryption**: Always enable S3 server-side encryption
- **Public Access**: Block all public access by default
- **SSL**: Enforce SSL for all bucket operations
- **Bucket Policies**: Use least privilege principle with specific conditions

### IAM Policy Patterns
```typescript
// Use specific actions and resources
tagHandler.addToRolePolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['s3:GetBucketLogging', 's3:PutBucketLogging'],
  resources: ['*'] // Only when necessary
}));
```

### Service Principal Access
```typescript
// Always include account conditions for service principals
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

## Lambda Development Standards

### Inline Code Pattern
```typescript
// Use inline code for simple Lambda functions
const tagHandler = new lambda.Function(this, 'S3TagHandler', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  environment: {
    LOGGING_BUCKET: loggingBucket.bucketName
  },
  code: lambda.Code.fromInline(`
    // Inline implementation
  `)
});
```

### Environment Variables
- **Naming**: Use UPPER_CASE for environment variable names
- **References**: Pass CDK resource references as environment variables
- **Validation**: Always validate environment variables in Lambda code

### Error Handling
```javascript
// Always include comprehensive error handling
try {
  // AWS SDK operations
} catch (error) {
  console.error('Error handling bucket logging:', error);
}
```

## Testing Configuration

### Jest Setup Pattern
```javascript
// Standard Jest configuration for CDK projects
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
```

### Test Organization
- **Location**: Place tests in `test/` directory
- **Naming**: Use `.test.ts` suffix for test files
- **Environment**: Use Node.js test environment for CDK tests

## Configuration Management

### CDK Configuration
- **App Entry**: Use ts-node with TypeScript preference
- **Feature Flags**: Enable latest CDK features for best practices
- **Watch Mode**: Configure file watching for development efficiency

### Package Management
- **Lock Files**: Always commit package-lock.json
- **Versions**: Pin CDK versions for consistency
- **Scripts**: Provide standard npm scripts (build, watch, test, cdk)

## Documentation Standards

### Code Comments
```typescript
/** Use JSDoc for interface and class documentation */
export interface S3BucketLoggingAthenaStackProps extends cdk.StackProps {
  /** Enable CloudTrail integration for Lake Formation correlation */
  lakeformationEnabled?: boolean;
}
```

### Inline Documentation
```typescript
// Use single-line comments for implementation details
const lakeformationEnabled = props?.lakeformationEnabled ?? false;
```

### README Structure
- **Purpose**: Clear project purpose and value proposition
- **Architecture**: Visual diagrams and component descriptions
- **Setup**: Step-by-step deployment instructions
- **Usage**: Example queries and configuration options

## Resource Lifecycle Management

### Removal Policies
```typescript
// Provide configurable removal policies
const bucketRemovalPolicy = props?.bucketRemovalPolicy ?? cdk.RemovalPolicy.DESTROY;
```

### Lifecycle Rules
```typescript
// Implement automatic cleanup
lifecycleRules: [{
  id: 'DeleteOldLogs',
  enabled: true,
  expiration: logRetention
}]
```

## Event-Driven Architecture

### EventBridge Patterns
```typescript
// Use specific event patterns for targeted processing
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
```

### Conditional Resource Creation
```typescript
// Use conditional logic for optional components
if (lakeformationEnabled) {
  // Create CloudTrail and related resources
}
```

## Performance Optimization

### Glue Table Configuration
- **Partition Projection**: Always enable for time-series data
- **Storage Format**: Use appropriate input/output formats
- **SerDe Configuration**: Configure proper serialization libraries

### Query Optimization
- **Partitioning**: Implement date-based partitioning
- **Projection**: Use partition projection for cost optimization
- **Location Templates**: Use parameterized S3 locations