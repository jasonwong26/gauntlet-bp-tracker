import * as sinon from "sinon";
import { DynamoDB, Request, AWSError } from "aws-sdk";
import { BatchGetItemInput, BatchGetItemOutput, GetItemInput, GetItemOutput, QueryInput, QueryOutput, ScanInput, ScanOutput } from "./_types";
import {ReadOnlyDbClient} from "./ReadOnlyDbClient";
import { DbError } from "./_types";

describe("Utility - ReadOnlyDbClient", () => {
  expect(process.env.AWS_REGION).toBeTruthy();
  expect(process.env.TABLE_NAME).toBeTruthy();
  const testTable = process.env.TABLE_NAME || "";

  describe("construction tests", () => {
    it("builds successfully", async () => {
      const readOnly = new ReadOnlyDbClient();

      expect(readOnly).toBeInstanceOf(ReadOnlyDbClient);
    });
  });

  describe(".get() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const readOnly = new ReadOnlyDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "get");
      const defaultOutput: GetItemOutput = {
        Item: {
          pk: "example partition key",
          sk: "example sort key",
          field: "example value"
        }
      };

      setStubOutput(stub, defaultOutput);
    });

    const setStubOutput = (stub: sinon.SinonStub, response: GetItemOutput | Error) => {
      const returnValueMock = {
        promise() {
          if(response instanceof Error)
            throw response;

          return response;
        },
      } as unknown as Request<GetItemOutput, AWSError>;
  
      stub.returns(returnValueMock);
    } 

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: GetItemInput = {
        TableName: testTable,
        Key: {
          pk: "Campaign#test",
          sk: "Metadata"
        }
      };
      const output: GetItemOutput = {
        Item: {
          ...params.Key,
          field: "example value 2"
        }
      }
      setStubOutput(stub, output);

      await readOnly.get(params);
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: GetItemInput = {
        TableName: testTable,
        Key: {
          pk: "Campaign#test",
          sk: "Metadata"
        }
      };
      const output: GetItemOutput = {
        Item: {
          ...params.Key,
          field: "example value 2"
        }
      }
      setStubOutput(stub, output);

      const data = await readOnly.get(params);
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: GetItemInput = {
        TableName: testTable,
        Key: {
          pk: "Campaign#test",
          sk: "Metadata"
        }
      };
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      try {
        await readOnly.get(params);
        expect(false).toBeTruthy();
      } catch (e) {
          expect(stub.called).toBeTruthy();
          expect(stub.getCall(0).args[0]).toEqual(params);
          expect(e).toBeInstanceOf(DbError);
      }
    });
  });

  describe(".getBatch() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const readOnly = new ReadOnlyDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "batchGet");
      const defaultOutput: BatchGetItemOutput = {
        Responses: {
          [testTable]: [{
            pk: "example partition key",
            sk: "example sort key",
            field: "example value"
          }]
        }
      };

      setStubOutput(stub, defaultOutput);
    });

    const setStubOutput = (stub: sinon.SinonStub, response: BatchGetItemOutput | Error) => {
      const returnValueMock = {
        promise() {
          if(response instanceof Error)
            throw response;

          return response;
        },
      } as unknown as Request<BatchGetItemOutput, AWSError>;
  
      stub.returns(returnValueMock);
    } 

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: BatchGetItemInput = {
        RequestItems: {
          [testTable]: {
            Keys: [{
              pk: "example partition key",
              sk: "example sort key",
            }]
          }
        }
      };

      // Act
      await readOnly.getBatch(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: BatchGetItemInput = {
        RequestItems: {
          [testTable]: {
            Keys: [{
              pk: "example partition key",
              sk: "example sort key",
            }]
          }
        }
      };

      const output: BatchGetItemOutput = {
        Responses: {
          [testTable]: [{
            pk: "example partition key",
            sk: "example sort key",
            field: "example value"
          }]
        }
      };
      setStubOutput(stub, output);

      // Act
      const data = await readOnly.getBatch(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: BatchGetItemInput = {
        RequestItems: {
          [testTable]: {
            Keys: [{
              pk: "example partition key",
              sk: "example sort key",
            }]
          }
        }
      };
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act & Assert
      try {
        await readOnly.getBatch(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      expect(stub.called).toBeTruthy();
    });
  });

  describe(".query() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const readOnly = new ReadOnlyDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "query");
      const defaultOutput: QueryOutput = {
        Items: [{
          pk: "example partition key",
          sk: "example sort key",
          field: "example value"
        }],
        Count: 1
      };

      setStubOutput(stub, defaultOutput);
    });

    const setStubOutput = (stub: sinon.SinonStub, response: QueryOutput | Error) => {
      const returnValueMock = {
        promise() {
          if(response instanceof Error)
            throw response;

          return response;
        },
      } as unknown as Request<QueryOutput, AWSError>;
  
      stub.returns(returnValueMock);
    } 

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: QueryInput = {
        TableName: testTable,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
          "#pk": "pk"
        },
        ExpressionAttributeValues: {
          ":pk": "Campaign#test"
        },
        ProjectionExpression: "pk, sk"
      };

      // Act
      await readOnly.query(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: QueryInput = {
        TableName: testTable,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
          "#pk": "pk"
        },
        ExpressionAttributeValues: {
          ":pk": "Campaign#test"
        },
        ProjectionExpression: "pk, sk"
      };

      const output: QueryOutput = {
        Items: [{
          pk: "example partition key",
          sk: "example sort key",
          field: "example value 2"
        }],
        Count: 1
      };
      setStubOutput(stub, output);

      // Act
      const data = await readOnly.query(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: QueryInput = {
        TableName: testTable,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
          "#pk": "pk"
        },
        ExpressionAttributeValues: {
          ":pk": "Campaign#test"
        },
        ProjectionExpression: "pk, sk"
      };
      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act & Assert
      try {
        await readOnly.query(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      expect(stub.called).toBeTruthy();
    });
  });

  describe(".scan() tests", () => {
    const sandbox = sinon.createSandbox();
    let stub: sinon.SinonStub;

    const readOnly = new ReadOnlyDbClient();
    
    beforeAll(() => {
      stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "scan");
      const defaultOutput: ScanOutput = {
        Items: [{
          pk: "example partition key",
          sk: "example sort key",
          field: "example value"
        }],
        Count: 1
      };

      setStubOutput(stub, defaultOutput);
    });

    const setStubOutput = (stub: sinon.SinonStub, response: ScanOutput | Error) => {
      const returnValueMock = {
        promise() {
          if(response instanceof Error)
            throw response;

          return response;
        },
      } as unknown as Request<ScanOutput, AWSError>;
  
      stub.returns(returnValueMock);
    } 

    afterEach(() => {
      stub.resetHistory();
    });

    afterAll(() => {
      sandbox.restore();
    });
 
    it("calls expected method", async () => {
      // Arrange
      const params: ScanInput = {
        TableName: testTable,
        Limit: 100
      };

      // Act
      await readOnly.scan(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
    });
    it("returns expected value", async () => {
      // Arrange
      const params: ScanInput = {
        TableName: testTable,
        Limit: 100
      };

      const output: ScanOutput = {
        Items: [{
          pk: "example partition key",
          sk: "example sort key",
          field: "example value 2"
        }],
        Count: 1
      };
      setStubOutput(stub, output);

      // Act
      const data = await readOnly.scan(params);

      // Assert
      expect(stub.called).toBeTruthy();
      expect(stub.getCall(0).args[0]).toEqual(params);
      expect(data).toBeDefined();
      expect(data).toEqual(output);
    });
    it("throws expected error", async () => {
      // Arrange
      const params: ScanInput = {
        TableName: testTable,
        Limit: 100
      };

      const error = new Error("Test Error") as AWSError;
      error.code = "test_error";      
      setStubOutput(stub, error);

      // Act & Assert
      try {
        await readOnly.scan(params);
      } catch (e) {
          expect(e).toBeInstanceOf(DbError);
      }

      expect(stub.called).toBeTruthy();
    });
  });

  describe.skip("integration tests", () => {
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