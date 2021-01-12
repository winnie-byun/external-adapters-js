import { AdapterResponse, ExecuteWithConfig } from '@chainlink/types'
import { AdapterError, Requester, Validator } from '@chainlink/external-adapter'
import { ErrorRequestHandler } from 'express'

export const NAME = 'price'

const priceParams = {
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  coinid: false,
}

const convertFromTicker = async (ticker: string, coinid: string, jobRunId: string) => {
  if (typeof coinid !== 'undefined') return coinid.toLowerCase()

  const response = await Requester.request({
    url: 'https://api.coinpaprika.com/v1/coins',
  })

  const coin = response.data
    .sort((a: { rank: number }, b: { rank: number }) => (a.rank > b.rank ? 1 : -1))
    .find(
      (x: { symbol: string; rank: number }) =>
        x.symbol.toLowerCase() === ticker.toLowerCase() && x.rank !== 0,
    )
  if (!coin) {
    throw new AdapterError({
      jobRunId,
      message: `Error finding coin on coinpaprika`,
      statusCode: 500,
    })
  }
  return coin.id

}

export const execute: ExecuteWithConfig = async (request, config) => {
  const validator = new Validator(request, priceParams)
  if (validator.error) throw validator.error
  const jobRunID = validator.validated.id

  const symbol = validator.validated.data.base
  const coin = await convertFromTicker(symbol, validator.validated.data.coinid, jobRunID)

  const url = `https://api.coinpaprika.com/v1/tickers/${coin}`
  const market = validator.validated.data.quote

  const params = {
    quotes: market.toUpperCase(),
  }

  const options = {
    ...config.api,
    url,
    params,
  }

  const response = await Requester.request(options)
  const result = Requester.validateResultNumber(response.data, [
    'quotes',
    market.toUpperCase(),
    'price',
  ])
  return Requester.success(jobRunID, {
    data: { result },
    result,
    status: 200,
  })
}
