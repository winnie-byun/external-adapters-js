const { Requester, Validator } = require('@chainlink/external-adapter')
const { util } = require('@chainlink/ea-bootstrap')

const customError = (data) => data.Response === 'Error'

const customParams = {
  from: ['base', 'from'],
  to: ['quote', 'to'],
  endpoint: false,
}

const execute = (input, callback) => {
  const validator = new Validator(input, customParams)
  if (validator.error) return callback(validator.error.statusCode, validator.errored)

  const jobRunID = validator.validated.id
  const endpoint = validator.validated.data.endpoint || 'convert'
  const url = `https://metals-api.com/api/${endpoint}`
  const from = validator.validated.data.from.toUpperCase()
  const to = validator.validated.data.to.toUpperCase()

  const params = {
    access_key: util.getRandomRequiredEnv('API_KEY'),
    from,
    to,
    amount: 1,
  }

  const config = {
    url,
    params,
  }

  Requester.request(config, customError)
    .then((response) => callback(response.status, Requester.success(jobRunID, response)))
    .catch((error) => callback(500, Requester.errored(jobRunID, error)))
}

module.exports.execute = execute
