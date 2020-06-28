
sam package \
    --template-file template.yaml \
    --output-template-file deploy/packaged.yaml \
    --s3-bucket developer-mouse-sam-gauntlet-bp-tracker-devops

sam deploy \
    --template-file deploy/packaged.yaml \
    --stack-name gauntlet-bp-tracker-table-dev \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides TableName=gauntlet_bp_tracker_dev ProjectName=gauntlet_bp_tracker
