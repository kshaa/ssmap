import { describe, it } from 'mocha'
import { buildSsProjectService, SSProjectService } from './ssProjectService'
import { buildTestDatabase } from '../database/database.spec'
import { buildSsSynchronizerService } from './ssSynchronizerService'
import { buildSsFetcherService } from './ssFetcherService'
import nock from 'nock'
import { projectSchema, projectWithContentAndMetadataSchema } from '@shared/project'
import { thingSyncSchema } from '@shared/synchronizedThing'
import { loadDocumentWithUrlFixture } from '../testing/utils/loadDocumentWithUrl'

describe('SSProjectService', () => {
  let projectService: SSProjectService
  let projectId: string

  before(async () => {
    const database = await buildTestDatabase()
    const fetcher = buildSsFetcherService()
    const synchronizer = buildSsSynchronizerService(database, fetcher)
    projectService = buildSsProjectService(database, synchronizer)

    // Disable real network connections, force use of nock mocks
    nock.disableNetConnect()
  })

  after(async () => {
    // Clean up and re-enable network connections
    nock.cleanAll()
    nock.enableNetConnect()
  })

  it('should upsert a project', async () => {
    const project = await projectService.upsertProject({ id: '1', name: 'Test Project' })
    projectSchema.parse(project)
    projectId = project.id
  })

  it('should add a thing to a project', async () => {
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)
    const thing = await projectService.addThing(projectId, 'https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
    thingSyncSchema.parse(thing)
  })

  it('should get a project', async () => {
    const project2 = await projectService.getProject(projectId)
    projectWithContentAndMetadataSchema.parse(project2)
  })
})
