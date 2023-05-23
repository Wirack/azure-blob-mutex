import { BlobLeaseClient, BlobServiceClient } from "@azure/storage-blob";

interface AzureBlobMutexConfig {
  blobStorageConnectionString: string;
  containerName: string;
  keyName: string;
  /** Must be between 15 and 60 seconds or -1 (infinite). Defaults to 15 */
  maxLeaseDuration?: number;
}

export class AzureBlobMutex {
  private blobLeaseClient: BlobLeaseClient;
  private config: AzureBlobMutexConfig;

  public static async create(config: AzureBlobMutexConfig) {
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

    return new AzureBlobMutex(blockBlobClient.getBlobLeaseClient(), config);
  }

  constructor(client: BlobLeaseClient, config: AzureBlobMutexConfig) {
    this.blobLeaseClient = client;
    this.config = config;
  }

  public async run<T>(func: { (): Promise<T> }): Promise<T> {
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
