import { Endpoint, DynamoDB } from "aws-sdk";
import {ReadOnlyDbClient} from "./ReadOnlyDbClient";
import { DbError } from "./_types";

describe("Utility - DockerDbClient", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.AWS_DOCKER_ENDPOINT).toBeTruthy();
  expect(process.env.TABLE_NAME).toBeTruthy();
  expect(process.env.DOCKER_TABLE_NAME).toBeTruthy();
  const testTable = process.env.TABLE_NAME || "";
  const dockerTable = process.env.DOCKER_TABLE_NAME || "";
  const testEndpoint = process.env.AWS_DOCKER_ENDPOINT || "";

  describe("construction tests", () => {
    it("builds inner client", async () => {
      const opts = {endpoint: testEndpoint};
      const client = new DynamoDB.DocumentClient(opts);
      expect(client).toBeInstanceOf(DynamoDB.DocumentClient);
      // Assert
      const asRecord = client as Record<any,any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      const endpoint = new Endpoint(testEndpoint);
      expect(asRecord.service.endpoint).toEqual(endpoint);
    });

    it("builds successfully", async () => {
      const opts = {endpoint: testEndpoint};
      const readOnly = new ReadOnlyDbClient(opts);

      expect(readOnly).toBeInstanceOf(ReadOnlyDbClient);

      // Assert
      const asRecord = readOnly as Record<any,any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      const endpoint = new Endpoint(testEndpoint);
      expect(asRecord.DynamoDb.service.endpoint).toEqual(endpoint);
    });
  });

  describe("docker integration tests", () => {
    const opts = {endpoint: testEndpoint};
    const readOnly = new ReadOnlyDbClient(opts);

    it("retrieves data from valid input", async () => {
      const params = {
        TableName: dockerTable,
        Key: {
          pk: "Templates",
          sk: "Settings"
        }
      };

      const data = await readOnly.get(params);

      expect(data).toBeDefined();
      expect(data.Item).toBeDefined();
      expect(params.Key.pk).toEqual(data.Item?.pk);
      expect(params.Key.sk).toEqual(data.Item?.sk);
    });
    it("errors when retrieving non-existing table", async () => {
      const params = {
        TableName: testTable,
        Key: {
          pk: "Templates",
          sk: "Settings"
        }
      };

      try {
        await readOnly.get(params);
        fail("did not throw expected error...");
      } catch (e) {
        expect(e).toBeInstanceOf(DbError);
      }
    });
  });
});