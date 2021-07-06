# Running a local DynamoDb instance via Docker

## Setup Instructions
1. Download and install Docker on your computer [link](https://docs.docker.com/get-docker/)
1. Download and install AWS CLI on your computer [link](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
1. Setup docker-compose.yml
   NOTES:
     - maps to public port 8042 for database traffic - e.g. endpoint: `http://localhost:8042`
```
version: '3.8'
services:
  dynamodb-local:
    command: "-jar DynamoDBLocal.jar -sharedDb -optimizeDbBeforeStartup -dbPath ./data"
    image: "amazon/dynamodb-local:latest"
    container_name: dynamodb-local
    ports:
      - "8042:8000"
    volumes:
      - "./docker/dynamodb:/home/dynamodblocal/data"
    working_dir: /home/dynamodblocal
```
1. Start the docker instance: `docker-compose up -d` (start docker in detached mode)

### Database setup steps (to convert to automated script)
1. Set up table
```
# List local tables
aws dynamodb --endpoint-url http://localhost:8042 list-tables
# Create local table from file
aws dynamodb --endpoint-url http://localhost:8042 create-table --table-name demo --cli-input-json file://docker-settings/local-table.json
# Delete local table by name
aws dynamodb --endpoint-url http://localhost:8042 delete-table --table-name demo

# insert seed data
aws dynamodb --endpoint-url http://localhost:8042 put-item --table-name demo --item file://docker-settings/settings-record.json
```

## Example setup for connecting client to local database:
```

const opts = {endpoint: "http://localhost:8042"};
const client = new DynamoDB.DocumentClient(opts);
expect(client).toBeInstanceOf(DynamoDB.DocumentClient);
const asRecord = client as Record<any,any>;
var endpoint = new Endpoint(testEndpoint);
expect(asRecord.service.endpoint).toEqual(endpoint);
```


## Reference
- [Deploying DynamoDB Locally to your Computer](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)
- [How to Set Up a Local DynamoDB in a Docker Container](https://betterprogramming.pub/how-to-set-up-a-local-dynamodb-in-a-docker-container-and-perform-the-basic-putitem-getitem-38958237b968)