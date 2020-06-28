import { EventHandler, SocketService, WebSocketService } from "../../utility";
import { Campaign, PurchaseAlert, CampaignSettings } from "./_types";
import { Character, PurchasedItem } from "../characters/View/_types";
import { Notification } from "../../components/Toast";

type GetHandler<T> = (input: T) => void; 

const actions = {
  getCampaign: "getcampaign",
  getSettings: "getcampaignsettings",
  getCharacter: "getcharacter",
  addItem: "additem",
  removeItem: "removeitem"
};
const apiHost = process.env.REACT_APP_API_HOST!;

const getEndpoint = (id: string) => {
  console.log("test of env read:", {endpoint: `wss://${apiHost}?campaign=${id}`});
  return `wss://${apiHost}?campaign=${id}`;
};

export class CampaignStorageService {
  id: string;
  service: SocketService;

  constructor (campaignId: string) {
    this.id = campaignId;
    const endpoint = getEndpoint(campaignId);
    this.service = new WebSocketService(endpoint);
  }

  public connect = async (handler?: () => void) => {
    await this.service.onConnect(async () => {
      !!handler && handler();
      console.log("connected!");
    });
    console.log("connecting...");
    await this.service.connect();  
  }
  public subscribeToAlerts = async (handler?: GetHandler<Notification>) => {
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
        key: alert.item.key,
        title: alert.character.name,
        message: `removed ${alert.item.description}`,
        imageUrl: alert.character.avatarUrl
      };
      handler(notification);
    });
  }

  public getCampaign = async (handler: GetHandler<Campaign>) => {
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

  public getSettings = async (handler: GetHandler<CampaignSettings>) => {
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

  public getCharacter = async (id: string, handler: GetHandler<Character>) => {
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

  public addItem = async(characterId: string, item: PurchasedItem, handler: GetHandler<Character>) => {
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
  public removeItem = async(characterId: string, item: PurchasedItem, handler: GetHandler<Character>) => {
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