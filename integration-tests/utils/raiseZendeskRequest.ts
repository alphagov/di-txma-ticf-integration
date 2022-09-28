import axios, { AxiosResponse } from 'axios'
import { getEndUsername, getZendeskBaseURL } from '../lib/zendeskParameters'

import { authoriseAs } from './helpers'

import { validRequestData } from '../lib/requestData'

const createRequestEndpoint = '/api/v2/requests.json'
const zendeskBaseURL: string = getZendeskBaseURL()
const endUsername: string = getEndUsername()

const createZendeskRequest = async (): Promise<string> => {
  const axiosResponse: AxiosResponse<any, any> = await axios({
    url: `${zendeskBaseURL}${createRequestEndpoint}`,
    method: 'POST',
    headers: {
      Authorization: `Basic ${authoriseAs(endUsername)}`,
      'Content-Type': 'application/json'
    },
    data: validRequestData
  })

  expect(axiosResponse.status).toBe(201)
  expect(axiosResponse.data.request.id).toBeDefined()

  const ticketID: string = axiosResponse.data.request.id

  console.log(`TICKET ID: ${ticketID}`)

  return ticketID
}

export { createZendeskRequest }