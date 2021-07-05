import { S3, Credentials } from "aws-sdk";

describe("Functional Tests - AWS S3 client", () => {
  expect(process.env.FILE_S3_BUCKET).toBeTruthy();
  expect(process.env.ACCESS_KEY).toBeTruthy();
  expect(process.env.ACCESS_SECRET).toBeTruthy();
  const bucket = process.env.FILE_S3_BUCKET || "";

  // only need to use this if AWS CLI Is not installed & configured.
  const accessKey = process.env.ACCESS_KEY || "";
  const accessSecret = process.env.ACCESS_SECRET || "";
 
  let client: S3;
  it("construction", async () => {
    const client = buildClient();
    expect(client).toBeInstanceOf(S3);
  });

  beforeAll(async () => {
      client = buildClient();

      deleteFile("create_object_test.txt");
      putFile("update_object_test.txt", "example content.");
      deleteFile("delete_object_test.txt");
  });
  const buildClient = () : S3 => {
    // const credentials = new Credentials(accessKey, accessSecret);
    // const config: S3.Types.ClientConfiguration = { credentials };
    // const client = new S3(config);
    const client = new S3();
    return client;
  }

  const listFiles = async (prefix?: string) : Promise<S3.Types.ListObjectsV2Output> => {
    let request: S3.Types.ListObjectsRequest = {
        Bucket: bucket,
        Prefix: prefix
    };

    let response = await client.listObjectsV2(request).promise();
    return response;
  }
  const getFile = async (key: string) : Promise<S3.Types.GetObjectOutput> => {
    let request: S3.Types.GetObjectRequest = {
        Bucket: bucket,
        Key: key
    };

    let response = await client.getObject(request).promise();
    return response;
  }
  const putFile = async (key: string, contents: string) : Promise<S3.Types.PutObjectOutput> => {
    let request: S3.Types.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: contents
    };

    let response = await client.putObject(request).promise();
    return response;
  }
  const deleteFile = async (key: string) : Promise<S3.Types.DeleteObjectOutput> => {
    let request: S3.Types.DeleteObjectRequest = {
        Bucket: bucket,
        Key: key
    };

    let response = await client.deleteObject(request).promise();
    return response;
  }
  describe("read tests", () => {
    it("list objects", async () => {
        let response = await listFiles();
  
        expect(response).toHaveProperty("Contents");
        expect(response.Contents?.length).toBeGreaterThan(0);   
      });
  
      it("fetch object", async () => {
        const key = "default-avatar.png";
  
        const response = await getFile(key);
  
        expect(response.ContentLength).toBeDefined();
        expect(response.ContentLength).toBeGreaterThan(0);   
      });
      it("handles not found objects", async () => {
        const key = "does_not_exist.txt";
        
        await expect(getFile(key))
          .rejects
          .toThrow("The specified key does not exist.");
      });
  });

  describe("CRUD tests", () => {
    it("create object", async () => {
        const  key = "create_object_test.txt";
        const contents = "this is at test.";
  
        const response = await putFile(key, contents);
  
        expect(response).toHaveProperty("ETag");
        expect(response.ETag).toBeDefined(); 
      });
  
      it("update object", async () => {
        const  key = "update_object_test.txt";
        const contents = "this is at test.";
  
        const response = await putFile(key, contents);
  
        expect(response).toHaveProperty("ETag");
        expect(response.ETag).toBeDefined();
  
        const updated = await getFile(key);
        
        if(updated.Body instanceof String)
          expect(updated.Body).toEqual(contents);
        else if(updated.Body instanceof Buffer)
          expect(updated.Body.toString()).toEqual(contents);
        else 
          fail("body is of an unexpected type");
      });
  
      it("delete object", async () => {
        const  key = "delete_object_test.txt";
  
        await deleteFile(key);
  
        await expect(getFile(key))
          .rejects
          .toThrow("The specified key does not exist.");
      });   
  });
});