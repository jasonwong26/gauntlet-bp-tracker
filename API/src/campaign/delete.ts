
import { QueryOutput, AttributeMap, QueryInput, BatchWriteItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: string
}
interface Output extends Input {
  status: string
}

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("deleting campaign...", { event });

  try {
    const input = mapToInput(event);
    await deleteFromDatabase(input);
    const status = "deleted";
    const output: Output = {...input, status };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...campaign deleted");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaign
  };
  return input;
};
const deleteFromDatabase: (input: Input) => Promise<void> = async input => {
  const documents = await fetchAllDocuments(input);
  console.log("documents retrieved...", { count: documents.length });
  const deleteCalls = deleteAllDocuments(documents);
  await Promise.all(deleteCalls);
};
const fetchAllDocuments: (input: Input) => Promise<AttributeMap[]> = async input => {
  const documents = [];
  let results = await fetchDocumentKeys(input);
  if(results.Items) {
    documents.push(...results.Items);
  }

  while(results.LastEvaluatedKey) {
    results = await fetchDocumentKeys(input, results.LastEvaluatedKey);
    documents.push(results.Items ?? []);
  }

  return documents;
}; 
const fetchDocumentKeys: (input: Input, lastEvaluatedKey?: AttributeMap) => Promise<QueryOutput> = async (input, lastEvaluatedKey) => {
  const queryParams: QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: {
      "#pk": "pk"
    },
    ExpressionAttributeValues: {
      ":pk": `Campaign#${input.campaign}`
    },
    ExclusiveStartKey: lastEvaluatedKey,
    ProjectionExpression: "pk, sk"
  };

  return await db.query(queryParams);
};
const deleteAllDocuments = (documents: AttributeMap[]) => {
  const batches = splitToBatches(documents, 25); // 25 is the limit for batch deletes in DynamoDb
  return batches.map(async batch => {
    await deleteBatchFromDb(batch);
  });  
};
const splitToBatches: (keys: AttributeMap[], size: number) => AttributeMap[][] = (keys, size) => {
  const batches = [];
  let i = 0;
  const n = keys.length;

  while (i < n) {
    batches.push(keys.slice(i, i += size));
  }

  return batches;
};
const deleteBatchFromDb = async (keys: AttributeMap[]) => {
  const deletes = keys.map(key => {
    return { DeleteRequest: { Key: key } };
  });

  const input: BatchWriteItemInput = {
    RequestItems: 
      {
        [TABLE_NAME]: deletes
      }   
  };
  await db.batchWrite(input);
};
