## Bucket Deployment
- **S3 Bucket**: Stores static files with S3-managed encryption (SSE-S3)
- **Public Access Blocked**: Enforced SSL/TLS
- **Removal Policy**: Bucket and objects deleted on stack removal

## Static Content Deployment
- **Source**: Files from `../app/dist/static` deployed to S3
- **Destination**: Stored under prefix `static/` in the S3 bucket

## Origin Access Identity (OAI)
- **Access Restriction**:
  - CloudFront-OAI for read-only access
  - Public access blocked

## CloudFront Distribution
- **Default Behavior**:
  - No caching (`CACHING_DISABLED`)
  - HTTPS enforced
  - Allowed methods: `GET` and `HEAD`

## Route53 DNS Entry
- **A-Record**: Links subdomain to CloudFront distribution

## Accessing Static Files
- List all available files `https://gruppe6.dxfrontiers-ccs.de/`
- Accessible via `https://gruppe6.dxfrontiers-ccs.de/static/<FILENAME>`