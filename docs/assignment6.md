# Assignment 6

## Web Application Firewall (WAF) Integration

### WAF Configuration (Task 39)
- **WAF Stack Setup**
  - WAF in us-east-1 (CloudFront requirement)
  - Global scope for CloudFront protection
  - Default allow policy with specific block rules

- **Implemented Rules**
  - Rate Limit Rule: Blocks more than 100 requests per IP
  - AWS Managed Common Rule Set: Includes NoUserAgent_Header rule

### CloudFront Integration (Task 40)
- **Distribution Configuration**
  - WebACL attached to CloudFront distribution
  - Cross-region references enabled
  - Traffic filtering based on WAF rules

### Security Effects
- Protection against DDoS through rate limiting
- Blocking of requests without user agent headers
- Request sampling for security analysis
- CloudWatch metrics for security monitoring
