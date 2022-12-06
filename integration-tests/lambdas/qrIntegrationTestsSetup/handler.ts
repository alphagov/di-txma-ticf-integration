import { SQSEvent } from 'aws-lambda'
import { tryParseJSON } from '../../../src/utils/helpers'

export const handler = async (event: SQSEvent) => {
  console.log(
    'Handling QR integration tests trigger setup event',
    JSON.stringify(event, null, 2)
  )

  const message = parseRequestDetails(event)

  return message
}

const parseRequestDetails = (event: SQSEvent) => {
  if (!event.Records.length) {
    throw Error('No records found in event')
  }

  const eventBody = event.Records[0].body
  if (!eventBody) {
    throw Error('test error')
  }

  const requestDetails = tryParseJSON(eventBody)
  if (!requestDetails.message) {
    throw Error('test error')
  }

  return requestDetails.message
}
