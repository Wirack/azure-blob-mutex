# Azure Blob Mutex

`azure-blob-mutex` is a Node.js package that utilizes Azure Blob Storage to implement a global mutex (or lock), helping prevent race conditions across different processes in your applications. By acquiring a lease on a blob, it provides a global reference point to ensure exclusive access for certain operations, thereby guarding against concurrent execution.

## Dependencies

`azure-blob-mutex` depends on the following package:

- [`@azure/storage-blob`](https://www.npmjs.com/package/@azure/storage-blob): This package is used for interactions with Azure Blob Storage. It provides the functionality to create blob service clients, container clients, and perform operations like creating containers and blobs if they don't exist, and acquiring and releasing leases.

## Installation

Use the package manager npm to install `azure-blob-mutex`.

```bash
npm install azure-blob-mutex
```

## Usage

First, import the module into your project.

```javascript
import { LeasedRunHandler } from "azure-blob-mutex";
```

Then, initialize the `LeasedRunHandler` with your Azure Blob Storage configuration.

```javascript
const handler = await LeasedRunHandler.create({
  blobStorageConnectionString: '<Your Blob Storage Connection String>',
  containerName: '<Your Container Name>',
  keyName: '<Your Key Name>',
  maxLeaseDuration: <Lease Duration>, // optional, defaults to 15
})
```

Finally, run your code with a lease.

```javascript
await handler.runWithLease(async () => {
  // Your code here
});
```

Remember to replace placeholders like `<Your Blob Storage Connection String>` with actual values in your own usage.

## Configuration Options

Here are the options you can use to configure the `LeasedRunHandler`.

- `blobStorageConnectionString`: Your Azure Blob Storage connection string.
- `containerName`: The name of the blob container.
- `keyName`: The key name of the blob.
- `maxLeaseDuration`: The maximum duration of the lease in seconds. Must be between 15 and 60 seconds. Defaults to 15.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

`azure-blob-mutex` is licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.
