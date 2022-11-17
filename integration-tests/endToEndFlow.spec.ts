import {
  ANALYSIS_BUCKET_NAME,
  AUDIT_BUCKET_NAME,
  END_TO_END_TEST_DATE_PREFIX,
  END_TO_END_TEST_EVENT_ID,
  END_TO_END_TEST_FILE_NAME
} from './constants/awsParameters'
import { copyAuditDataFromTestDataBucket } from './utils/aws/s3CopyAuditDataFromTestDataBucket'
import { deleteAuditDataWithPrefix } from './utils/aws/s3DeleteAuditDataWithPrefix'
import { approveZendeskTicket } from './utils/zendesk/approveZendeskTicket'
import { createZendeskTicket } from './utils/zendesk/createZendeskTicket'
import {
  endToEndFlowRequestDataNoMatch,
  endToEndFlowRequestDataWithEventId,
  endToEndFlowRequestDataWithJourneyId,
  endToEndFlowRequestDataWithSessionId,
  endToEndFlowRequestDataWithUserId
} from './constants/requestData/endToEndFlowRequestData'
import { downloadResultsFileAndParseData } from './utils/queryResults/downloadAndParseResults'

describe('Query results generated', () => {
  jest.setTimeout(90000)

  beforeEach(async () => {
    await deleteAuditDataWithPrefix(
      AUDIT_BUCKET_NAME,
      `firehose/${END_TO_END_TEST_DATE_PREFIX}`
    )

    await copyAuditDataFromTestDataBucket(
      AUDIT_BUCKET_NAME,
      `firehose/${END_TO_END_TEST_DATE_PREFIX}/01/${END_TO_END_TEST_FILE_NAME}`,
      END_TO_END_TEST_FILE_NAME
    )
  })

  afterEach(async () => {
    await deleteAuditDataWithPrefix(
      ANALYSIS_BUCKET_NAME,
      `firehose/${END_TO_END_TEST_DATE_PREFIX}`
    )
  })

  it('Query matching data with event id and data paths', async () => {
    const EXPECTED_ADDRESS_VALID_FROM_DATE = `"2014-01-01"`
    const EXPECTED_BIRTH_DATE = `"1981-07-28"`
    const EXPECTED_POSTALCODE = `"EH2 5BJ"`
    // const EXPECTED_FIRSTNAME = `"MICHELLE"`
    const EXPECTED_LASTNAME = `"KABIR"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithEventId
    )
    await approveZendeskTicket(zendeskId)

    const rows = await downloadResultsFileAndParseData(zendeskId)

    expect(rows.length).toEqual(1)
    expect(rows[0].event_id).toEqual(END_TO_END_TEST_EVENT_ID)
    // expect(rows[0].name_nameparts_value).toEqual(EXPECTED_FIRSTNAME)
    expect(rows[0].name_nameparts_value).toEqual(EXPECTED_LASTNAME)
    expect(rows[0].birthdate_value).toEqual(EXPECTED_BIRTH_DATE)
    expect(rows[0].address_validfrom).toEqual(EXPECTED_ADDRESS_VALID_FROM_DATE)
    expect(rows[0].address_postalcode).toEqual(EXPECTED_POSTALCODE)
  })

  it('Query matching data with user id', async () => {
    const EXPECTED_PASSPORT_NUMBER = `"543543543"`
    const EXPECTED_PASSPORT_EXPIRY_DATE = `"2030-01-01"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithUserId
    )
    await approveZendeskTicket(zendeskId)

    const rows = await downloadResultsFileAndParseData(zendeskId)
    expect(rows.length).toEqual(1)
    expect(rows[0].passport_number).toEqual(EXPECTED_PASSPORT_NUMBER)
    expect(rows[0].passport_expiry_date).toEqual(EXPECTED_PASSPORT_EXPIRY_DATE)
  })

  it('Query matching data with journey id', async () => {
    const EXPECTED_DRIVERS_LICENSE = [
      {
        expirydate: '2024-06-19',
        issuenumber: '96',
        personalnumber: 'BINNS902235OW9TF',
        issuedby: 'DVLA',
        issuedate: '2014-06-20'
      }
    ]

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithJourneyId
    )
    await approveZendeskTicket(zendeskId)

    const rows = await downloadResultsFileAndParseData(zendeskId)
    expect(rows.length).toEqual(1)
    expect.arrayContaining(EXPECTED_DRIVERS_LICENSE)
  })

  it('Query matching data with session id', async () => {
    const EXPECTED_BIRTH_DATE = `"1981-07-28"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithSessionId
    )
    await approveZendeskTicket(zendeskId)

    const rows = await downloadResultsFileAndParseData(zendeskId)

    expect(rows.length).toEqual(1)
    expect(rows[0].name).toBeDefined()
    expect(rows[0].addresses).toBeDefined()
    expect(rows[0].dob).toEqual(EXPECTED_BIRTH_DATE)
  })

  it('Query does not match data - Empty CSV file should be downloaded', async () => {
    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataNoMatch
    )
    await approveZendeskTicket(zendeskId)

    const rows = await downloadResultsFileAndParseData(zendeskId)
    expect(rows.length).toEqual(0)
  })
})
