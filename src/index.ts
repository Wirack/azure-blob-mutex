import { BlobLeaseClient, BlobServiceClient } from "@azure/storage-blob";

interface LeasedRunHandlerConfig {
  blobStorageConnectionString: string;
  containerName: string;
  keyName: string;
  /** Must be between 15 and 60 seconds or -1 (infinite). Defaults to 15 */
  maxLeaseDuration?: number;
}

export class LeasedRunHandler {
  private blobLeaseClient: BlobLeaseClient;
  private config: LeasedRunHandlerConfig;

  public static async create(config: LeasedRunHandlerConfig) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      config.blobStorageConnectionString
    );
    const containerClient = blobServiceClient.getContainerClient(
      config.containerName
    );

    await containerClient.createIfNotExists();
    const blobName = `${config.keyName}.lck`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    if (!(await blockBlobClient.exists())) {
      await blockBlobClient.upload("", 0);
    }

    return new LeasedRunHandler(blockBlobClient.getBlobLeaseClient(), config);
  }

  constructor(client: BlobLeaseClient, config: LeasedRunHandlerConfig) {
    this.blobLeaseClient = client;
    this.config = config;
  }

  public async runWithLease<T>(func: { (): Promise<T> }): Promise<T> {
    try {
      await this.blobLeaseClient.acquireLease(
        this.config.maxLeaseDuration || 15
      );

      return await func();
    } catch (ex) {
      throw ex;
    } finally {
      await this.blobLeaseClient.releaseLease();
    }
  }
}
