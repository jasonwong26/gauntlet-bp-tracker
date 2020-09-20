import { GetItemInput, PutItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, DbCampaign, CharacterSummary, DbCharacter, ActionAlert, DbAlert } from "../_types";
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

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("saving character...", { event });

  try {
    const input = mapToInput(event);
    const character = await writeToDatabase(input);
    const output: Input = {...input, character };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...character saved");
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
const writeToDatabase = async (input: Input) => {
  const { campaign, character } = input;
  await updateCampaign(campaign, character);
  await saveCharacter(campaign, character);
  await saveAlertToDatabase(campaign, character);

  return character;
};

// Update Campaign Document
const updateCampaign = async (campaignId: string, character: CharacterSummary) => {
  const doc = await getCampaignDocument(campaignId);
  const updatedCollection = mergeCharacters(character, doc.campaign.characters);
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
const mergeCharacters = (character: CharacterSummary, array: CharacterSummary[]) => {
  const output = [...array];

  const currentIndex = output.findIndex(c => c.id === character.id);
  const indexByName = output.findIndex(c => c.name > character.name);
  const targetIndex = indexByName !== -1 ? indexByName : output.length;

  // Insert
  if(currentIndex === -1) {
    output.splice(targetIndex, 0, character);
  } 
  // Update in place
  else if (currentIndex === targetIndex) {
    output.splice(targetIndex, 1, character);
  } 
  // Update and reorder
  else {
    output.splice(currentIndex, 1);
    output.splice(targetIndex, 0, character);
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

// Insert/Update Character Document
const saveCharacter = async (campaignId: string, character: CharacterSummary) => {
  const document = await getCharacterDocument(campaignId, character.id);

  // Insert
  if(!document) {
    const newDocument = createCharacterDocument(campaignId, character);
    await saveCharacterDocument(newDocument);
    return;
  }

  // Update
  const { history } = document.character;
  document.character = {...character, history };
  await saveCharacterDocument(document);
};
const getCharacterDocument = async (campaignId: string, characterId: string) => {
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: {
      pk: `Campaign#${campaignId}`,
      sk: `Character#${characterId}`
    }
  };  
  
  const response = await db.get(getParams);
  return response.Item as DbCharacter | undefined;
};
const createCharacterDocument = (campaignId: string, character: CharacterSummary) => {
  const document: DbCharacter = {
    pk: `Campaign#${campaignId}`,
    sk: `Character#${character.id}`,
    type: "Character",
    typeSk: character.id,
    character: {...character, history: []}
  };

  return document;
};
const saveCharacterDocument = async (character: DbCharacter) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: character
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};

// Save Log entry to DB
const saveAlertToDatabase = async (campaignId: string, character: CharacterSummary) => {
  const alert = buildAlert();
  const alertDate = alert.alertDate;
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Alert#${alertDate}#UpdateCharacter#${character.id}`,
    type: "Alert#UpdateCharacter",
    typeSk: `${alertDate}#UpdateCharacter#Campaign#${campaignId}`
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
    action: "updatecharacteralert",
    alertDate: new Date().getTime(),
    description: "Character Updated"
  };

  return alert;
};