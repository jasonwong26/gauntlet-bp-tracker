import * as shortid from "shortid";

import { GetItemInput, PutItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, Campaign, DbCampaign, Character, CharacterSummary, DbCharacter, DbCampaignSettings, CampaignSettings, DbAlert, ActionAlert } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: Campaign
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: Campaign
}
interface Output extends Input {
  campaign: Campaign
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("creating campaign...", { event });

  try {
    const input = mapToInput(event);
    const campaign = await writeToDatabase(input);
    const output: Output = {...input, campaign };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...campaign created");
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
    campaign
  };
  return input;
};
const writeToDatabase: (input:Input) => Promise<Campaign> = async (input: Input) => {
  const campaignId = await generateCampaignId();
  const entry = createEntry(campaignId, input);
  await saveToDb(entry);
  await cloneSettingsTemplate(entry);
  await createCharacters(entry);
  await saveAlertToDatabase(entry);

  return entry.campaign;
};

// Create Campaign in DB
const generateCampaignId: () => Promise<string> = async () => {
  let campaignId = "";
  let isAvailable = false;

  while(!isAvailable) {
    campaignId = shortid.generate();
    isAvailable = await isAvailableId(campaignId);
  }

  return campaignId;
};
const isAvailableId: (id: string) => Promise<boolean> = async id => {
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: {
      pk: `Campaign#${id}`,
      sk: "Metadata"  
    }
  };  

  const dbResponse = await db.get(getParams);
  return !dbResponse.Item;
};
const createEntry: (campaignId: string, input: Input) => DbCampaign = (campaignId, input) => {
  const { campaign } = input;
  campaign.id = campaignId;

  const output: DbCampaign = {
    pk: `Campaign#${campaignId}`,
    sk: `Metadata`,
    type: "Campaign#Metadata",
    typeSk: `${campaignId}`,
    campaign
  };

  return output;
};
const saveToDb = async (input: DbCampaign) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: input
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};

// Save Settings to DB
const cloneSettingsTemplate = async (input: DbCampaign) => {
  const template = await fetchSettingsTemplate();
  const settings = createSettingsEntry(input.campaign.id, template);
  await saveSettingsToDb(settings);
};
const fetchSettingsTemplate = async () => {
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: {
      pk: "Templates",
      sk: "Settings"
    }
  };  
  
  const response = await db.get(getParams);
  if(!response.Item) {
    throw new Error("Template Settings document not found.");
  }

  const template = response.Item as DbCampaignSettings;
  return template.settings;
};
const createSettingsEntry = (campaignId: string, settings: CampaignSettings) => {
  const output: DbCampaignSettings = {
    pk: `Campaign#${campaignId}`,
    sk: "Settings",
    type: "Campaign#Settings",
    typeSk: campaignId,
    settings
  };

  return output;
};
const saveSettingsToDb = async (input: DbCampaignSettings) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: input
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};

// Save Characters to DB
const createCharacters = async (input: DbCampaign) => {
  const { campaign } = input;
  const characterCalls = campaign.characters.map(async summary => {
    const character = mapToDbCharacter(campaign.id, summary);
    await addCharacterToDb(character);
  });
  await Promise.all(characterCalls);
};
const mapToDbCharacter = (campaignId: string, summary: CharacterSummary) => {
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Character#${summary.id}`,
    type: "Character",
    typeSk: `${summary.id}`
  };
  const character: Character = { ...summary, history: [] };
  const dbCharacter: DbCharacter = {...keys, character };

  return dbCharacter;
};
const addCharacterToDb = async (character: DbCharacter) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: character
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};

// Save Log entry to DB
const saveAlertToDatabase = async (input: DbCampaign) => {
  const { campaign } = input;
  const campaignId = campaign.id;
  const alert = buildAlert();
  const alertDate = alert.alertDate;
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Alert#${alertDate}#CreateCampaign`,
    type: "Alert#CreateCampaign",
    typeSk: `${alertDate}#CreateCampaign`
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
    action: "createcampaignalert",
    alertDate: new Date().getTime(),
    description: "Campaign Created"
  };

  return alert;
};