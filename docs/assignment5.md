


# CCS WS24/25 - Assignment 5

## AWS Lambda Database Initialization and Control

### Lambda Function Creation (Tasks 31-33)
- **Docker Lambda Function**
    - Created from Dockerfile.lambda in application directory
    - Platform: Linux AMD64
    - Deployed in private subnet with egress
    - Connected to application VPC
    - Database access via port 5432

- **Environment Configuration**
    - Debug mode enabled
    - Allowed hosts from domain name
    - Configured secret names for app and database
    - Full secrets manager access for both app and DB secrets

- **Security Groups**
    - New security group for Lambda function
    - Configured with database access
    - Full outbound access enabled
    - Inbound rules added to database security group

### Database Management (Task 34)
- **Migration Process**
    - Custom resource for Lambda invocation
    - Migration command execution
    - Initial database schema setup
    - Dependency chain implementation

- **Data Loading**
    - Fixture loading after successful migration
    - Dependency on migration completion
    - Path configuration for initial data
    - Physical resource ID management

### Lambda Invocation Control (Tasks 35-36)
- **Custom Resource Configuration**
    - RequestResponse invocation type
    - 15-minute timeout configuration
    - JSON payload handling
    - Status code and payload output paths

- **IAM Configuration**
    - Lambda invocation permissions
    - Resource-specific policy statements
    - Function ARN access control
    - Allow effect for invoke actions