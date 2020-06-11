import {WebSocketService} from "./WebSocketService";

describe("timers in Jest", () => {
  it("can be used for sleep", async () => {
    let count = 0;
    const cap = 2;

    const startTime = new Date();
    const sleep = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };
    const awaiter = async () => {
      if(count === cap) return;        
      count++;
      await sleep(1000);
      await awaiter();
    };
    await awaiter();

    const endTime = new Date();
    const delta = (endTime.getTime() - startTime.getTime()) / 1000;
    expect(count).toBe(2);
    expect(delta).toBeGreaterThan(1.75);
  });
});

describe("WebSocketService", () => {
  const endpoint = "wss://8yhgex0kz2.execute-api.us-west-2.amazonaws.com/Prod/?channel=test_channel";
  let service: WebSocketService;

  afterEach(() => {
    if(service.connected) {
      console.log("disconnecting...");
      service.disconnect();
    }
  });

  it.skip("can connect & disconnect", async () => {
    service = new WebSocketService(endpoint);

    const messages: any[] = [];
    const captureMessages = (message: any) => {
      messages.push(message);
    };
    service.onConnect(event => {
      captureMessages({message: "onConnect", event});
    });
    await service.connect();

    expect(messages.length).toBe(1);
    expect(service.connected).toBeTruthy();

    service.onDisconnect(event => {
      captureMessages({message: "onDisconnect", event});
    });
    await service.disconnect();

    expect(messages.length).toBe(2);
    expect(service.connected).toBeFalsy();
  });
  it.skip("can send and receive messages", async () => {
    service = new WebSocketService(endpoint);

    const messages: any[] = [];
    const captureMessages = (message: any) => {
      messages.push(message);
    };

    service.subscribe("sendmessage", event => {
      captureMessages({message: "sendmessage", event});
    });

    await service.connect();

    const input = { message:"sendmessage", channel:"test_channel", data:"hello world" };    
    service.send(input);

    await service.disconnect();

    expect(messages.length).toBe(1);
    console.log("message logged", { message: messages[0] });
  });
});
