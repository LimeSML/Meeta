import { BlobServiceClient } from "@azure/storage-blob"
import type { PublicAccessType } from "@azure/storage-blob";
import { createServerFn } from "@tanstack/react-start"

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
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

    if (!connectionString) {
      throw new Error('接続文字列が設定されていません')
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerName = 'images'
    const containerClient = blobServiceClient.getContainerClient(containerName)

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