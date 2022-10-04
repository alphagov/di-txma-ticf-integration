import { handler } from './initiateAthenaQuery'
import { confirmAthenaTable } from '../services/athena/confirmAthenaTable'
import { createQuerySql } from '../services/athena/createQuerySql'
import { ConfirmAthenaTableResult } from '../types/athena/confirmAthenaTableResult'
import { testAthenaQueryEvent } from '../utils/tests/events/initiateAthenaQueryEvent'
import { updateZendeskTicketById } from '../services/updateZendeskTicket'
import { getQueryByZendeskId } from '../services/dynamoDB/dynamoDBGet'

jest.mock('../services/athena/confirmAthenaTable', () => ({
  confirmAthenaTable: jest.fn()
}))
jest.mock('../services/updateZendeskTicket', () => ({
  updateZendeskTicketById: jest.fn()
}))
jest.mock('../services/dynamoDB/dynamoDBGet', () => ({
  getQueryByZendeskId: jest.fn()
}))
jest.mock('../services/athena/createQuerySql', () => ({
  createQuerySql: jest.fn()
}))

const mockConfirmAthenaTable = confirmAthenaTable as jest.Mock<
  Promise<ConfirmAthenaTableResult>
>
const mockUpdateZendeskTicket = updateZendeskTicketById as jest.Mock
const mockGetQueryByZendeskId = getQueryByZendeskId as jest.Mock
const mockCreateQuerySql = createQuerySql as jest.Mock

describe('initiate athena query handler', () => {
  beforeEach(() => {
    mockConfirmAthenaTable.mockReset()
    mockCreateQuerySql.mockReset()
  })

  it('confirms whether the athena data source exists and whether query sql has been generated', async () => {
    mockConfirmAthenaTable.mockResolvedValue({
      tableAvailable: true,
      message: 'test message'
    })
    mockCreateQuerySql.mockReturnValue({
      sqlGenerated: true,
      sql: 'test sql string',
      idParameters: ['123']
    })

    await handler(testAthenaQueryEvent)
    expect(mockConfirmAthenaTable).toHaveBeenCalled()
    expect(mockCreateQuerySql).toHaveBeenCalled()
  })

  it('updates zendesk and throws an error if there is no athena data source', async () => {
    mockConfirmAthenaTable.mockResolvedValue({
      tableAvailable: false,
      message: 'test error message'
    })
    await expect(handler(testAthenaQueryEvent)).rejects.toThrow(
      'test error message'
    )
    expect(mockGetQueryByZendeskId).toHaveBeenCalled()
    expect(mockConfirmAthenaTable).toHaveBeenCalled()
    expect(mockUpdateZendeskTicket).toHaveBeenCalled()
  })

  it('throws an error if there is no data in the SQS Event', async () => {
    expect(handler({ Records: [] })).rejects.toThrow(
      'No data in Athena Query event'
    )
    expect(mockConfirmAthenaTable).not.toHaveBeenCalled()
  })

  it('updates zendesk and throws an error if no query sql is generated', async () => {
    mockConfirmAthenaTable.mockResolvedValue({
      tableAvailable: true,
      message: 'test message'
    })
    mockCreateQuerySql.mockReturnValue({
      sqlGenerated: false,
      error: 'sql error message'
    })

    await expect(handler(testAthenaQueryEvent)).rejects.toThrow(
      'sql error message'
    )
    expect(mockGetQueryByZendeskId).toHaveBeenCalled()
    expect(mockConfirmAthenaTable).toHaveBeenCalled()
    expect(mockUpdateZendeskTicket).toHaveBeenCalled()
    expect(mockCreateQuerySql).toHaveBeenCalled()
  })
})
