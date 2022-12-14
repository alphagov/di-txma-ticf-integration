import { readS3DataToString } from '../../sharedServices/s3/readS3DataToString'
import { getEnv } from '../../utils/helpers'
export const isEmailInValidRecipientList = async (
  recipientEmail: string
): Promise<boolean> => {
  console.log(
    `Loading S3 data to check if recipient email is in the pre-defined list of recipients`
  )

  const validRecipientList = await readS3DataToString(
    getEnv('VALID_EMAIL_RECIPIENTS_BUCKET'),
    'valid-email-recipients.txt'
  )
  console.log('Finished loading valid recipient list')
  return validRecipientList.includes(recipientEmail)
}
