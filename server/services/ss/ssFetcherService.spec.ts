import { describe, it } from 'mocha'
import { expect } from 'chai'
import { buildSsFetcherService, getUniqueUrl } from './ssFetcherService'
import nock from 'nock'
import { loadDocumentWithUrlFixture } from '../testing/utils/loadDocumentWithUrl'

describe('SSFetcherService', () => {
  let fetcher = buildSsFetcherService()

  before(async () => {
    // Disable real network connections, force use of nock mocks
    nock.disableNetConnect()
  })
  after(async () => {
    // Clean up and re-enable network connections
    nock.cleanAll()
    nock.enableNetConnect()
  })
  it('should get the unique url', () => {
    const uniqueUrl = getUniqueUrl('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html#identifier?test=123').urlText
    expect(uniqueUrl).to.equal('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
  })
  it('should throw an error if the url is not a valid ss.lv url', () => {
    expect(() => getUniqueUrl('https://www.google.com').urlText).to.throw()
  })
  it('should be able to fetch a valid post from ss.lv', async () => {
    // Use nock to mock the fetch request
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)

    const post = await fetcher.fetchParsedPost('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
    expect(post.data.addressInfo.city).to.equal('Rīgas rajons')
  })
})