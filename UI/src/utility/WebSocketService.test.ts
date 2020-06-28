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
  const endpoint = "wss://jr9obkn1dd.execute-api.us-west-2.amazonaws.com/Dev/?campaign=test";
  let service: WebSocketService;

  afterEach(() => {
    if(service.isConnected()) {
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
    expect(service.isConnected()).toBeTruthy();

    service.onDisconnect(event => {
      captureMessages({message: "onDisconnect", event});
      console.log("disconnected!");
    });
    await service.disconnect();

    

    expect(messages.length).toBe(2);
    expect(service.isConnected()).toBeFalsy();
  });
  it.skip("can send and receive messages", async () => {
    service = new WebSocketService(endpoint);

    const messages: any[] = [];
    const captureMessages = (message: any) => {
      messages.push(message);
    };


    service.onConnect(event => {
      console.log("connected!", { event });
    });
    await service.connect();

    service.subscribe("getsettings", event => {
      captureMessages({message: "getsettings", event});
      console.log("received!", { event });
    });
    const input = { action:"getsettings", campaign:"test" };    
    service.send(input);
    console.log("sent!");

    service.onDisconnect(event => {
      console.log("disconnected!", { event });
    });
    await service.disconnect();

    expect(messages.length).toBe(1);
    console.log("message logged", { message: messages[0] });
  });
});
