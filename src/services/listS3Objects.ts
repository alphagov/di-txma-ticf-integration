import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandInput
} from '@aws-sdk/client-s3'
import { getEnv } from '../utils/helpers'

export const listS3Objects = async (
  input: ListObjectsV2CommandInput,
  objects: string[] = []
): Promise<string[]> => {
  const client = new S3Client({ region: getEnv('AWS_REGION') })
  const command = new ListObjectsV2Command(input)
  const response = await client.send(command)

  //TODO: response.Contents also contains storage tier when implementing ticket TT2-13
  if (!response.Contents) return []

  response.Contents.map((item) => item.Key).forEach((item) =>
    objects.push(item as string)
  )

  if (response.NextContinuationToken) {
    input.ContinuationToken = response.NextContinuationToken
    await listS3Objects(input, objects)
  }

  return objects
}