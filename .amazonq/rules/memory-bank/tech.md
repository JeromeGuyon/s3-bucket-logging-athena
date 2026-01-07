# Technology Stack

## Programming Languages

### TypeScript (Primary)
- **Version**: ~5.9.3
- **Usage**: CDK infrastructure code, Lambda functions
- **Configuration**: Strict TypeScript settings via tsconfig.json

### JavaScript
- **Usage**: Jest test configuration, build scripts
- **Node.js Runtime**: Compatible with AWS Lambda Node.js 18.x

## Framework & Libraries

### AWS CDK (Cloud Development Kit)
- **CDK Version**: 2.1033.0
- **CDK Lib Version**: 2.233.0
- **Constructs**: ^10.0.0
- **Purpose**: Infrastructure as Code framework

### AWS SDK
- **@aws-sdk/client-s3**: ^3.964.0
- **Usage**: S3 operations in Lambda functions
- **Runtime**: Node.js 18.x Lambda runtime

## Development Dependencies

### Build Tools
```json
{
  "typescript": "~5.9.3",
  "ts-node": "^10.9.2",
  "aws-cdk": "2.1033.0"
}
```

### Testing Framework
```json
{
  "@types/jest": "^29.5.14",
  "jest": "^29.7.0",
  "ts-jest": "^29.2.5"
}
```

### Type Definitions
```json
{
  "@types/node": "^24.10.1"
}
```

## Build System

### NPM Scripts
```json
{
  "build": "tsc",           // TypeScript compilation
  "watch": "tsc -w",        // Watch mode compilation
  "test": "jest",           // Run unit tests
  "cdk": "cdk"             // CDK CLI commands
}
```

### TypeScript Configuration
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Source Maps**: Enabled for debugging

### Jest Configuration
- **Environment**: Node.js
- **Test Pattern**: `**/*.test.ts`
- **Transform**: ts-jest for TypeScript
- **Root Directory**: `<rootDir>/test`

## AWS Services Integration

### Core Services
- **Amazon S3**: Storage and access logging
- **AWS Glue**: Data catalog and tables
- **Amazon Athena**: Query engine (implicit)
- **AWS EventBridge**: Event-driven automation
- **AWS Lambda**: Serverless processing
- **AWS IAM**: Access control and permissions

### Optional Services
- **AWS CloudTrail**: Audit logging (Lake Formation integration)
- **AWS Lake Formation**: Data lake governance

## Development Commands

### Build & Compilation
```bash
npm run build          # Compile TypeScript to JavaScript
npm run watch          # Watch for changes and auto-compile
```

### Testing
```bash
npm run test           # Run Jest unit tests
npm test              # Alternative test command
```

### CDK Operations
```bash
npx cdk deploy         # Deploy stack to AWS
npx cdk diff          # Compare deployed vs current state
npx cdk synth         # Generate CloudFormation template
npx cdk destroy       # Remove deployed resources
```

### Package Management
```bash
npm install           # Install dependencies
npm ci               # Clean install (CI/CD)
npm update           # Update dependencies
```

## Configuration Files

### CDK Configuration (`cdk.json`)
- **App Entry**: `npx ts-node --prefer-ts-exts bin/s3-bucket-logging-athena.ts`
- **Watch Settings**: File monitoring for hot reload
- **Feature Flags**: Latest CDK features enabled
- **Context**: AWS-specific configuration options

### TypeScript Configuration (`tsconfig.json`)
- **Compiler Options**: Strict type checking
- **Module Resolution**: Node.js style
- **Output Directory**: Compiled JavaScript location

### Jest Configuration (`jest.config.js`)
- **Test Environment**: Node.js
- **File Patterns**: TypeScript test files
- **Transform**: ts-jest for TypeScript support

## Runtime Environment

### AWS Lambda Runtime
- **Runtime**: Node.js 18.x
- **Handler**: index.handler
- **Environment Variables**: LOGGING_BUCKET
- **Inline Code**: S3 SDK operations

### CDK Deployment
- **CloudFormation**: Generated templates
- **Stack Management**: Single stack deployment
- **Resource Naming**: CDK-generated logical IDs
- **Cross-References**: Automatic resource dependencies

## Version Compatibility

### Node.js
- **Minimum**: Node.js 16.x (CDK requirement)
- **Recommended**: Node.js 18.x (Lambda runtime)
- **Package Manager**: npm (lockfile: package-lock.json)

### AWS CDK
- **Framework**: CDK v2 (latest stable)
- **Constructs**: L2 constructs for AWS services
- **Feature Flags**: Latest CDK features enabled

### AWS SDK
- **Version**: v3 (modular SDK)
- **Client**: S3 client for bucket operations
- **Compatibility**: Node.js 18.x Lambda runtime

## Development Environment Setup

### Prerequisites
```bash
# Install Node.js 18.x
# Install AWS CLI and configure credentials
# Install CDK CLI globally
npm install -g aws-cdk
```

### Project Setup
```bash
# Clone repository
# Install dependencies
npm install

# Verify setup
npm run build
npm run test

# Deploy to AWS
npx cdk deploy
```

### IDE Configuration
- **TypeScript**: Language server support
- **ESLint**: Code quality (if configured)
- **Prettier**: Code formatting (if configured)
- **AWS Toolkit**: CDK and AWS integration