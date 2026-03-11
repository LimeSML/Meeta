import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

let blobServiceClient: BlobServiceClient | null = null;

export const getBlobServiceClient = () => {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

  if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } else if (accountName) {
    const blobEndpoint = `https://${accountName}.blob.core.windows.net`;
    blobServiceClient = new BlobServiceClient(blobEndpoint, new DefaultAzureCredential());
  } else {
    throw new Error("Azure Storage の認証情報が設定されていません。");
  }

  return blobServiceClient;
};