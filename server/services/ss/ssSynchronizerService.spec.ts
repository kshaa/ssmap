import { describe, it } from 'mocha'
import { buildSsSynchronizerService, SSSynchronizerService } from './ssSynchronizerService'
import { buildSsFetcherService } from './ssFetcherService'
import nock from 'nock'
import { buildTestDatabase } from '../database/database.spec'
import { loadDocumentWithUrlFixture } from '../testing/utils/loadDocumentWithUrl'
import sinon from 'sinon'
import { Staleness, ThingKind } from '@shared/synchronizedThing'

describe('SSSynchronizerService', () => {
  let synchronizer: SSSynchronizerService

  before(async () => {
    const database = await buildTestDatabase()
    const fetcher = buildSsFetcherService()
    synchronizer = buildSsSynchronizerService(database, fetcher)

    // Disable real network connections, force use of nock mocks
    nock.disableNetConnect()
  })

  after(async () => {
    // Clean up and re-enable network connections
    nock.cleanAll()
    nock.enableNetConnect()
  })

  it('should sync a feed and its posts', async () => {
    // Use nock to mock the fetch the feed request
    nock('https://www.ss.lv')
      .get('/rss/real-estate/homes-summer-residences/riga/centre.xml')
      .reply(200, (await loadDocumentWithUrlFixture('feedSmall.xml')).text)

    // Also nock the fetch the posts requests (there's two posts in the small test feed)
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)

    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnl.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)

    // Synchronize everything and verify output
    const result = await synchronizer.syncFeedAndPosts('https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml', false)
    
    const postData = {
      "addressInfo": {
        "city": "Rīgas rajons",
        "coordinates": {
          "lat": 56.76125546541569,
          "lng": 23.93245518799888,
        },
        "state": "Rīgas rajons",
        "street": "Orhidejas",
      },
      "genericInfo": {
        "Ciems": "Pēternieki",
        "Iela": "Orhidejas",
        "Istabas": "\n\t\t\t\t\t\t5\n\t\t\t\t\t",
        "Pilsēta, rajons": "Rīgas rajons",
        "Pilsēta/pagasts": "Olaines pag.",
        "Platība": "\n\t\t\t\t\t\t160 m²\n\t\t\t\t\t",
        "Stāvu skaits": "\n\t\t\t\t\t\t2\n\t\t\t\t\t",
        "Zemes platība": "\n\t\t\t\t\t\t2743 m²\n\t\t\t\t\t",
        "Ērtības": "\n\t\t\t\t\t\tBlakus upei, Dārzs, Garāža, Gāzes  katls, Karstais ūdens, Kūts, Šķūnis\n\t\t\t\t\t",
      },
      "price": "149 400 €",
      "title": "Pārdod māju ar iekšējo apdari, tikai 4 km attālumā no Olaines. Līdz īpašumam ved asfaltēts ceļš. Dzelzsbetona pamati, gāzbetona sienas, betona plātņu pārsegumi. Kopējā platība 160 m², papildus plašas bēniņu telpas, kuras iespējams pielāgot dzīvošanai",
    }
    
    const expected = {
      "feed": {
        "createdAt": sinon.match.number,
        "data": {
          "posts": [
            { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html" },
            { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnl.html" },
          ],
          "title": "Sludinājumi - SS.LV - RSS. Nekustamie īpašumi : Mājas, vasarnīcas : Rīga : Centrs, Cenas",
          "ttlSeconds": 5,
        },
        "isListingPage": false,
        "updatedAt": sinon.match.number,
        "url": "https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml",
        "staleness": Staleness.FreshlyFetched,
      },
      "posts": [
        {
          "createdAt": sinon.match.number,
          "data": postData,
          "updatedAt": sinon.match.number,
          "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html",
          "staleness": Staleness.FreshlyFetched,
        },
        {
          "createdAt": sinon.match.number,
          "data": postData,
          "updatedAt": sinon.match.number,
          "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnl.html",
          "staleness": Staleness.FreshlyFetched,
        }
      ],
      "feedPosts": [
        {
          "createdAt": sinon.match.number,
          "updatedAt": sinon.match.number,
          "postUrl": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html",
          "feedUrl": "https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml",
        },
        {
          "createdAt": sinon.match.number,
          "updatedAt": sinon.match.number,
          "postUrl": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnl.html",
          "feedUrl": "https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml",
        },
      ]
    }
    sinon.assert.match(result, expected)

    // Repeat the same thing, everything should be cached
    nock('https://www.ss.lv')
      .get('/rss/real-estate/homes-summer-residences/riga/centre.xml')
      .reply(200, (await loadDocumentWithUrlFixture('feedSmall.xml')).text)
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnl.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)
    const result2 = await synchronizer.syncFeedAndPosts('https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml', false)
    sinon.assert.match(result2, {
      ...expected,
      feed: {
        ...expected.feed,
        staleness: Staleness.Cached,
      },
      posts: expected.posts.map((post: object) => ({
        ...post,
        staleness: Staleness.Cached,
      })),
    })

    // Sync a post URL
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)
    const result3 = await synchronizer.syncSsUrl('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html', false)
    sinon.assert.match(result3, {
      kind: ThingKind.Post,
      data: {
        ...expected.posts[0],
        staleness: Staleness.Cached,
      },
    })

    // Sync a feed URL
    nock('https://www.ss.lv')
      .get('/rss/real-estate/homes-summer-residences/riga/centre.xml')
      .reply(200, (await loadDocumentWithUrlFixture('feedSmall.xml')).text)
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)
    nock('https://www.ss.lv')
      .get('/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html')
      .reply(200, (await loadDocumentWithUrlFixture('post.html')).text)
    const result4 = await synchronizer.syncSsUrl('https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml', true)
    sinon.assert.match(result4, {
      kind: ThingKind.FeedAndPosts,
      data: { 
        feed: { ...expected.feed, staleness: Staleness.Cached }, 
        posts: expected.posts.map((post: object) => ({ ...post, staleness: Staleness.Cached })),
        feedPosts: expected.feedPosts.map((feedPost: object) => ({ ...feedPost })),
      },
    })
  })
})