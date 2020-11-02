import { ApiGatewayManagementApi } from "aws-sdk";

export interface ApiClient {
  send: (input: Input) => Promise<void>
  setOnStaleConnectionBehavior: (callback: onStaleConnectionCallback) => void
}
interface Input { 
  action: string,
  connectionId: string
}
type onStaleConnectionCallback = (connectionId: string) => Promise<void>;
type PostToConnectionRequest = ApiGatewayManagementApi.Types.PostToConnectionRequest;
type ApiClientFactory = (endPoint: string, onStaleConnection?: onStaleConnectionCallback) => ApiClient;

export class WebSocketApiClient implements ApiClient {
  private api: ApiGatewayManagementApi;
  private onStaleConnection: onStaleConnectionCallback | null;

  constructor(api: ApiGatewayManagementApi, onStaleConnection: onStaleConnectionCallback | null = null) {
    if(!api) throw new Error("api must be provided");

    this.api = api
    this.onStaleConnection = onStaleConnection;
  }

  public send: ApiClient["send"] = async input => {
    try {
      await this.sendToConnection(input);
    } catch (e) {
      if (e.statusCode === 410 && this.onStaleConnection) {
        console.log(`Found stale connection, deleting connection: ${input.connectionId}`);
        await this.onStaleConnection(input.connectionId)
      } else {
        throw e;
      }
    }
  }
  private sendToConnection: (input: Input) => Promise<void> = async input => {
    const data = JSON.stringify(input);
    const postRequest: PostToConnectionRequest = {
      ConnectionId: input.connectionId, 
      Data: data
    };
    
    await this.api.postToConnection(postRequest).promise();
  }

  public setOnStaleConnectionBehavior: ApiClient["setOnStaleConnectionBehavior"] = input => {
    this.onStaleConnection = input;
  }
}

export const buildApiClient: ApiClientFactory = (endPoint, onStaleConnection = undefined) => {
  if(!endPoint) throw new Error("endPoint must be specified");

  const api = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: endPoint
  });
  const client = new WebSocketApiClient(api, onStaleConnection);

  return client;
};
