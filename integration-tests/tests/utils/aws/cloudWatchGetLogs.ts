import { cloudWatchLogsClient } from './cloudWatchLogsClient'
import {
  DescribeLogStreamsCommand,
  LogStream,
  FilterLogEventsCommand,
  FilteredLogEvent
} from '@aws-sdk/client-cloudwatch-logs'
import { pause } from '../helpers'
import { DATA_SENT_TO_QUEUE_MESSAGE } from '../../constants/awsParameters'

export const getCloudWatchLogEventsGroupByMessagePattern = async (
  logGroupName: string,
  eventMessagePatterns: string[],
  maxAttempts = 50
) => {
  const event = await waitForEventWithPatterns(
    logGroupName,
    eventMessagePatterns,
    maxAttempts
  )

  if (!event || !event.message) {
    console.log(
      `After ${maxAttempts} attempts, could not find event matching pattern ${eventMessagePatterns}`
    )
    return []
  }

  const requestId = extractRequestIdFromEventMessage(event.message)
  const eventLogStream = [{ logStreamName: event.logStreamName }]
  const requestEndFilterPattern = [`END RequestId: ${requestId}`]

  // Wait for final request in group
  await waitForEventWithPatterns(
    logGroupName,
    requestEndFilterPattern,
    maxAttempts
  )

  const logEvents = await findMatchingLogEvents(logGroupName, eventLogStream, [
    requestId
  ])
  console.log(
    `Found ${logEvents.length} events for request id ${requestId} in log stream ${eventLogStream[0].logStreamName}`
  )
  return logEvents
}

const getLogStreams = async (logGroupName: string) => {
  const input = {
    logGroupName: logGroupName,
    orderBy: 'LastEventTime',
    descending: true,
    limit: 5
  }
  const command = new DescribeLogStreamsCommand(input)
  const response = await cloudWatchLogsClient.send(command)
  const logStreams = response?.logStreams ?? []

  return logStreams
}

const findMatchingLogEvents = async (
  logGroupName: string,
  logStreams: LogStream[],
  filterPatterns: string[]
) => {
  const input = {
    logGroupName: logGroupName,
    logStreamNames: logStreams.map(
      (logStream) => logStream?.logStreamName
    ) as string[],
    filterPattern: filterPatterns.map((pattern) => `"${pattern}"`).join(' ')
  }
  const command = new FilterLogEventsCommand(input)
  const response = await cloudWatchLogsClient.send(command)

  return response.events ?? []
}

const extractRequestIdFromEventMessage = (message: string) => {
  const requestId = message.split('\t')[1]
  console.log(`RequestId: ${requestId}`)

  return requestId
}

const waitForEventWithPatterns = async (
  logGroupName: string,
  eventMessagePatterns: string[],
  maxAttempts: number
) => {
  let attempts = 0

  while (attempts < maxAttempts) {
    attempts++
    const logStreams = await getLogStreams(logGroupName)

    const logEvents = await findMatchingLogEvents(
      logGroupName,
      logStreams,
      eventMessagePatterns
    )

    if (logEvents.length == 0) {
      await pause(1000)
      continue
    }

    if (logEvents.length > 1) {
      throw Error('More than 1 event matched, check filter patterns')
    }

    console.log(`Found event with patterns: ${eventMessagePatterns}`)
    return logEvents[0]
  }
}

export const assertEventPresent = (
  logEvents: FilteredLogEvent[],
  message: string
) => {
  const eventPresent = logEvents.some((event) =>
    event.message?.includes(message)
  )
  console.log('message', message)
  expect(eventPresent).toEqual(true)
}

export const assertEventNotPresent = (
  logEvents: FilteredLogEvent[],
  message: string
) => {
  const eventPresent = logEvents.some((event) =>
    event.message?.includes(message)
  )
  expect(eventPresent).toEqual(false)
}

export const getQueueMessageId = (logEvents: FilteredLogEvent[]) => {
  const event = logEvents.find((event) =>
    event.message?.includes(DATA_SENT_TO_QUEUE_MESSAGE)
  )

  if (!event || !event.message) throw Error('Message not added to queue')

  return event.message?.split('id')[1].trim()
}