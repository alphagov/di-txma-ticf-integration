import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { initiateDataTransfer } from '../services/initiateDataTransfer'
import { updateZendeskTicket } from '../services/updateZendeskTicket'
import { validateZendeskRequest } from '../services/validateZendeskRequest'
import { DataRequestParams } from '../types/dataRequestParams'
import { ValidatedDataRequestParamsResult } from '../types/validatedDataRequestParamsResult'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('received Zendesk webhook', JSON.stringify(event, null, 2))
  const validatedZendeskRequest = validateZendeskRequest(event.body)
  if (!validatedZendeskRequest.isValid) {
    return handleInvalidRequest(event.body, validatedZendeskRequest)
  }
  const dataTransferInitiateResult = await initiateDataTransfer(
    validatedZendeskRequest.dataRequestParams as DataRequestParams
  )
  return {
    statusCode: dataTransferInitiateResult.success ? 200 : 400,
    body: JSON.stringify({
      message: dataTransferInitiateResult.success
        ? 'data transfer initiated'
        : dataTransferInitiateResult.errorMessage
    })
  }
}

const handleInvalidRequest = async (
  requestBody: string | null,
  validatedZendeskRequest: ValidatedDataRequestParamsResult
) => {
  const validationMessage =
    validatedZendeskRequest.validationMessage ?? 'Ticket parameters invalid'
  await updateZendeskTicket(requestBody, validationMessage)
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: validationMessage
    })
  }
}