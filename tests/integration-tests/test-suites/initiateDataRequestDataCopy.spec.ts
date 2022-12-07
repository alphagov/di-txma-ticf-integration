import {
  assertEventPresent,
  getCloudWatchLogEventsGroupByMessagePattern,
  getQueueMessageId
} from '../../shared-test-code/utils/aws/cloudWatchGetLogs'
import { createZendeskTicket } from '../../shared-test-code/utils/zendesk/createZendeskTicket'
import { approveZendeskTicket } from '../../shared-test-code/utils/zendesk/approveZendeskTicket'
import { deleteZendeskTicket } from '../../shared-test-code/utils/zendesk/deleteZendeskTicket'
import {
  setCustomFieldValueForRequest,
  validRequestData
} from '../constants/dataCopyRequestData'
import { copyAuditDataFromTestDataBucket } from '../../shared-test-code/utils/aws/s3CopyAuditDataFromTestDataBucket'
import { ZendeskFormFieldIDs } from '../../shared-test-code/constants/zendeskParameters'
import { getAvailableTestDate } from '../../shared-test-code/utils/aws/s3GetAvailableTestDate'
import { getEnv } from '../../shared-test-code/utils/helpers'
import { TEST_FILE_NAME } from '../constants/testData'
import {
  DATA_SENT_TO_QUEUE_MESSAGE,
  SQS_EVENT_RECEIVED_MESSAGE,
  WEBHOOK_RECEIVED_MESSAGE
} from '../constants/cloudWatchLogMessages'

describe('Data should be copied to analysis bucket', () => {
  const COPY_COMPLETE_MESSAGE = 'Restore/copy process complete.'

  const STANDARD_TIER_OBJECTS_TO_COPY_MESSAGE =
    'Number of standard tier files to copy was 1, glacier tier files to copy was 0'
  const GLACIER_TIER_OBJECTS_TO_COPY_MESSAGE =
    'Number of standard tier files to copy was 0, glacier tier files to copy was 1'
  const MIX_TIER_OBJECTS_TO_COPY_MESSAGE =
    'Number of standard tier files to copy was 1, glacier tier files to copy was 1'
  const S3_COPY_JOB_STARTED_MESSAGE =
    'Started S3 copy job for zendesk ticket with id'
  const S3_GLACIER_RESTORE_STARTED_MESSAGE =
    'Started Glacier restore for zendesk ticket with id'

  const generateTestDataWithCustomDate = (date: string) => {
    const data = validRequestData

    setCustomFieldValueForRequest(
      data,
      ZendeskFormFieldIDs.PII_FORM_REQUEST_DATE_FIELD_ID,
      date
    )
    return data
  }

  describe('valid requests for standard copy - analysis bucket empty', () => {
    let ticketId: string

    beforeEach(async () => {
      const availableDate = await getAvailableTestDate()

      await copyAuditDataFromTestDataBucket(
        getEnv('AUDIT_BUCKET_NAME'),
        `${availableDate.prefix}/01/${TEST_FILE_NAME}`,
        TEST_FILE_NAME,
        'STANDARD',
        true
      )
      ticketId = await createZendeskTicket(
        generateTestDataWithCustomDate(availableDate.date)
      )
      await approveZendeskTicket(ticketId)
    })

    afterEach(async () => {
      await deleteZendeskTicket(ticketId)
      console.log('request for valid data all in standard tier test ended')
    })

    test('request for valid data all in standard tier', async () => {
      console.log('request for valid data all in standard tier test started')
      const initiateDataRequestEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('INITIATE_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [WEBHOOK_RECEIVED_MESSAGE, 'zendeskId', `${ticketId}\\\\`]
        )
      expect(initiateDataRequestEvents).not.toEqual([])

      assertEventPresent(initiateDataRequestEvents, DATA_SENT_TO_QUEUE_MESSAGE)

      const messageId = getQueueMessageId(
        initiateDataRequestEvents,
        DATA_SENT_TO_QUEUE_MESSAGE
      )
      console.log('messageId', messageId)

      const processDataRequestEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('PROCESS_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [SQS_EVENT_RECEIVED_MESSAGE, 'messageId', messageId],
          50
        )

      expect(processDataRequestEvents).not.toEqual([])

      assertEventPresent(
        processDataRequestEvents,
        STANDARD_TIER_OBJECTS_TO_COPY_MESSAGE
      )
      assertEventPresent(processDataRequestEvents, S3_COPY_JOB_STARTED_MESSAGE)

      const copyCompletedEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('PROCESS_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [COPY_COMPLETE_MESSAGE, 'zendeskId', ticketId],
          100
        )
      expect(copyCompletedEvents).not.toEqual([])

      assertEventPresent(copyCompletedEvents, COPY_COMPLETE_MESSAGE)
    })
  })

  describe('valid requests for glacier copy - analysis bucket empty', () => {
    let ticketId: string

    beforeEach(async () => {
      const availableDate = await getAvailableTestDate()

      await copyAuditDataFromTestDataBucket(
        getEnv('AUDIT_BUCKET_NAME'),
        `${availableDate.prefix}/01/${TEST_FILE_NAME}`,
        TEST_FILE_NAME,
        'GLACIER',
        true
      )
      ticketId = await createZendeskTicket(
        generateTestDataWithCustomDate(availableDate.date)
      )
      await approveZendeskTicket(ticketId)
    })

    afterEach(async () => {
      console.log('request for valid data all in glacier tier test ended')
    })

    test('request for valid data all in glacier tier', async () => {
      console.log('request for valid data all in glacier tier test started')
      const initiateDataRequestEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('INITIATE_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [WEBHOOK_RECEIVED_MESSAGE, 'zendeskId', `${ticketId}\\\\`]
        )
      expect(initiateDataRequestEvents).not.toEqual([])

      assertEventPresent(initiateDataRequestEvents, DATA_SENT_TO_QUEUE_MESSAGE)

      const messageId = getQueueMessageId(
        initiateDataRequestEvents,
        DATA_SENT_TO_QUEUE_MESSAGE
      )

      const processDataRequestEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('PROCESS_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [SQS_EVENT_RECEIVED_MESSAGE, 'messageId', messageId],
          70
        )
      expect(processDataRequestEvents).not.toEqual([])

      assertEventPresent(
        processDataRequestEvents,
        GLACIER_TIER_OBJECTS_TO_COPY_MESSAGE
      )
      assertEventPresent(
        processDataRequestEvents,
        S3_GLACIER_RESTORE_STARTED_MESSAGE
      )
    })
  })

  describe('valid requests for standard and glacier copy - analysis bucket empty', () => {
    let ticketId: string

    beforeEach(async () => {
      const availableDate = await getAvailableTestDate()
      console.log(availableDate)

      const response = await copyAuditDataFromTestDataBucket(
        getEnv('AUDIT_BUCKET_NAME'),
        `${availableDate.prefix}/01/${TEST_FILE_NAME}`,
        TEST_FILE_NAME,
        'GLACIER',
        true
      )

      console.log(response)
      await copyAuditDataFromTestDataBucket(
        getEnv('AUDIT_BUCKET_NAME'),
        `${availableDate.prefix}/02/${TEST_FILE_NAME}`,
        TEST_FILE_NAME,
        'STANDARD',
        true
      )
      ticketId = await createZendeskTicket(
        generateTestDataWithCustomDate(availableDate.date)
      )
      await approveZendeskTicket(ticketId)
    })

    afterEach(async () => {
      console.log(
        'valid request with data in standard and glacier tier test ended'
      )
    })

    test('valid request with data in standard and glacier tier', async () => {
      console.log(
        'valid request with data in standard and glacier tier test started'
      )

      const initiateDataRequestEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('INITIATE_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [WEBHOOK_RECEIVED_MESSAGE, 'zendeskId', `${ticketId}\\\\`]
        )
      expect(initiateDataRequestEvents).not.toEqual([])

      assertEventPresent(initiateDataRequestEvents, DATA_SENT_TO_QUEUE_MESSAGE)

      const messageId = getQueueMessageId(
        initiateDataRequestEvents,
        DATA_SENT_TO_QUEUE_MESSAGE
      )
      console.log('messageId', messageId)

      const processDataRequestEvents =
        await getCloudWatchLogEventsGroupByMessagePattern(
          getEnv('PROCESS_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME'),
          [SQS_EVENT_RECEIVED_MESSAGE, 'messageId', messageId],
          50
        )
      expect(processDataRequestEvents).not.toEqual([])

      assertEventPresent(
        processDataRequestEvents,
        MIX_TIER_OBJECTS_TO_COPY_MESSAGE
      )
    })
  })
})
