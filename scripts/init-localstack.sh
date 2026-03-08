#!/bin/bash
set -e

echo "[init-localstack] Creating S3 bucket: infographic-studio"
awslocal s3 mb s3://infographic-studio
awslocal s3api put-bucket-cors --bucket infographic-studio --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"]
  }]
}'
echo "[init-localstack] Bucket ready."
