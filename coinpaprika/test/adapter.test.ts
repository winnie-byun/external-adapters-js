import { assert } from 'chai'
import { assertSuccess, assertError } from '@chainlink/adapter-test-helpers'
import { AdapterRequest } from '@chainlink/types'
import { makeExecute } from '@chainlink/coinpaprika-adapter/dist/adapter'

describe('execute', () => {
  const jobID = '1'
  const execute = makeExecute()

  context('successful calls @integration', () => {
    const requests = [
      { name: 'id not supplied', testData: { data: { base: 'ETH', quote: 'USD' } } },
      { name: 'base/quote', testData: { id: jobID, data: { base: 'ETH', quote: 'USD' } } },
      { name: 'from/to', testData: { id: jobID, data: { from: 'ETH', to: 'USD' } } },
      { name: 'coin/market', testData: { id: jobID, data: { coin: 'ETH', market: 'USD' } } },
      {
        name: 'with coinid',
        testData: { id: jobID, data: { coin: 'ETH', market: 'USD', coinid: 'ethereum' } },
      },
      {
        name: 'gets marketcap',
        testData: { id: jobID, data: { endpoint: 'globalmarketcap', to: 'USD' } },
      },
      {
        name: 'gets bitcoin dominance',
        testData: { id: jobID, data: { endpoint: 'dominance', market: 'BTC' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async (done) => {
        const data = await execute(req.testData as AdapterRequest)
        console.log(data)
        assertSuccess({ expected: 200, actual: data.statusCode }, data, jobID)
        assert.isAbove(data.result, 0)
        assert.isAbove(data.data.result, 0)
        done()
      })
    })
  })

  context('validation error', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      {
        name: 'base not supplied',
        testData: { id: jobID, data: { quote: 'USD' } },
      },
      {
        name: 'quote not supplied',
        testData: { id: jobID, data: { base: 'ETH' } },
      },
      {
        name: 'market cap: market not supplied',
        testData: { id: jobID, data: { endpoint: 'globalmarketcap' } },
      },
      {
        name: 'dominance: market not supplied',
        testData: { id: jobID, data: { endpoint: 'dominance' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async (done) => {
        const data = await execute(req.testData as AdapterRequest)
        assertError({ expected: 400, actual: data.statusCode }, data, jobID)
        done()
      })
    })
  })

  context('error calls @integration', () => {
    const requests = [
      {
        name: 'unknown base',
        testData: { id: jobID, data: { base: 'not_real', quote: 'USD' } },
      },
      {
        name: 'unknown quote',
        testData: { id: jobID, data: { base: 'ETH', quote: 'not_real' } },
      },
      {
        name: 'market cap: unknown market',
        testData: { id: jobID, data: { market: 'not_real', endpoint: 'globalmarketcap' } },
      },
      {
        name: 'dominance: unknown market',
        testData: { id: jobID, data: { market: 'not_real', endpoint: 'dominance' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async (done) => {
        const data = await execute(req.testData as AdapterRequest)
        assertError({ expected: 500, actual: data.statusCode }, data, jobID)
        done()
      })
    })
  })
})
