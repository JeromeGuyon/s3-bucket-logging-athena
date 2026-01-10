# Technology Stack

## Programming Languages

### TypeScript (Primary)
- **Version**: ~5.9.3
- **Target**: ES2022 with NodeNext module resolution
- **Usage**: All CDK infrastructure code and Lambda functions
- **Configuration**: Strict type checking enabled with comprehensive compiler options

### JavaScript (Generated)
- **Purpose**: Compiled output from TypeScript source
- **Runtime**: Node.js for Lambda execution and CDK deployment

## Framework and Libraries

### AWS CDK (Cloud Development Kit)
- **CDK Version**: 2.1033.0
- **CDK Lib Version**: 2.233.0
- **Constructs Version**: ^10.0.0
- **Purpose**: Infrastructure as Code framework for AWS resource provisioning

### AWS SDK v3
- **@aws-sdk/client-s3**: ^3.964.0 - S3 operations in Lambda function
- **@aws-sdk/client-cloudtrail**: ^3.964.0 - CloudTrail management
- **@aws-sdk/client-resource-groups-tagging-api**: ^3.964.0 - Resource tagging queries

### Development Dependencies
- **TypeScript**: ~5.9.3 - Language compiler
- **ts-node**: ^10.9.2 - TypeScript execution for development
- **Jest**: ^29.7.0 - Testing framework
- **ts-jest**: ^29.2.5 - TypeScript integration for Jest
- **@types/jest**: ^29.5.14 - Jest type definitions
- **@types/node**: ^24.10.1 - Node.js type definitions

## Build System

### TypeScript Compilation
```json
{
  "target": "ES2022",
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "strict": true,
  "declaration": true,
  "skipLibCheck": true
}
```

### CDK Configuration
- **App Entry**: `npx ts-node --prefer-ts-exts bin/s3-bucket-logging-athena.ts`
- **Watch Mode**: Monitors TypeScript files for changes
- **Context**: Extensive feature flags for CDK behavior control

## Development Commands

### Build and Compilation
```bash
npm run build          # Compile TypeScript to JavaScript
npm run watch          # Watch mode compilation
```

### Testing
```bash
npm run test           # Run Jest test suite
```

### CDK Operations
```bash
npm run cdk            # CDK CLI commands
npx cdk deploy         # Deploy stack to AWS
npx cdk diff           # Compare deployed vs current state
npx cdk synth          # Generate CloudFormation template
```

### Package Management
```bash
npm install            # Install dependencies
```

## AWS Services Integration

### Core AWS Services
- **Amazon S3**: Server access logging and log storage
- **AWS Glue**: Data catalog with databases and tables
- **Amazon Athena**: SQL query engine for log analysis
- **Amazon EventBridge**: Event-driven automation triggers
- **AWS Lambda**: Serverless function execution
- **AWS CloudTrail**: API call logging for Lake Formation

### CDK Constructs Used
- **aws-cdk-lib/aws-s3**: S3 bucket and policy management
- **aws-cdk-lib/aws-glue**: Glue database and table definitions
- **aws-cdk-lib/aws-events**: EventBridge rule configuration
- **aws-cdk-lib/aws-events-targets**: Lambda function targets
- **aws-cdk-lib/aws-iam**: IAM roles and policies
- **aws-cdk-lib/aws-cloudtrail**: CloudTrail configuration
- **aws-cdk-lib/aws-lambda-nodejs**: Node.js Lambda functions

## Runtime Environment

### Lambda Runtime
- **Runtime**: Node.js (latest supported version via CDK)
- **Architecture**: x86_64
- **Memory**: Default CDK allocation
- **Timeout**: Default CDK timeout

### CDK Context Features
Extensive feature flags enabled for:
- Security best practices (SSL enforcement, public access blocking)
- Performance optimizations (partition projection, lifecycle policies)
- Compliance features (resource tagging, audit trails)

## Development Environment

### IDE Configuration
- **TypeScript Support**: Full IntelliSense and type checking
- **CDK Integration**: Construct library autocompletion
- **Jest Integration**: Test runner and debugging support

### Code Quality
- **Strict TypeScript**: No implicit any, strict null checks
- **Type Safety**: Full type coverage for AWS SDK operations
- **Error Handling**: Comprehensive error handling in Lambda functions

## Deployment Architecture

### Infrastructure Deployment
- **CDK Bootstrap**: Required for CDK asset deployment
- **CloudFormation**: Generated templates for resource provisioning
- **Asset Management**: Lambda code bundling and S3 asset storage

### Configuration Management
- **Environment Variables**: Runtime configuration via CDK context
- **Parameter Validation**: Type-safe configuration through interfaces
- **Resource Naming**: Configurable resource names for multi-environment support

## Performance Considerations

### Partition Projection
- **Date-based Partitioning**: Automatic partition discovery for time-series data
- **Bucket-based Partitioning**: Separate partitions per S3 bucket
- **Query Optimization**: Reduced scan times through effective partitioning

### Lambda Optimization
- **Cold Start Minimization**: Efficient import patterns
- **Memory Allocation**: Appropriate sizing for S3 and CloudTrail operations
- **Error Handling**: Robust error handling with proper logging