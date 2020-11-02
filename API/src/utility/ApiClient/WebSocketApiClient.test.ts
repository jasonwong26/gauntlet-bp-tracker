import { ApiGatewayManagementApi, Request, AWSError } from "aws-sdk";
import * as sinon from "sinon";

import {WebSocketApiClient, buildApiClient} from "./WebSocketApiClient";

describe("Utility - WebSocketApiClient", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.AWS_ENDPOINT).toBeTruthy();
  const endPoint = process.env.AWS_ENDPOINT || "";

  describe("factory method tests", () => {
    it("builds successfully", async () => {
      const client = buildApiClient(endPoint);
      expect(client).toBeInstanceOf(WebSocketApiClient);
    });
    it("throws error if endpoint is empty", async () => {
      expect(() => {
        buildApiClient("");  
      }).toThrow("endPoint must be specified");
    });
  });

  describe("constructor tests", () => {
    const api = new ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endPoint,
    });

    it("builds successfully", async () => {
      const client = new WebSocketApiClient(api);
      expect(client).toBeInstanceOf(WebSocketApiClient);
    });
    it("throws error if api not supplied", async () => {
      expect(() => {
        new WebSocketApiClient(null as unknown as ApiGatewayManagementApi);  
      }).toThrow("api must be provided");
    });
  });

  describe("behavior tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    // Helper function for setting up test scenarios
    const setStubOutput = <T>(stub: sinon.SinonStub, response: T | Error) => {
      const returnValueMock = {
        promise() {
          if(response instanceof Error)
            throw response;

          return response;
        },
      } as unknown as Request<T, AWSError>;

      stub.returns(returnValueMock);
    } 

    const api = new ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endPoint,
    });

    let staleConnectionCalls = 0;
    const override = async () => {
      staleConnectionCalls++;
    };

    beforeAll(() => {
      stub = sandbox.stub(api, "postToConnection");
      const defaultOutput = {
        action: "testaction"
      };
      setStubOutput(stub, defaultOutput);
    });

    afterEach(() => {
      stub.resetHistory();
      staleConnectionCalls = 0;
    });

    afterAll(() => {
      sandbox.restore();
    });

    it("normal case", async () => {
      // Arrange
      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      // Act
      const client = new WebSocketApiClient(api);
      await client.send(input);

      // Assert
      const postRequest = {
        ConnectionId: input.connectionId, 
        Data: JSON.stringify(input)
      };
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(postRequest);
    });
    it("unhandled connection error 1", async () => {
      // Arrange
      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      const error = new Error("Test Error") as AWSError;
      error.statusCode = 500;  
      setStubOutput(stub, error);

      // Act
      const client = new WebSocketApiClient(api);
      try {
        await client.send(input);
      } catch (e) {
        expect(e).toEqual(error);
      }

      // Assert
      const postRequest = {
        ConnectionId: input.connectionId, 
        Data: JSON.stringify(input)
      };
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(postRequest);
    });
    it("unhandled connection error 2", async () => {
      // Arrange
      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      const error = new Error("Test Error") as AWSError;
      error.statusCode = 410;  
      setStubOutput(stub, error);

      // Act
      const client = new WebSocketApiClient(api);
      try {
        await client.send(input);
      } catch (e) {
        expect(e).toEqual(error);
      }

      // Assert
      const postRequest = {
        ConnectionId: input.connectionId, 
        Data: JSON.stringify(input)
      };
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(postRequest);
    });
    it("handled connection error 1", async () => {
      // Arrange
      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      const error = new Error("Test Error") as AWSError;
      error.statusCode = 410;  
      setStubOutput(stub, error);

      // Act
      const client = new WebSocketApiClient(api, override);
      await client.send(input);

      // Assert
      const postRequest = {
        ConnectionId: input.connectionId, 
        Data: JSON.stringify(input)
      };
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(postRequest);
      expect(staleConnectionCalls).toBe(1);
    });
    it("handled connection error 2", async () => {
      // Arrange
      const input = {
        action: "getsettings",
        connectionId: "O23BscCsPHcCEUA="
      };
      const error = new Error("Test Error") as AWSError;
      error.statusCode = 410;  
      setStubOutput(stub, error);

      // Act
      const client = new WebSocketApiClient(api);
      client.setOnStaleConnectionBehavior(override);
      await client.send(input);

      // Assert
      const postRequest = {
        ConnectionId: input.connectionId, 
        Data: JSON.stringify(input)
      };
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(postRequest);
      expect(staleConnectionCalls).toBe(1);
    });
  });
});
