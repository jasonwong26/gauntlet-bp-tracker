import {ReadOnlyDbClient} from "./ReadOnlyDbClient";
import { DbError } from "./_types";

describe("Utility - ReadOnlyDbClient", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.TABLE_NAME).toBeTruthy();
  const testTable = process.env.TABLE_NAME!;

  describe("construction tests", () => {
    it("builds successfully", async () => {
      const readOnly = new ReadOnlyDbClient();

      expect(readOnly).toBeInstanceOf(ReadOnlyDbClient);
    });
  });
  describe(".get() tests", () => {
  const readOnly = new ReadOnlyDbClient();
    it("retrieves data from valid input", async () => {
      const params = {
        TableName: testTable,
        Key: {
          pk: "Campaign#test",
          sk: "Metadata"
        }
      };

      const data = await readOnly.get(params);
      expect(data).toBeDefined();
      expect(data.Item).toBeDefined();
      expect(params.Key.pk).toEqual(data.Item?.pk);
      expect(params.Key.sk).toEqual(data.Item?.sk);
    });
    it("retrieves undefined when key not found", async () => {
      const params = {
        TableName: testTable,
        Key: {
          pk: "Campaign#test",
          sk: "InvalidValue"
        }
      };

      try {
        await readOnly.get(params);
      } catch (e) {
        expect(e).toBeInstanceOf(DbError);
      }
    });
  });
});