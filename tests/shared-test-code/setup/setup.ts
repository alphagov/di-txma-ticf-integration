import { checkSecretsSet, retrieveSecretValue } from './retrieveSecretValue'
import { retrieveSsmParameterValue } from './retrieveSsmParameterValues'
import { getOutputValue, retrieveStackOutputs } from './retrieveStackOutputs'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const AWS_REGION: string
  const STACK_NAME: string
  const ZENDESK_ADMIN_EMAIL: string
  const ZENDESK_AGENT_EMAIL: string
  const ZENDESK_END_USER_EMAIL: string
  const ZENDESK_END_USER_NAME: string
  const ZENDESK_RECIPIENT_NAME: string
}

const region = global.AWS_REGION
const stack = process.env.STACK_NAME
  ? process.env.STACK_NAME
  : global.STACK_NAME

module.exports = async () => {
  const secretMappings = {
    [`tests/${stack}/ZendeskSecrets`]: [
      'ZENDESK_API_KEY',
      'ZENDESK_HOSTNAME',
      'ZENDESK_RECIPIENT_EMAIL',
      'ZENDESK_WEBHOOK_SECRET_KEY'
    ],
    [`tests/${stack}/NotifySecrets`]: ['NOTIFY_API_KEY']
  }

  const ssmMappings = {
    AUDIT_BUCKET_NAME: `/tests/${stack}/AuditBucketName`,
    AUDIT_REQUEST_DYNAMODB_TABLE: `/tests/${stack}/QueryRequestTableName`,
    DYNAMO_OPERATIONS_FUNCTION_NAME: `/tests/${stack}/DynamoOperationsFunctionName`,
    SQS_OPERATIONS_FUNCTION_NAME: `/tests/${stack}/SqsOperationsFunctionName`,
    TEST_DATA_BUCKET_NAME: `/tests/${stack}/IntegrationTestDataBucketName`
  }

  const stackOutputMappings = {
    ANALYSIS_BUCKET_NAME: 'AnalysisBucketName',
    INITIATE_ATHENA_QUERY_QUEUE_URL: 'InitiateAthenaQueryQueueUrl',
    INITIATE_ATHENA_QUERY_LAMBDA_LOG_GROUP_NAME:
      'InitiateAthenaQueryLambdaLogGroupName',
    INITIATE_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME:
      'InitiateDataRequestLambdaLogGroupName',
    PROCESS_DATA_REQUEST_LAMBDA_LOG_GROUP_NAME:
      'ProcessDataRequestLambdaLogGroupName',
    ZENDESK_WEBHOOK_API_BASE_URL: 'ZendeskWebhookApiUrl'
  }

  const globals = [
    'AWS_REGION',
    'ZENDESK_ADMIN_EMAIL',
    'ZENDESK_AGENT_EMAIL',
    'ZENDESK_END_USER_EMAIL',
    'ZENDESK_END_USER_NAME',
    'ZENDESK_RECIPIENT_NAME'
  ]

  await setEnvVarsFromSecretsManager(secretMappings)
  await setEnvVarsFromSsm(ssmMappings)
  await setEnvVarsFromStackOutputs(stack, stackOutputMappings)
  setEnvVarsFromJestGlobals(globals)
}

const setEnvVarsFromSecretsManager = async (secretMappings: {
  [key: string]: string[]
}) => {
  for (const [secretSet, secrets] of Object.entries(secretMappings)) {
    const secretValues = await retrieveSecretValue(secretSet, region)
    checkSecretsSet(secretSet, secretValues, secrets)

    secrets.forEach(
      (secret) =>
        (process.env[secret] = process.env[secret]
          ? process.env[secret]
          : secretValues[secret])
    )
  }
}

const setEnvVarsFromSsm = async (ssmMappings: { [key: string]: string }) => {
  for (const [k, v] of Object.entries(ssmMappings)) {
    process.env[k] = process.env[k]
      ? process.env[k]
      : await retrieveSsmParameterValue(v, region)
  }
}

const setEnvVarsFromStackOutputs = async (
  stack: string,
  stackOutputMappings: {
    [key: string]: string
  }
) => {
  const stackOutputs = await retrieveStackOutputs(stack, region)

  for (const [k, v] of Object.entries(stackOutputMappings)) {
    process.env[k] = process.env[k]
      ? process.env[k]
      : getOutputValue(stackOutputs, v)
  }
}

const setEnvVarsFromJestGlobals = (globals: string[]) => {
  globals.forEach(
    (v) =>
      (process.env[v] = process.env[v]
        ? process.env[v]
        : global[v as keyof typeof global])
  )
}
