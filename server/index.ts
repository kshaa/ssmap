import { getConfig } from '@src/services/config/getConfig'
import { initServices } from './services/bootstrap/initServices'
import { buildApp, initApp } from './api/buildApi'

;(async () => {
  const config = getConfig()
  const services = await initServices(config)
  const app = buildApp(config, services)
  initApp(config, app)
})()
