// import * as CSV from 'csv-string'
import {
  AUDIT_BUCKET_NAME,
  END_TO_END_TEST_DATE_PREFIX,
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

describe('Query results generated', () => {
  jest.setTimeout(60000)

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

  it('Query matches data - CSV file containing query results can be downloaded', async () => {
    const EXPECTED_ADDRESS_VALID_FROM_DATE = `"2014-01-01"`
    const EXPECTED_BIRTH_DATE = `"1981-07-28"`
    const EXPECTED_POSTALCODE = `"EH2 5BJ"`
    const EXPECTED_FIRSTNAME = `"MICHELLE"`
    const EXPECTED_LASTNAME = `"KABIR"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithEventId
    )
    await approveZendeskTicket(zendeskId)

    //TODO: REPLACE with: call link within email to download results

    /*const rows = await waitForDownloadHashAndDownloadResults(zendeskId)
    expect(rows.length).toEqual(1)
    expect(rows[0].event_id).toEqual(END_TO_END_TEST_EVENT_ID)
    expect(rows[0].name).toBeDefined()
    expect(rows[0].name_nameparts_value).toEqual(EXPECTED_FIRSTNAME)
    expect(rows[0].name_nameparts_value).toEqual(EXPECTED_LASTNAME)
    expect(rows[0].birthdate_value).toEqual(EXPECTED_BIRTH_DATE)
    expect(rows[0].address_validfrom).toEqual(EXPECTED_ADDRESS_VALID_FROM_DATE)
    expect(rows[0].address_postalcode).toEqual(EXPECTED_POSTALCODE)*/

    console.log(EXPECTED_ADDRESS_VALID_FROM_DATE)
    console.log(EXPECTED_BIRTH_DATE)
    console.log(EXPECTED_POSTALCODE)
    console.log(EXPECTED_FIRSTNAME)
    console.log(EXPECTED_LASTNAME)
  })

  it('Query matching data with user id', async () => {
    const EXPECTED_PASSPORT_NUMBER = `"543543543"`
    const EXPECTED_PASSPORT_EXPIRY_DATE = `"2030-01-01"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithUserId
    )
    await approveZendeskTicket(zendeskId)

    //TODO: REPLACE with: call link within email to download results

    /*const rows = await waitForDownloadHashAndDownloadResults(zendeskId)
    const rows = await downloadResultsFromEmailLink(zendeskId)
    expect(rows.length).toEqual(1)
    expect(rows[0].passport_documentnumber).toEqual(EXPECTED_PASSPORT_NUMBER)
    expect(rows[0].passport_expirydate).toEqual(EXPECTED_PASSPORT_EXPIRY_DATE)*/

    console.log(EXPECTED_PASSPORT_NUMBER)
    console.log(EXPECTED_PASSPORT_EXPIRY_DATE)
  })

  it('Query matching data with journey id', async () => {
    const EXPECTED_DRIVERS_LICENSE_NUMBER = `"BINNS902235OW9TF"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithJourneyId
    )
    await approveZendeskTicket(zendeskId)

    //TODO: REPLACE with: call link within email to download results

    /*const rows = await waitForDownloadHashAndDownloadResults(zendeskId)
    expect(rows.length).toEqual(1)
    expect(rows[0].drivingpermit).toEqual(EXPECTED_DRIVERS_LICENSE_NUMBER)*/

    console.log(EXPECTED_DRIVERS_LICENSE_NUMBER)
  })

  it('Query matching data with session id', async () => {
    const EXPECTED_BIRTH_DATE = `"1981-07-28"`

    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataWithSessionId
    )
    await approveZendeskTicket(zendeskId)

    //TODO: REPLACE with: call link within email to download results

    /*const rows = await waitForDownloadHashAndDownloadResults(zendeskId)
    expect(rows.length).toEqual(1)
    expect(rows[0].name).toBeDefined()
    expect(rows[0].address).toBeDefined()
    expect(rows[0].birthdate_value).toEqual(EXPECTED_BIRTH_DATE)*/

    console.log(EXPECTED_BIRTH_DATE)
  })

  it('Query does not match data - Empty CSV file should be downloaded', async () => {
    const zendeskId: string = await createZendeskTicket(
      endToEndFlowRequestDataNoMatch
    )
    await approveZendeskTicket(zendeskId)

    //TODO: REPLACE with: call link within email to download results

    /*const rows = await waitForDownloadHashAndDownloadResults(zendeskId)
    console.log(rows)
    expect(rows.length).toEqual(0)*/
  })

  /*async function waitForDownloadHashAndDownloadResults(zendeskId: string) {
    const downloadHash = await waitForDownloadHash(zendeskId)

    const secureDownloadPageHTML = await getSecureDownloadPageHTML(downloadHash)
    expect(secureDownloadPageHTML).toBeDefined()

    const resultsFileS3Link = retrieveS3LinkFromHtml(secureDownloadPageHTML)
    expect(resultsFileS3Link.startsWith('https')).toBeTrue

    const csvData = await downloadResultsCSVFromLink(resultsFileS3Link)
    console.log(csvData)

    const rows = CSV.parse(csvData, { output: 'objects' })
    console.log(rows)
    return rows
  }*/
})
