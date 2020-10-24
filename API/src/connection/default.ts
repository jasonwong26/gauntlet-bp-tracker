import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string
}
interface Output {
  endPoint: string,
  connectionId: string,
  action: string,
  message?: string
}

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  try {
    console.log("input: ", event);
    const output = mapToOutput(event);
    output.message = "Error: The specified action does not exist.";
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  return { statusCode: 200, body: "Data sent." };
};
const mapToOutput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const output: Output = { 
    endPoint, 
    connectionId, 
    action
  };

  return output;
};
