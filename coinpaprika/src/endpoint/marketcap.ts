import { Requester, Validator } from '@chainlink/external-adapter'
import { ExecuteWithConfig } from '@chainlink/types'

export const NAME = 'marketcap'

const marketcapParams = {
  market: ['market', 'to', 'quote'],
}

export const execute: ExecuteWithConfig = async (request, config) => {
  const validator = new Validator(request, marketcapParams)
  if (validator.error) throw validator.error
  const symbol = validator.validated.data.market.toLowerCase()
  const jobRunID = validator.validated.id

  const url = 'https://api.coinpaprika.com/v1/global'
  const options = {
    ...config.api,
    url,
  }

  const response = Requester.request(options)
  const result = Requester.validateResultNumber(response.data, [`market_cap_${symbol}`])

  return Requester.success(jobRunID, {
    data: { result },
    result,
    status: 200,
  })
}
