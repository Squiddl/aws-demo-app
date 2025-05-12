# CCS WS24/25 - Assignment 4

## AWS Fargate Application Deployment with Load Balancer

### Security Groups
- **Database Security Group**
    - Imported from existing security group ID
- **Application Security Group**
    - New security group for the demo application
    - Configured with egress rules to access database on port 5432

### Container Configuration
- **Docker Image**
    - Built from local application directory
    - Platform: Linux AMD64
    - Configuration for debugging and host management
    - Secrets in AWS Secrets Manager

### Fargate Service
- **ApplicationLoadBalancedFargateService**
    - CPU: 512 units
    - Memory: 1024 MiB
    - Public load balancer with HTTPS
    - Container port: 8000
    - Integrated with AWS CloudWatch logging

### Load Balancer
- **Application Load Balancer**
    - HTTPS protocol
    - SSL/TLS certificate integration
    - Custom health check configuration
