import * as sinon from "sinon";
import { DynamoDB, Request, AWSError } from "aws-sdk";
import { BatchWriteItemInput, BatchWriteItemOutput, DeleteItemInput, DeleteItemOutput, PatchItemInput, PatchItemOutput, PutItemInput, PutItemOutput } from "./_types";
import {CrudDbClient} from "./CrudDbClient";
import { DbError } from "./_types";

describe("Utility - CrudDbClient", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.TABLE_NAME).toBeTruthy();
  const testTable = process.env.TABLE_NAME || "";

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

  describe("construction tests", () => {
    it("builds successfully", async () => {
      const crud = new CrudDbClient();

      expect(crud).toBeInstanceOf(CrudDbClient);
    });
  });

  describe(".put() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const crud = new CrudDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "put");
      const defaultOutput: PutItemOutput = {
        ConsumedCapacity: {
          TableName: testTable,
          CapacityUnits: 1
        }
      };

      setStubOutput(stub, defaultOutput);
    });

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: PutItemInput = {
        TableName: testTable,
        Item: {
          pk: "Campaign#test",
          sk: "Metadata",
          attribute: "example value"
        }
      };

      // Act
      await crud.put(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: PutItemInput = {
        TableName: testTable,
        Item: {
          pk: "Campaign#test",
          sk: "Metadata",
          attribute: "example value"
        }
      };
      const output: PutItemOutput = {
        ConsumedCapacity: {
          TableName: testTable,
          CapacityUnits: 5
        }
      };
      setStubOutput(stub, output);

      // Act
      const data = await crud.put(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: PutItemInput = {
        TableName: testTable,
        Item: {
          pk: "Campaign#test",
          sk: "Metadata",
          attribute: "example value"
        }
      };
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act
      try {
        await crud.put(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
  });

  describe(".patch() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const crud = new CrudDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "update");
      const defaultOutput: PatchItemOutput = {
        ConsumedCapacity: {
          TableName: testTable,
          CapacityUnits: 1
        }
      };

      setStubOutput(stub, defaultOutput);
    });

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: PatchItemInput = { 
        TableName: testTable, 
        Key: {
          pk: "Campaign#test",
          sk: "Metadata",
        },
        UpdateExpression: "set campaign.title = :title",
        ExpressionAttributeValues: {
          ":title": "example title"
        }
      }; 

      // Act
      await crud.patch(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: PatchItemInput = { 
        TableName: testTable, 
        Key: {
          pk: "Campaign#test",
          sk: "Metadata",
        },
        UpdateExpression: "set campaign.title = :title",
        ExpressionAttributeValues: {
          ":title": "example title"
        }
      }; 
      const output: PatchItemOutput = {
        ConsumedCapacity: {
          TableName: testTable,
          CapacityUnits: 4
        }
      };
      setStubOutput(stub, output);

      // Act
      const data = await crud.patch(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: PatchItemInput = { 
        TableName: testTable, 
        Key: {
          pk: "Campaign#test",
          sk: "Metadata",
        },
        UpdateExpression: "set campaign.title = :title",
        ExpressionAttributeValues: {
          ":title": "example title"
        }
      }; 
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act
      try {
        await crud.patch(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
  });

  describe(".delete() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const crud = new CrudDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "delete");
      const defaultOutput: DeleteItemOutput = {
        ConsumedCapacity: {
          TableName: testTable,
          CapacityUnits: 1
        }
      };

      setStubOutput(stub, defaultOutput);
    });

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: DeleteItemInput = { 
        TableName: testTable, 
        Key: {
          pk: "Campaign#test",
          sk: "Metadata",
        }
      }; 

      // Act
      await crud.delete(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: DeleteItemInput = { 
        TableName: testTable, 
        Key: {
          pk: "Campaign#test",
          sk: "Metadata",
        }
      }; 
      const output: DeleteItemOutput = {
        ConsumedCapacity: {
          TableName: testTable,
          CapacityUnits: 3
        }
      };
      setStubOutput(stub, output);

      // Act
      const data = await crud.delete(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: DeleteItemInput = { 
        TableName: testTable, 
        Key: {
          pk: "Campaign#test",
          sk: "Metadata",
        }
      }; 
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act
      try {
        await crud.delete(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
  });

  describe(".batchWrite() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const crud = new CrudDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "batchWrite");
      const defaultOutput: BatchWriteItemOutput = {
        ItemCollectionMetrics: {
          [testTable]: [{
            ItemCollectionKey: {
              pk: "Campaign#test"
            }
          }]
        },
        ConsumedCapacity: [{
          TableName: testTable,
          CapacityUnits: 1
        }]
      };

      setStubOutput(stub, defaultOutput);
    });

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: BatchWriteItemInput = {
        RequestItems: 
          {
            [testTable]: [{ 
              DeleteRequest: { 
                Key: {
                  pk: "Campaign#test",
                  sk: "Metadata",
                }
              } 
            }]
          }   
      };

      // Act
      await crud.batchWrite(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: BatchWriteItemInput = {
        RequestItems: 
          {
            [testTable]: [{ 
              DeleteRequest: { 
                Key: {
                  pk: "Campaign#test",
                  sk: "Metadata",
                }
              } 
            }]
          }   
      };
      const output: BatchWriteItemOutput = {
        ItemCollectionMetrics: {
          [testTable]: [{
            ItemCollectionKey: {
              pk: "Campaign#test"
            }
          }]
        },
        ConsumedCapacity: [{
          TableName: testTable,
          CapacityUnits: 2
        }]
      };
      setStubOutput(stub, output);

      // Act
      const data = await crud.batchWrite(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: BatchWriteItemInput = {
        RequestItems: 
          {
            [testTable]: [{ 
              DeleteRequest: { 
                Key: {
                  pk: "Campaign#test",
                  sk: "Metadata",
                }
              } 
            }]
          }   
      };
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act
      try {
        await crud.batchWrite(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
  });
});