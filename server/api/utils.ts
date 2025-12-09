import { Config } from '@src/services/config/getConfig'
import { Services } from '@src/services/bootstrap/initServices'
import Koa from 'koa'
import Router from 'koa-router'

export interface AppContextRaw {
  config: Config
  services: Services
}

export type App = Koa<Koa.DefaultState, AppContextRaw>
// export type AppContext = Koa.ParameterizedContext<Koa.DefaultState, AppContextRaw>

export const createRouter = <S>(...props: ConstructorParameters<typeof Router<S, AppContextRaw>>) => new Router<S, AppContextRaw>(...props)
