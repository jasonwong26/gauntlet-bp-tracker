import { EventHandler, SocketService, WebSocketService } from "../../utility";
import { Notification } from "../../components/Toast";
import { AlertRequest, Campaign, CampaignSettings, Character, CharacterSummary, PurchaseAlert, PurchasedItem } from "../../types";

interface BaseInput {
  action: string,
  [key: string]: unknown
}

type EventMapper<T> = (event: { [key: string]: unknown }) => T;
type SuccessHandler<T> = (input: T) => void; 

const actions = {
  subscribe: "subscribe",
  unsubscribe: "unsubscribe",
  getCampaign: "getcampaign",
  createCampaign: "createcampaign",
  updateCampaign: "updatecampaign",
  deleteCampaign: "deletecampaign",
  getSettings: "getcampaignsettings",
  saveSettings: "savecampaignsettings",
  getCharacter: "getcharacter",
  saveCharacter: "savecharacter",
  deleteCharacter: "deletecharacter",
  getNotifications: "getnotifications",
  addItem: "additem",
  removeItem: "removeitem"
};
const apiHost = process.env.REACT_APP_API_HOST || "";

const getEndpoint = () => {
  return `wss://${apiHost}`;
};

export class CampaignStorageService {
  id?: string;
  service: SocketService;

  constructor () {
    const endpoint = getEndpoint();
    this.service = new WebSocketService(endpoint);
  }

  public isConnected = () => {
    return this.service.isConnected();
  }

  public connect = async (campaign?: string) => {
    await this.service.connect();
    
    if(!campaign) return;
    this.id = campaign;
    await this.subscribeToCampaign(campaign);
  }
  private subscribeToCampaign = async(campaign: string) => {
    const input = { action: actions.subscribe, campaign };
    return await this.executeAction(input);
  }
  executeAction = async <T extends BaseInput>(input: T) => {
    const successPromise = new Promise<void>((resolve, reject) => {
      const eventHook: EventHandler = () => {
        try {
          this.service.unsubscribe(input.action, eventHook);
          resolve();

        } catch(error) {
          reject(error);
        }
      };

      this.service.subscribe(input.action, eventHook);
    });
    const errorPromise = this.sleep<void>(30 * 1000, () => {
      throw new Error("Server not responding!");
    });

    console.log(`triggering action: ${input.action}...`, input);
    await this.service.send(input);
    return await Promise.race([successPromise, errorPromise]);
  }
  sleep = async <T>(ms: number, fn: Function, ...args: unknown[]) => {
    await this.timeout(ms);
    return fn(...args) as T;
  }
  timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  public unsubscribeFromCampaign = async (campaign = this.id) => {
    const input = { action: actions.unsubscribe, campaign };
    return await this.executeAction(input);
  }

  public subscribeToAlerts = async (handler: SuccessHandler<Notification>) => {
    await this.service.subscribe("additemalert", event => {    
      const alert = event as unknown as PurchaseAlert;
      const action = alert.item.points > 0 ? "earned" : "purchased";
      const notification: Notification = {
        key: alert.item.key,
        title: alert.character.name,
        message: `${action} ${alert.item.description}`,
        imageUrl: alert.character.avatarUrl
      };
      handler(notification);
    });
    await this.service.subscribe("removeitemalert", event => {
      const alert = event as unknown as PurchaseAlert;
      const notification: Notification = {
        key: `${alert.alertDate}-${alert.character.id}-${alert.item.id}`,
        title: alert.character.name,
        message: `removed ${alert.item.description}`,
        imageUrl: alert.character.avatarUrl
      };
      handler(notification);
    });
  }

  public getCampaign = async (campaign = this.id) => {
    const input = { action: actions.getCampaign, campaign };
    const mapper: EventMapper<Campaign> = event => {
      const { campaign } = event;
      return campaign as Campaign;
    };

    return await this.executeFunction(input, mapper);
  }
  executeFunction = async <Tinput extends BaseInput, Toutput>(input: Tinput, mapper: EventMapper<Toutput>) => {
    const successPromise = new Promise<Toutput>((resolve, reject) => {
      const eventHook: EventHandler = event => {
        try {
          const output = mapper(event);

          console.log(`action completed: ${input.action}...`, event);
          this.service.unsubscribe(input.action, eventHook);
          resolve(output);

        } catch(error) {
          reject(error);
        }
      };

      this.service.subscribe(input.action, eventHook);
    });
    const errorPromise = this.sleep<Toutput>(30 * 1000, () => {
      throw new Error("Server not responding!");
    });

    console.log(`triggering action: ${input.action}...`, input);
    await this.service.send(input);
    return await Promise.race([successPromise, errorPromise]);
  }
  public createCampaign = async (campaign: Campaign) => {
    const input = { action: actions.createCampaign, campaign };
    const mapper: EventMapper<Campaign> = event => {
      const { campaign } = event;
      return campaign as Campaign;
    };

    return await this.executeFunction(input, mapper);
  }
  public updateCampaign = async (campaign: Campaign) => {
    const input = { action: actions.updateCampaign, campaign: campaign.id, metadata: campaign };
    const mapper: EventMapper<Campaign> = event => {
      const { metadata: campaign } = event;
      return campaign as Campaign;
    };

    return await this.executeFunction(input, mapper);
  }
  public deleteCampaign = async (campaign: Campaign) => {
    const input = { action: actions.deleteCampaign, campaign: campaign.id };
    const mapper: EventMapper<string> = event => {
      const { status } = event;
      return status as string;
    };

    return await this.executeFunction(input, mapper);
  }
  public getSettings = async (campaign = this.id) => {
    const input = { action: actions.getSettings, campaign };
    const mapper: EventMapper<CampaignSettings> = event => {
      const { settings } = event;
      return settings as CampaignSettings;
    };

    return await this.executeFunction(input, mapper);
  }
  public saveSettings = async (settings: CampaignSettings, campaign = this.id) => {
    const input = { action: actions.saveSettings, campaign, settings };
    const mapper: EventMapper<CampaignSettings> = event => {
      const { settings } = event;
      return settings as CampaignSettings;
    };

    return await this.executeFunction(input, mapper);
  }

  public getCharacter = async (id: string, campaign = this.id) => {
    const input = { action: actions.getCharacter, campaign, character: id };
    const mapper: EventMapper<Character> = event => {
      const { character } = event;
      return character as Character;
    };

    return await this.executeFunction(input, mapper);
  }
  public saveCharacter = async (character: CharacterSummary, campaign = this.id) => {
    const input = { action: actions.saveCharacter, campaign, character };
    const mapper: EventMapper<CharacterSummary> = event => {
      const { character } = event;
      return character as CharacterSummary;
    };

    return await this.executeFunction(input, mapper);
  }
  public deleteCharacter = async (character: CharacterSummary, campaign = this.id) => {
    const input = { action: actions.deleteCharacter, campaign, character };
    const mapper: EventMapper<CharacterSummary> = event => {
      const { character, status } = event;
      if(status !== "deleted") {
        throw new Error("The character was not deleted!");
      }

      return character as CharacterSummary;
    };

    return await this.executeFunction(input, mapper);
  }

  public getNotifications = async (request: AlertRequest, campaign = this.id) => {
    const input = { action: actions.getNotifications, campaign, ...request };
    const mapper: EventMapper<PurchaseAlert[]> = event => {
      const { alerts } = event;
      return alerts as PurchaseAlert[];
    };

    return await this.executeFunction(input, mapper);
  }

  public addItem = async (characterId: string, item: PurchasedItem, campaign = this.id) => {
    const input = { action: actions.addItem, campaign, character: characterId, item };
    const mapper: EventMapper<Character> = event => {
      const { character } = event;
      return character as Character;
    };

    return await this.executeFunction(input, mapper);
  }
  public removeItem = async (characterId: string, item: PurchasedItem, campaign = this.id) => {    
    const input = { action: actions.removeItem, campaign, character: characterId, item };
    const mapper: EventMapper<Character> = event => {
      const { character } = event;
      return character as Character;
    };

    return await this.executeFunction(input, mapper);
  }

  public disconnect = async () => {
    this.service.onDisconnect(event => {
      console.log("...disconnected.", { event });
    });

    console.log("disconnecting...");
    await this.service.disconnect();
  }
}