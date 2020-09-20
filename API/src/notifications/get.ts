import { QueryInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, PurchaseAlert } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  minDate: number,
  maxDate: number,
  pageSize?: number
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaignId: string
  minDate: number,
  maxDate: number,
  pageSize: number
}
interface Output extends Input {
  alerts: PurchaseAlert[]
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("getting character...", { event });

  try {
    const input = mapToInput(event);
    const alerts = await getFromDatabase(input);
    const output: Output = {...input, alerts };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...character retrieved");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign, minDate, maxDate, pageSize } = request;
  if(!!pageSize && (pageSize < 1 || pageSize > 1000)) {
    throw new ValidationError(`specified pageSize of ${pageSize} is invalid.  Must be a value between 1 and 1000.`);
  }
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaignId: campaign,
    minDate,
    maxDate,
    pageSize: pageSize || 50
  };
  return input;
};
const getFromDatabase: (input: Input) => Promise<PurchaseAlert[]> = async input => {
  const { campaignId, minDate, maxDate, pageSize } = input;
  const queryParams: QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk and sk between :minSk and :maxSk",
    FilterExpression: "#type = :addType or #type = :removeType",
    ExpressionAttributeNames: {
      "#type": "type"
    },
    ExpressionAttributeValues: {
      ":pk": `Campaign#${campaignId}`,
      ":minSk": `Alert#${minDate}#`,
      ":maxSk": `Alert#${maxDate}$`,
      ":addType": "Alert#AddItem",
      ":removeType": "Alert#RemoveItem"
    },
    ProjectionExpression: "alert",
    ScanIndexForward: false,
    Limit: pageSize
  };

  const results = new Array<PurchaseAlert>();
  const queryResponse = await db.query(queryParams);
  queryResponse.Items?.map(x => results.push(x.alert as PurchaseAlert));

  return results;
};
