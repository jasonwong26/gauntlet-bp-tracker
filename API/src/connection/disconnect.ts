import { QueryInput, QueryOutput, AttributeMap, DeleteItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { Event, AsyncEventHandler } from "../_types";


interface Input {
  endPoint: string,
  connectionId: string,
  action: string
}

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new CrudDbClient();

// The $disconnect route is executed after the connection is closed.
// The connection can be closed by the server or by the client. As the connection is already closed when it is executed, 
// $disconnect is a best-effort event. 

export const handler: AsyncEventHandler<Event> = async event => {
  console.log("disconnecting...", { event });

  try {
    const input = mapToInput(event);
    await deleteFromDatabase(input);
  } catch (err) {
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: "Failed to disconnect:  " + JSON.stringify(err) };
  }

  console.log("...disconnected");
  return { statusCode: 200, body: "Disconnected." };
};
const mapToInput = (event: Event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;

  const input: Input = { action: "disconnect", connectionId, endPoint };
  return input;
};
const deleteFromDatabase: (input: Input) => Promise<void> = async input => {
  const connections = await fetchAllConnections(input);
  console.log("connections retrieved...", { connections });
  const deleteCalls = deleteAllConnections(connections);
  await Promise.all(deleteCalls);
};
const fetchAllConnections: (input: Input) => Promise<QueryOutput> = async input => {
  const indexName = "ByType"; // TODO: decide whether to make this an environment variable?
  const type = "Connection";
  const queryParams: QueryInput = {
    TableName: TABLE_NAME,
    IndexName: indexName,
    KeyConditionExpression: "#type = :type AND #typeSk = :typeSk",
    ExpressionAttributeNames: {
      "#type": "type",
      "#typeSk": "typeSk"
    },
    ExpressionAttributeValues: {
      ":type": type,
      ":typeSk": input.connectionId
    }
  };
  console.log("retrieving connections...", { queryParams });
  return await db.query(queryParams);
};
const deleteAllConnections = (connections: QueryOutput) => {
  if(!connections?.Items) return [];

  return connections.Items.map(async item => {
    await deleteConnectionFromDb(item);
  });  
};
const deleteConnectionFromDb = async (item: AttributeMap) => {
  const keys = {
    pk: item.pk,
    sk: item.sk
  };
  const deleteParams: DeleteItemInput = {
    TableName: TABLE_NAME, 
    Key: keys
  };
  console.log("deleting connection...", { deleteParams });
  await db.delete(deleteParams);
};
