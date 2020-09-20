import { EventHandler, SocketService, WebSocketService } from "../../utility";
import { Campaign, AlertRequest, PurchaseAlert, CampaignSettings } from "./_types";
import { Character, PurchasedItem } from "../characters/View/_types";
import { Notification } from "../../components/Toast";
import { CharacterSummary } from "../characters/_types";


interface Input {
  action: string,
  campaign: string,
  [key: string]: any
}
type EventMapper<T> = (event: { [key: string]: any }) => T;
type SuccessHandler<T> = (input: T) => void; 

const actions = {
  subscribe: "subscribe",
  unsubscribe: "unsubscribe",
  getCampaign: "getcampaign",
  updateCampaign: "updatecampaign",
  getSettings: "getcampaignsettings",
  saveSettings: "savecampaignsettings",
  getCharacter: "getcharacter",
  saveCharacter: "savecharacter",
  deleeteCharacter: "deletecharacter",
  getNotifications: "getnotifications",
  addItem: "additem",
  removeItem: "removeitem"
};
const apiHost = process.env.REACT_APP_API_HOST!;

const getEndpoint = () => {
  return `wss://${apiHost}`;
};

export class CampaignStorageService {
  id: string;
  service: SocketService;

  constructor (campaignId: string) {
    this.id = campaignId;
    const endpoint = getEndpoint();
    this.service = new WebSocketService(endpoint);
  }

  public isConnected = () => {
    return this.service.isConnected();
  }

  public connect = async (handler?: () => void) => {
    await this.service.onConnect(async () => {
      this.subscribeToCampaign(handler);
    });
    console.log("connecting...");
    await this.service.connect();
  }
  private subscribeToCampaign = async(handler?: () => void) => {
    const eventHook: EventHandler = event => {
      this.service.unsubscribe(actions.subscribe, eventHook);
      console.log("...subscribed to campaign", event);
      console.log("connected!");
      !!handler && handler();
    };
    console.log("subscribing to event...");
    await this.service.subscribe(actions.subscribe, eventHook);

    const input = { action: actions.subscribe, campaign: this.id };
    console.log("subscribing...", input);
    await this.service.send(input);
  }
  public subscribeToAlerts = async (handler?: SuccessHandler<Notification>) => {
    await this.service.subscribe("additemalert", event => {
      console.log("Add Item Alert...", { event });
    
      if(!handler) return;

      const alert = event as PurchaseAlert;
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
      console.log("Remove Item Alert...", { event });
      if(!handler) return;

      const alert = event as PurchaseAlert;
      const notification: Notification = {
        key: `${alert.alertDate}-${alert.character.id}-${alert.item.id}`,
        title: alert.character.name,
        message: `removed ${alert.item.description}`,
        imageUrl: alert.character.avatarUrl
      };
      handler(notification);
    });
  }

  public getCampaign = async (handler: SuccessHandler<Campaign>) => {
    const eventHook: EventHandler = event => {
      console.log("getCampaign...", event);
      const { campaign } = event;
      console.log("...campaign retrieved", campaign);
      handler(campaign);
      console.log("...unsubscribing to event...");
      this.service.unsubscribe(actions.getCampaign, eventHook);
    };
    console.log("subscribing to event...");
    await this.service.subscribe(actions.getCampaign, eventHook);

    const input = { action: actions.getCampaign, campaign: this.id };
    console.log("issuing get...", input);
    await this.service.send(input);
  }
  public updateCampaign = async (campaign: Campaign, handler: SuccessHandler<Campaign>) => {
    const eventHook: EventHandler = event => {
      const { metadata: campaign } = event;
      console.log("...campaign updated", campaign);
      handler(campaign);
      this.service.unsubscribe(actions.updateCampaign, eventHook);
    };
    await this.service.subscribe(actions.updateCampaign, eventHook);

    const input = { action: actions.updateCampaign, campaign: this.id,  metadata: campaign };
    console.log("updating campaign...", input);
    await this.service.send(input);
  }
  public getSettings = async (handler: SuccessHandler<CampaignSettings>) => {
    const eventHook: EventHandler = event => {
      console.log("getSettings...", event);
      const { settings } = event;
      console.log("...settings retrieved", settings);
      handler(settings);
      console.log("...unsubscribing to event...");
      this.service.unsubscribe(actions.getSettings, eventHook);
    };
    console.log("subscribing to event...");
    await this.service.subscribe(actions.getSettings, eventHook);

    const input = { action: actions.getSettings, campaign: this.id };
    console.log("issuing get...", input);
    await this.service.send(input);
  }
  public saveSettings = async (settings: CampaignSettings, handler: SuccessHandler<CampaignSettings>) => {
    const eventHook: EventHandler = event => {
      const { settings } = event;
      console.log("...settings saved", settings);
      handler(settings);
      this.service.unsubscribe(actions.saveSettings, eventHook);
    };
    await this.service.subscribe(actions.saveSettings, eventHook);

    const input = { action: actions.saveSettings, campaign: this.id,  settings };
    console.log("saving settings...", input);
    await this.service.send(input);
  }

  public getCharacter = async (id: string, handler: SuccessHandler<Character>) => {
    const eventHook: EventHandler = event => {
      console.log("getCharacter...", event);
      const { character } = event;
      console.log("...character retrieved", character);
      handler(character);
      console.log("...unsubscribing to event...");
      this.service.unsubscribe(actions.getCharacter, eventHook);
    };
    console.log("subscribing to event...");
    await this.service.subscribe(actions.getCharacter, eventHook);

    const input = { action: actions.getCharacter, campaign: this.id, character: id };
    console.log("issuing get...", input);
    await this.service.send(input);
  }
  public saveCharacter = async (character: CharacterSummary) => {
    const input = { action: actions.saveCharacter, campaign: this.id,  character };
    const mapper: EventMapper<CharacterSummary> = event => {
      const { character } = event;
      return character;
    }

    return await this.executeAction(input, mapper);
  }
  public deleteCharacter = async (character: CharacterSummary) => {
    const input = { action: actions.deleeteCharacter, campaign: this.id,  character };
    const mapper: EventMapper<CharacterSummary> = event => {
      const { character, status } = event;
      if(status !== "deleted")
        throw new Error("The character was not deleted!");

      return character;
    }

    return await this.executeAction(input, mapper);
  }
  executeAction = async <T>(input: Input, mapper: EventMapper<T>) => {
    const successPromise = new Promise<T>((resolve, reject) => {
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
    const errorPromise = this.sleep<T>(20 * 1000, () => {
      throw new Error("Server not responding!");
    })

    console.log(`triggering action: ${input.action}...`, input);
    await this.service.send(input);
    return await Promise.race([successPromise, errorPromise]);
  }
  sleep = async <T>(ms: number, fn: Function, ...args: any[]) => {
    await this.timeout(ms);
    return fn(...args) as T;
  }
  timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getNotifications = async (request: AlertRequest, handler: SuccessHandler<PurchaseAlert[]>) => {
    const eventHook: EventHandler = event => {
      console.log("getNotifications...", event);
      const { alerts } = event;
      console.log("...notifications retrieved");
      handler(alerts);
      console.log("...unsubscribing to event getNotifications...");
      this.service.unsubscribe(actions.getNotifications, eventHook);
    };
    console.log("subscribing to event getNotifications...");
    await this.service.subscribe(actions.getNotifications, eventHook);

    const input = { action: actions.getNotifications, campaign: this.id, ...request };
    console.log("issuing get...", input);
    await this.service.send(input);
  }

  public addItem = async(characterId: string, item: PurchasedItem, handler: SuccessHandler<Character>) => {
    const eventHook: EventHandler = event => {
      console.log("addItem Event...", event);
      const { character } = event;
      console.log("...item added.", character);
      handler(character);
      console.log("...unsubscribing to event...");
      this.service.unsubscribe(actions.addItem, eventHook);
    };
    console.log("subscribing to event...");
    await this.service.subscribe(actions.addItem, eventHook);

    const input = { action: actions.addItem, campaign: this.id, character: characterId, item };
    console.log("adding item...", input);
    await this.service.send(input);
  }
  public removeItem = async(characterId: string, item: PurchasedItem, handler: SuccessHandler<Character>) => {
    const eventHook: EventHandler = event => {
      console.log("removeItem Event...", event);
      const { character } = event;
      console.log("...item removed.", character);
      handler(character);
      console.log("...unsubscribing to event...");
      this.service.unsubscribe(actions.removeItem, eventHook);
    };
    console.log("subscribing to event...");
    await this.service.subscribe(actions.removeItem, eventHook);

    const input = { action: actions.removeItem, campaign: this.id, character: characterId, item };
    console.log("removing item...", input);
    await this.service.send(input);    
  }

  public disconnect = async () => {
    this.service.onDisconnect(event => {
      console.log("...disconnected.", { event });
    });

    console.log("disconnecting...");
    await this.service.disconnect();
  }
}