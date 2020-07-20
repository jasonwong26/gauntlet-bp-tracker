import {WebSocketApiClient} from "./WebSocketApiClient";

describe("Utility - WebSocketApiClient", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.AWS_ENDPOINT).toBeTruthy();
  const endPoint = process.env.AWS_ENDPOINT!;

  describe("construction tests", () => {
    it("builds successfully", async () => {
      const client = new WebSocketApiClient(endPoint);
      expect(client).toBeInstanceOf(WebSocketApiClient);
    });
    it("throws error if endpoint is empty", async () => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new WebSocketApiClient("");  
      }).toThrow("endPoint must be specified");
    });
  });

  describe("behavior tests", () => {
    let staleConnectionCalled = false;
    const handler = async () => {
      staleConnectionCalled = true;
    };
    const client = new WebSocketApiClient(endPoint, handler);

    beforeEach(() => {
      staleConnectionCalled = false;
    });
    it("sends to API", async () => {
      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      await client.send(input);
      expect(staleConnectionCalled).toBeTruthy();
    });
    it("throws error on invalid connection id", async () => {
      const input = {
        action: "getsettings",
        connectionId: "invalid id"
      };
      try {
        await client.send(input);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual("Invalid connectionId: invalid id");
      }
      expect(staleConnectionCalled).toBeFalsy();

    });
    it("allows override of on stale connection behavior", async () => {
      let staleConnectionCalls = 0;
      const override = async () => {
        staleConnectionCalls++;
      };
      client.setOnStaleConnectionBehavior(override);

      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      await client.send(input);
      expect(staleConnectionCalled).toBeFalsy();
      expect(staleConnectionCalls).toBe(1);
    });
  });

});