# S3 Bucket Logging with Athena Analysis

## Project Purpose
This CDK project implements automated S3 server access logging with Athena analysis to monitor how Athena queries impact S3 costs. It provides comprehensive cost monitoring and optimization insights for data lake operations.

## Key Features

### Automated Logging Infrastructure
- **Event-Driven Configuration**: EventBridge automatically detects `analyse-logging=true` tag and enables S3 server access logging
- **Partitioned Log Format**: Optimized log storage with partitioned format for better query performance
- **Automatic Cleanup**: Configurable lifecycle policy automatically deletes old log files (default: 30 days)

### Cost Analysis & Monitoring
- **S3 Request Tracking**: Captures all S3 requests (GET, LIST operations) for detailed cost analysis
- **Athena Query Correlation**: Identifies expensive Athena queries by analyzing S3 request patterns
- **Performance Insights**: Provides breakdown of GET vs LIST operations per query

### Lake Formation Integration
- **CloudTrail Integration**: Optional correlation between CloudTrail events and S3 access logs
- **Query ID Tracking**: Links Athena query IDs with S3 operations for comprehensive analysis
- **Enhanced Correlation**: Detailed analysis of Lake Formation data access patterns

### Pre-configured Analytics
- **Glue Database**: Ready-to-use database with partition projection for optimal performance
- **Athena Tables**: Pre-configured tables for S3 access logs and CloudTrail events
- **Sample Queries**: Production-ready SQL queries for cost analysis and optimization

## Target Users

### Data Engineers
- Monitor and optimize data lake costs
- Analyze Athena query performance impact on S3
- Implement cost-effective data access patterns

### DevOps Teams
- Automate logging infrastructure deployment
- Monitor S3 access patterns across environments
- Implement cost governance for data operations

### Data Analysts
- Understand query cost implications
- Optimize data access patterns
- Generate cost reports and insights

## Use Cases

### Cost Optimization
- Identify expensive Athena queries by S3 request volume
- Analyze GET vs LIST operation ratios
- Optimize partition pruning and query patterns

### Performance Monitoring
- Track S3 request patterns over time
- Correlate query performance with S3 operations
- Monitor data access efficiency

### Compliance & Auditing
- Track all S3 access operations
- Correlate data access with user activities
- Generate audit reports for data governance

## Value Proposition
- **Automated Setup**: Zero-configuration logging activation via S3 bucket tagging
- **Cost Visibility**: Clear insights into how Athena queries drive S3 costs
- **Performance Optimization**: Data-driven approach to query and storage optimization
- **Scalable Architecture**: Handles high-volume logging with partition projection
- **Production Ready**: Includes security best practices and lifecycle management