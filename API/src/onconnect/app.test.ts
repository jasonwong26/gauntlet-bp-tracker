import { ConnectEvent, DbConnection } from "../_types";
import { Input, mapToInput, mapToConnection } from "./app";

describe("mapToInput", () => {
  it("works for normal case", () => {
    const input: ConnectEvent = {
      requestContext: {
        apiId: "8yhgex0kz2",
        connectionId: "NlrEScxHPHcCFug=",
        domainName: "mock.amazonaws.com",
        routeKey: "$connect",
        messageId: null,
        eventType: "CONNECT",
        extendedRequestId: "NlrESE91vHcFXDg=",
        requestTime: "04/Jun/2020:05:50:44 +0000",
        messageDirection: "IN",
        stage: "Dev",
        connectedAt: 1591249844900,
        requestTimeEpoch: 1591249844902,
        requestId: "NlrESE91vHcFXDg="
      },
      isBase64Encoded: false
    };
    const output: Input = mapToInput(input);
    
    const expected = {
      endPoint: "mock.amazonaws.com/Dev",
      connectionId: "NlrEScxHPHcCFug=", 
      action: "connect"
    };
    expect(output).toEqual(expected);
  });
});

describe("mapToConnection", () => {
  it("works for normal case", () => {
    const input: Input = {
      endPoint: "mock.amazonaws.com/Dev",
      connectionId: "NlrEScxHPHcCFug=", 
      action: "connect"
    };

    const output = mapToConnection(input);

    const expected: DbConnection = {
      pk: "Connections",
      sk: `Connection#${input.connectionId}`,
      type: "Connection",
      typeSk: input.connectionId,
      connectionId: input.connectionId,
      created: output.created
    };

    expect(output).toEqual(expected);
  });
});