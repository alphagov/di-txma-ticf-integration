import {
  getLatestLogStreamName,
  getMatchingLogEvents,
  extractRequestID
} from './utils/helpers'
import { cloudWatchLogsClient } from './libs/cloudWatchLogsClient'
import {
  FilterLogEventsCommand,
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilteredLogEvent
} from '@aws-sdk/client-cloudwatch-logs'

import { createZendeskRequest } from './libs/raiseZendeskRequest'
import { approveZendeskRequest } from './libs/approveZendeskRequest'

describe.only('Submit a PII request with approved ticket data', () => {
  jest.setTimeout(30000)

  it('Should log an entry in cloud watch if request is valid', async () => {
    const ticketID = await createZendeskRequest()

    await approveZendeskRequest(ticketID)

    // CHECK LOGS IN CLOUDWATCH - Cloudwatch API v3
    // Fetch latest log stream until the one logged after request
    const filterPattern = 'INFO received Zendesk webhook'
    let logStreamRequestID = ''
    let latestLogStreamName = ''

    const result = await getLatestLogStreamName()
    latestLogStreamName = result.logStreamName
    console.log(`LATEST LOG STREAM NAME: ${latestLogStreamName}`)

    let eventMatched = false

    while (!eventMatched) {
      const filterLogEventsParams: FilterLogEventsCommandInput = {
        logGroupName:
          '/aws/lambda/ticf-integration-InitiateDataRequestFunction-FgC9L2iTU6pG',
        logStreamNames: [latestLogStreamName],
        filterPattern: filterPattern
      }

      const filterLogEventsCommand = new FilterLogEventsCommand(
        filterLogEventsParams
      )
      const filterLogEventsResponse: FilterLogEventsCommandOutput =
        await cloudWatchLogsClient.send(filterLogEventsCommand)
      const filterLogEvents: FilteredLogEvent[] | undefined =
        filterLogEventsResponse.events

      expect(filterLogEvents).toBeDefined()
      expect(filterLogEvents?.length).toBeGreaterThanOrEqual(1)

      filterLogEvents!.map((e) => {
        if (
          e.message?.includes(`"zendeskId`) &&
          e.message.includes(`"${ticketID}`)
        ) {
          console.log('Ticket Event matched')
          console.log(`TICKET ID: ${ticketID}`)
          console.log(`LATEST LOG STREAM NAME: ${latestLogStreamName}`)
          console.log(`MATCHED EVENT: ${e.message}`)
          logStreamRequestID = extractRequestID(e.message)

          eventMatched = true
        } else {
          console.log('Ticket event not found')
          getLatestLogStreamName().then((result) => {
            latestLogStreamName = result.logStreamName
          })
        }
      })
    }

    // filter for ticket's validation event
    const validRequestFilterPattern = `"${logStreamRequestID}" transfer`
    console.log(`VALIDATION FILTER PATTERN: ${validRequestFilterPattern}`)
    let validationEvents: FilteredLogEvent[] = []
    validationEvents = await getMatchingLogEvents(
      validRequestFilterPattern,
      latestLogStreamName
    )

    expect(validationEvents).toBeDefined()
    expect(validationEvents?.length).toEqual(1)
    console.log(`VALIDATION EVENT: ${validationEvents?.[0].message}`)
  })
})