import { SocketService, WebSocketService } from "../../utility";
import { Character } from "./View/_types";

const action = "savecharacter";
const campaign = 1;
const endpoint = `wss://omaoyndy1g.execute-api.us-west-2.amazonaws.com/Dev/?campaign=${campaign}`;

export class CharacterStorageService {
  service: SocketService;

  constructor () {
    this.service = new WebSocketService(endpoint);

    const setup = async () => {
      await this.service.subscribe("savecharacter", event => {
        console.log("...changes saved.", event.character);
      });
    };
    setup();
  }

  public connect = async () => {
    await this.service.onConnect(async () => {
    });
    await this.service.connect();  
  };

  public save = async (character: Character) => {
    const input = { action, campaign, character };
    this.service.send(input);
  }

  public disconnect = async () => {
    await this.service.disconnect();
  }
}