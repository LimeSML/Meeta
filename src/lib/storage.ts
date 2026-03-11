import type { PublicAccessType } from "@azure/storage-blob";
import { createServerFn } from "@tanstack/react-start"
import { getBlobServiceClient } from "./azure-storage";

export const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator((formData: FormData) => {
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      throw new Error('有効なファイルがありません')
    }
    return { file }
  })
  .handler(async ({ data }) => {
    const { file } = data

    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient('images');

    await containerClient.createIfNotExists({
      access: 'blob' as PublicAccessType
    })

    const blobName = `${Date.now()}-${file.name}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    const arrayBuffer = await file.arrayBuffer()
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    })

    return { url: blockBlobClient.url, fileName: file.name }
  })