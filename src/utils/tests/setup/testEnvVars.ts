import {
  TEST_NOTIFY_SECRET_ARN,
  TEST_ANALYSIS_BUCKET,
  TEST_AUDIT_BUCKET,
  TEST_AWS_ACCOUNT_ID,
  TEST_BATCH_JOB_MANIFEST_BUCKET_ARN,
  TEST_BATCH_JOB_MANIFEST_BUCKET_NAME,
  TEST_BATCH_JOB_ROLE_ARN,
  TEST_ZENDESK_FIELD_ID_DATA_PATHS,
  TEST_ZENDESK_FIELD_ID_DATE_FROM,
  TEST_ZENDESK_FIELD_ID_DATE_TO,
  TEST_ZENDESK_FIELD_ID_EVENT_IDS,
  TEST_ZENDESK_FIELD_ID_IDENTIFIER_TYPE,
  TEST_ZENDESK_FIELD_ID_JOURNEY_IDS,
  TEST_ZENDESK_FIELD_ID_PII_TYPES,
  TEST_ZENDESK_FIELD_ID_SESSION_IDS,
  TEST_ZENDESK_FIELD_ID_USER_IDS,
  TEST_ZENDESK_SECRET_ARN,
  TEST_ANALYSIS_BUCKET_ARN,
  TEST_QUERY_DATABASE_TABLE_NAME,
  MOCK_INITIATE_ATHENA_QUERY_QUEUE_URL,
  MOCK_TERMINATED_JOB_QUEUE_URL,
  TEST_ZENDESK_FIELD_ID_RECIPIENT_EMAIL,
  TEST_ZENDESK_FIELD_ID_RECIPIENT_NAME,
  MOCK_SEND_EMAIL_QUEUE_URL,
  TEST_SECURE_DOWNLOAD_WEBSITE_BASE_PATH,
  TEST_SECURE_DOWNLOAD_DYNAMODB_TABLE_NAME,
  TEST_QUERY_RESULTS_BUCKET,
  TEST_VALID_EMAIL_RECIPIENTS_BUCKET,
  MOCK_QUERY_COMPLETED_QUEUE_URL
} from '../testConstants'

import { MOCK_INITIATE_DATA_REQUEST_QUEUE_URL } from '../testConstants'

process.env.ANALYSIS_BUCKET_NAME = TEST_ANALYSIS_BUCKET
process.env.ANALYSIS_BUCKET_ARN = TEST_ANALYSIS_BUCKET_ARN
process.env.AUDIT_BUCKET_NAME = TEST_AUDIT_BUCKET
process.env.QUERY_RESULTS_BUCKET_NAME = TEST_QUERY_RESULTS_BUCKET
process.env.AWS_REGION = 'eu-west-2'
process.env.AWS_ACCOUNT_ID = TEST_AWS_ACCOUNT_ID
process.env.ATHENA_DATABASE_NAME = 'test_database'
process.env.ATHENA_TABLE_NAME = 'test_table'
process.env.QUERY_REQUEST_DYNAMODB_TABLE_NAME = TEST_QUERY_DATABASE_TABLE_NAME
process.env.ATHENA_WORKGROUP_NAME = 'test_query_workgroup'
process.env.ZENDESK_API_SECRETS_ARN = TEST_ZENDESK_SECRET_ARN
// LEGACY CONSTANT - CODE HAS MOVED TO RESULTS_DELIVERY REPO
process.env.NOTIFY_API_SECRETS_ARN = TEST_NOTIFY_SECRET_ARN
//
process.env.INITIATE_DATA_REQUEST_QUEUE_URL =
  MOCK_INITIATE_DATA_REQUEST_QUEUE_URL
process.env.INITIATE_ATHENA_QUERY_QUEUE_URL =
  MOCK_INITIATE_ATHENA_QUERY_QUEUE_URL
process.env.TERMINATED_JOB_QUEUE_URL = MOCK_TERMINATED_JOB_QUEUE_URL
process.env.SEND_EMAIL_QUEUE_URL = MOCK_SEND_EMAIL_QUEUE_URL
process.env.BATCH_JOB_MANIFEST_BUCKET_ARN = TEST_BATCH_JOB_MANIFEST_BUCKET_ARN
process.env.BATCH_JOB_MANIFEST_BUCKET_NAME = TEST_BATCH_JOB_MANIFEST_BUCKET_NAME
process.env.BATCH_JOB_ROLE_ARN = TEST_BATCH_JOB_ROLE_ARN
process.env.ZENDESK_FIELD_ID_DATA_PATHS =
  TEST_ZENDESK_FIELD_ID_DATA_PATHS.toString()
process.env.ZENDESK_FIELD_ID_DATE_FROM =
  TEST_ZENDESK_FIELD_ID_DATE_FROM.toString()
process.env.ZENDESK_FIELD_ID_DATE_TO = TEST_ZENDESK_FIELD_ID_DATE_TO.toString()
process.env.ZENDESK_FIELD_ID_EVENT_IDS =
  TEST_ZENDESK_FIELD_ID_EVENT_IDS.toString()
process.env.ZENDESK_FIELD_ID_IDENTIFIER_TYPE =
  TEST_ZENDESK_FIELD_ID_IDENTIFIER_TYPE.toString()
process.env.ZENDESK_FIELD_ID_JOURNEY_IDS =
  TEST_ZENDESK_FIELD_ID_JOURNEY_IDS.toString()
process.env.ZENDESK_FIELD_ID_PII_TYPES =
  TEST_ZENDESK_FIELD_ID_PII_TYPES.toString()
process.env.ZENDESK_FIELD_ID_SESSION_IDS =
  TEST_ZENDESK_FIELD_ID_SESSION_IDS.toString()
process.env.ZENDESK_FIELD_ID_USER_IDS =
  TEST_ZENDESK_FIELD_ID_USER_IDS.toString()
process.env.ZENDESK_FIELD_ID_RECIPIENT_EMAIL =
  TEST_ZENDESK_FIELD_ID_RECIPIENT_EMAIL.toString()
process.env.ZENDESK_FIELD_ID_RECIPIENT_NAME =
  TEST_ZENDESK_FIELD_ID_RECIPIENT_NAME.toString()
process.env.SECURE_DOWNLOAD_WEBSITE_BASE_PATH =
  TEST_SECURE_DOWNLOAD_WEBSITE_BASE_PATH
process.env.SECURE_DOWNLOAD_DYNAMODB_TABLE_NAME =
  TEST_SECURE_DOWNLOAD_DYNAMODB_TABLE_NAME
process.env.VALID_EMAIL_RECIPIENTS_BUCKET = TEST_VALID_EMAIL_RECIPIENTS_BUCKET
process.env.QUERY_COMPLETED_QUEUE_URL = MOCK_QUERY_COMPLETED_QUEUE_URL
