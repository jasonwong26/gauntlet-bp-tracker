import { MessageEvent } from "../_types";
import { handler } from "./delete";

describe("Delete Campaign", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.TABLE_NAME).toBeTruthy();

  describe("functionality test", () => {
    it.skip("executes for normal case", async () => {
      const input: MessageEvent = {
        requestContext: {
          routeKey: "deletecampaign",
          messageId: "TJn1vfZSPHcAcqg=",
          eventType: "MESSAGE",
          extendedRequestId: "TJn1vFGaPHcFrfQ=",
          requestTime: "20/Sep/2020:05:47:29 +0000",
          messageDirection: "IN",
          stage: "Dev",
          connectedAt: 1600580820780,
          requestTimeEpoch: 1600580849488,
          requestId: "TJn1vFGaPHcFrfQ=",
          domainName: "api.gauntlet.developermouse.com",
          connectionId: "TJnxQfIyPHcAcqg=",
          apiId: "7rhd7bj103"
        },
        body: '{"action":"deletecampaign","campaign":"AQGdrQHl1"}',
        isBase64Encoded: false
      };

      const output = await handler(input);
      expect(output).toBeTruthy();
      expect(output.statusCode).toEqual(200);
    });
  });
});