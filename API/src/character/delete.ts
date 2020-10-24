import { GetItemInput, PutItemInput, DeleteItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, DbCampaign, CharacterSummary, DbAlert, ActionAlert } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  character: CharacterSummary
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: string,
  character: CharacterSummary
}
interface Output extends Input {
  status: string
}

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("deleting character...", { event });

  try {
    const input = mapToInput(event);
    await deleteFromDatabase(input);
    const output: Output = {...input, status: "deleted" };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...character deleted");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign, character } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaign,
    character
  };

  return input;
};
const deleteFromDatabase = async (input: Input) => {
  const { campaign, character } = input;
  await updateCampaign(campaign, character);
  await deleteCharacter(campaign, character);
  await saveAlertToDatabase(campaign, character);

  return character;
};

// Update Campaign Document
const updateCampaign = async (campaignId: string, character: CharacterSummary) => {
  const doc = await getCampaignDocument(campaignId);
  const updatedCollection = removeCharacter(character, doc.campaign.characters);
  doc.campaign.characters = updatedCollection;
  await saveCampaignDocument(doc);
};
const getCampaignDocument = async (campaignId: string) => {
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: "Metadata"
  };
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: keys
  };  
  
  const dbLog = await db.get(getParams);
  if(!dbLog.Item) {
    throw new Error(`Campaign: ${campaignId} not found.`);
  }

  return dbLog.Item as DbCampaign;
};
const removeCharacter = (character: CharacterSummary, array: CharacterSummary[]) => {
  const output = [...array];

  const currentIndex = output.findIndex(c => c.id === character.id);
  if(currentIndex !== -1) {
    output.splice(currentIndex, 1);
  }

  return output;
};
const saveCampaignDocument = async (campaign: DbCampaign) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: campaign
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);

};

// Delete Character Document
const deleteCharacter = async (campaignId: string, character: CharacterSummary) => {
  await deleteCharacterDocument(campaignId, character.id);
};
const deleteCharacterDocument = async (campaignId: string, characterId: string) => {
  const deleteParams: DeleteItemInput = {
    TableName: TABLE_NAME, 
    Key: {
      pk: `Campaign#${campaignId}`,
      sk: `Character#${characterId}`
    }
  };

  console.log("deleting from table...", { deleteParams });
  await db.delete(deleteParams);
};

// Save Log entry to DB
const saveAlertToDatabase = async (campaignId: string, character: CharacterSummary) => {
  const alert = buildAlert();
  const alertDate = alert.alertDate;
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Alert#${alertDate}#DeleteCharacter#${character.id}`,
    type: "Alert#DeleteCharacter",
    typeSk: `${alertDate}#DeleteCharacter#Campaign#${campaignId}`
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
    action: "deletecharacteralert",
    alertDate: new Date().getTime(),
    description: "Character Deleted"
  };

  return alert;
};