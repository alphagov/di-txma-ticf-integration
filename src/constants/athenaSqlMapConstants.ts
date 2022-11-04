export const PII_TYPES_DATA_PATHS_MAP: { [key: string]: string } = {
  passport_number: 'restricted.passport[0].documentnumber',
  passport_expiry_date: 'restricted.passport[0].expirydate',
  drivers_license: 'restricted.drivingpermit',
  dob: 'restricted.birthdate[0].value',
  name: 'restricted.name',
  addresses: 'restricted.address'
}

export const IDENTIFIER_TYPES_EVENT_PATH_MAP: { [key: string]: string } = {
  event_id: 'event_id',
  journey_id: 'user.govuk_signin_journey_id',
  user_id: 'user.user_id',
  session_id: 'user.session_id'
}
