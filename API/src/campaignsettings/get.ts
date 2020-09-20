import { GetItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, CampaignSettings, DbCampaignSettings } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaignId: string
}
interface Output extends Input {
  settings?: CampaignSettings
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("getting campaign settings...", { event });

  try {
    const input = mapToInput(event);
    const dbSettings = await getFromDatabase(input);
    const output: Output = {...input, settings: dbSettings?.settings };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...campaign settings retrieved");
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
    campaignId: campaign
  };
  return input;
};
const getFromDatabase: (input: Input) => Promise<DbCampaignSettings | undefined> = async input => {
  const { campaignId: campaign } = input;
  const keys = {
    pk: `Campaign#${campaign}`,
    sk: "Settings"
  };
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: keys
  };  
  
  const dbLog = await db.get(getParams);
  if(!dbLog.Item) {
    return undefined;
  }

  return dbLog.Item as DbCampaignSettings;
};
