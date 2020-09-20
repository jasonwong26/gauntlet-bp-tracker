import { PatchItemInput, PutItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, Campaign, DbAlert, ActionAlert } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  metadata: Campaign
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: string,
  metadata: Campaign
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("saving campaign...", { event });

  try {
    const input = mapToInput(event);
    await writeToDatabase(input);
    await service.send(input);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...campaign saved");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign, metadata } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaign,
    metadata
  };
  return input;
};
const writeToDatabase = async (input: Input) => {
  await saveToDb(input);
  await saveAlertToDatabase(input);
};
const saveToDb = async (input: Input) => {
  const { metadata } = input;
  const patchParams: PatchItemInput = { 
    TableName: TABLE_NAME, 
    Key: {
      pk: `Campaign#${input.campaign}`,
      sk: `Metadata`  
    },
    UpdateExpression: "set campaign.title = :title, campaign.description = :description, campaign.author = :author, campaign.authorEmail = :authorEmail",
    ExpressionAttributeValues: {
      ":title": metadata.title,
      ":description": metadata.description,
      ":author": metadata.author,
      ":authorEmail": metadata.authorEmail ?? null
    }
  }; 
  
  console.log("writing to table...", { patchParams });
  await db.patch(patchParams);
};

// Save Log entry to DB
const saveAlertToDatabase = async (input: Input) => {
  const { campaign: campaignId } = input;
  const alert = buildAlert();
  const alertDate = alert.alertDate;
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Alert#${alertDate}#UpdateCampaign`,
    type: "Alert#UpdateCampaign",
    typeSk: `${alertDate}#UpdateCampaign`
  };
  const item: DbAlert = { ...keys, alert };
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: item
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};
const buildAlert = () => {
  const alert: ActionAlert = {
    action: "updatecampaignalert",
    alertDate: new Date().getTime(),
    description: "Campaign Updated"
  };

  return alert;
};