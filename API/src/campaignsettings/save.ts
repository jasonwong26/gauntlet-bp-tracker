import { GetItemInput, PutItemInput, AttributeMap } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, CampaignSettings, DbCampaignSettings, ActionAlert, DbAlert } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  settings: CampaignSettings
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: string,
  settings: CampaignSettings
}

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("saving settings...", { event });

  try {
    const input = mapToInput(event);
    const exists = await existsInDatabase(input);
    if(!exists) throw new Error("Campaign not found...");
    await writeToDatabase(input);
    await saveAlertToDatabase(input);
    await service.send(input);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...settings saved");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign, settings } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaign,
    settings
  };

  return input;
};
const existsInDatabase = async (input: Input) => {
  const keys = {
    pk: `Campaign#${input.campaign}`,
    sk: "Settings"
  };
  return await existsInDb(keys);
};
const existsInDb = async (keys: AttributeMap) => {
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: keys
  };  

  const response = await db.get(getParams);
  return !!response.Item;
};
const writeToDatabase = async (input: Input) => {
  await saveToDb(input);
};
const saveToDb = async (input: Input) => {
  const { settings } = input;

  const item: DbCampaignSettings = {
    pk: `Campaign#${input.campaign}`,
    sk: "Settings",
    type: "Campaign#Settings",
    typeSk: input.campaign,
    settings
};
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: item
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};

const saveAlertToDatabase: (input: Input) => Promise<void> = async input => {
  const { campaign } = input;
  const alert = mapToAlert(input);
  const keys = {
    pk: `Campaign#${campaign}`,
    sk: `Alert#${alert.alertDate}#EditSettings`,
    type: "Alert#EditSettings",
    typeSk: `${alert.alertDate}#EditSettings`
  };
  const item: DbAlert = { ...keys, alert };
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: item
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};
const mapToAlert: (input: Input) => ActionAlert = () => {
  const alert: ActionAlert = {
    action: "settingseditalert",
    alertDate: new Date().getTime(),
    description: "Campaign Settings changed."
  };

  return alert;
};
