import { ExecuteWithConfig } from '@chainlink/types'
import { Requester, Validator } from '@chainlink/external-adapter'

export const NAME = 'dominance'

const dominanceParams = {
  market: ['market', 'to', 'quote'],
}

const convert = (coin: string) => {
  if (coin === 'BTC') return 'bitcoin'
  return coin
}

export const execute: ExecuteWithConfig = async (request, config) => {
  const validator = new Validator(request, dominanceParams)
  if (validator.error) throw validator.error
  const jobRunID = validator.validated.id

  const url = 'https://api.coinpaprika.com/v1/global'
  const options = {
    ...config.api,
    url,
  }

  const symbol = validator.validated.data.market.toUpperCase()

  const response = Requester.request(options)
  const result = Requester.validateResultNumber(response.data, [
    `${convert(symbol)}_dominance_percentage`,
  ])
  return Requester.success(jobRunID, {
    data: { result },
    result,
    status: 200,
  })
}
