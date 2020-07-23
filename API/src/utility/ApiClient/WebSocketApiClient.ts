import { ApiGatewayManagementApi } from "aws-sdk";

export interface ApiClient {
  send: (input: Input) => Promise<void>
  setOnStaleConnectionBehavior: (callback: onStaleConnectionCallback) => void
}
interface Input { 
  action: string,
  connectionId: string, 
  [key:string]: any 
}
type onStaleConnectionCallback = (connectionId: string) => Promise<void>;
type PostToConnectionRequest = ApiGatewayManagementApi.Types.PostToConnectionRequest;

export class WebSocketApiClient implements ApiClient {
  private api: ApiGatewayManagementApi;
  private onStaleConnection: onStaleConnectionCallback | null;

  constructor(endPoint: string, onStaleConnection: onStaleConnectionCallback | null = null) {
    if(!endPoint) throw new Error("endPoint must be specified");

    this.api = new ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endPoint
    });
    this.onStaleConnection = onStaleConnection;
  }

  public send: ApiClient["send"] = async input => {
    try {
      await this.sendToConnection(input);
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting connection: ${input.connectionId}`);
        // tslint:disable-next-line:no-unused-expression
        await !!this.onStaleConnection && this.onStaleConnection!(input.connectionId);
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
