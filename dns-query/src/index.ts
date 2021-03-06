import { expose, util } from '@chainlink/ea-bootstrap'
import { makeExecute } from './adapter'
import { makeConfig } from './config'

const NAME = 'DNS-Query'

export = { NAME, makeConfig, makeExecute, ...expose(util.wrapExecute(makeExecute())) }
