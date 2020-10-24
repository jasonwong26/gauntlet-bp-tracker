import { WebSocketApiClient} from "./ApiClient/WebSocketApiClient";
import { Crud } from "./DbClient/CrudDbClient";
import { QueryInput, QueryOutput, DeleteItemInput, AttributeMap } from "./DbClient/_types";

interface SendService {
  send: (input: Input) => Promise<void>
}
interface Input { 
  endPoint: string,
  action: string,
  connectionId: string
}
type SendServiceFactory = (dbClient: Crud, tableName: string) => SendService;

export class BasicSendService implements SendService {
  db: Crud;
  tableName: string;

  constructor(dbClient: Crud, tableName: string) {
    if(!dbClient) throw new Error("DB Client must be specified");
    if(!tableName) throw new Error("DB Table must be specified");

    this.db = dbClient;
    this.tableName = tableName;
  }

  public send:SendService["send"] = async input => {
    const api = new WebSocketApiClient(input.endPoint, this.deleteConnectionFromDatabase);
    await api.send(input);
  }

  private deleteConnectionFromDatabase: (connectionId: string) => Promise<void> = async connectionId => {
    const connections = await this.fetchAllConnections(connectionId);
    console.log("connections retrieved...", { connections });
    const deleteCalls = this.deleteAllConnections(connections);
    await Promise.all(deleteCalls);
  }
  private fetchAllConnections: (connectionId: string) => Promise<QueryOutput> = async connectionId => {
    const indexName = "ByType";
    const type = "Connection";
    const queryParams: QueryInput = {
      TableName: this.tableName,
      IndexName: indexName,
      KeyConditionExpression: "#type = :type AND #typeSk = :typeSk",
      ExpressionAttributeNames: {
        "#type": "type",
        "#typeSk": "typeSk"
      },
      ExpressionAttributeValues: {
        ":type": type,
        ":typeSk": connectionId
      }
    };
    console.log("retrieving connections...", { queryParams });
    return await this.db.query(queryParams);
  }
  private deleteAllConnections = (connections: QueryOutput) => {
    if(!connections?.Items) return [];
  
    return connections.Items.map(async item => {
      await this.deleteConnectionFromDb(item);
    });  
  }
  private deleteConnectionFromDb = async (item: AttributeMap) => {
    const keys = {
      pk: item.pk,
      sk: item.sk
    };
    const deleteParams: DeleteItemInput = {
      TableName: this.tableName, 
      Key: keys
    };
    console.log("deleting connection...", { deleteParams });
    await this.db.delete(deleteParams);
  }
}

export const buildSendService: SendServiceFactory = (dbClient, tableName) => {
  return new BasicSendService(dbClient, tableName);
};