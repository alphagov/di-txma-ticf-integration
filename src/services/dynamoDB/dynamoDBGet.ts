import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import {
  DataRequestParams,
  isDataRequestParams
} from '../../types/dataRequestParams'
import { getEnv } from '../../utils/helpers'
import { ddbClient } from './dynamoDBClient'

export const getQueryByZendeskId = async (
  zendeskId: string
): Promise<DataRequestParams> => {
  const params = {
    TableName: getEnv('DYNAMODB_TABLE_NAME'),
    Key: { zendeskId: { S: zendeskId } }
  }

  const data = await ddbClient.send(new GetItemCommand(params))
  console.log(data)
  const responseObject = data?.Item?.requestInfo?.M
  if (!responseObject) {
    throw new Error(
      `Request info not returned from db for zendesk ticket: ${zendeskId}`
    )
  }

  const dataRequestParams = {
    zendeskId: responseObject?.zendeskId?.S,
    resultsEmail: responseObject?.resultsEmail?.S,
    resultsName: responseObject?.resultsName?.S,
    dateFrom: responseObject?.dateFrom?.S,
    dateTo: responseObject?.dateTo?.S,
    identifierType: responseObject?.identifierType?.S,
    sessionIds: responseObject?.sessionIds?.L?.map((id) => id.S),
    journeyIds: responseObject?.journeyIds?.L?.map((id) => id.S),
    eventIds: responseObject?.eventIds?.L?.map((id) => id.S),
    userIds: responseObject?.userIds?.L?.map((id) => id.S),
    piiTypes: responseObject?.piiTypes?.L?.map((piiType) => piiType.S),
    dataPaths: responseObject?.dataPaths?.L?.map((path) => path.S)
  }

  if (!isDataRequestParams(dataRequestParams)) {
    throw new Error(
      `Event data returned from db was not of correct type for zendesk ticket: ${zendeskId}`
    )
  }

  return dataRequestParams
}