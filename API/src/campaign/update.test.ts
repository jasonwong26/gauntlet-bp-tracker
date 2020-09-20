import { MessageEvent } from "../_types";
import { handler } from "./update";

describe("Update Campaign", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.TABLE_NAME).toBeTruthy();

  describe("functionality test", () => {
    it.skip("executes for normal case", async () => {
      const input: MessageEvent = {
        requestContext: {
          routeKey: "updatecampaign",
          messageId: "TLkEWcEvPHcCJaw=",
          eventType: "MESSAGE",
          extendedRequestId: "TLkEWH3svHcF8sw=",
          requestTime: "20/Sep/2020:19:55:33 +0000",
          messageDirection: "IN",
          stage: "Dev",
          connectedAt: 1600631714689,
          requestTimeEpoch: 1600631733311,
          requestId: "TLkEWH3svHcF8sw=",
          domainName: "api.gauntlet.developermouse.com",
          connectionId: "TLkBbfxTvHcCJaw=",
          apiId: "7rhd7bj103"
        },
        body: '{"action":"updatecampaign","campaign":"Q6vaKfpC-","metadata":{"description":"Example Value updated 3!","characters":[{"name":"Jane 2","id":"jc1-OTzNT","race":"Human","class":"Virgin","avatarUrl":null}],"id":"kRt4OhOdx","title":"Test Campaign 2 updated","author":"Jerry the Clown updated"}}',
        isBase64Encoded: false
      };

      const output = await handler(input);
      expect(output).toBeTruthy();
      expect(output.statusCode).toEqual(200);
    });
  });
});