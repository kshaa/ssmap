import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import { loadDocumentWithUrlFixture } from '../testing/utils/loadDocumentWithUrl'
import { getPosts, getTitle, getTtlSeconds, parseFeedDocument } from './parseFeedDocument'
import { JSDOM } from 'jsdom'
import { MIN_FEED_TTL_SECONDS } from '../ss/common'

describe('FeedParser', () => {
  let text: string
  let xml: Document

  before(async () => {
    const result = await loadDocumentWithUrlFixture('feed.xml')
    text = result.text
    const dom = new JSDOM(text, { contentType: 'text/xml' })
    xml = dom.window.document
  })

  describe('getFeedTitle', () => {
    it('should extract the feed title from document', () => {
      const title = getTitle(xml)
      expect(title).to.include('Sludinājumi - SS.LV - RSS. Nekustamie īpašumi : Mājas, vasarnīcas : Rīga : Centrs, Cenas')
    })
  })

  describe('getFeedTtlSeconds', () => {
    it('should extract the post price from document', () => {
      const ttlSeconds = getTtlSeconds(xml, MIN_FEED_TTL_SECONDS)
      expect(ttlSeconds).to.equal(5)
    })
  })

  describe('getFeedPosts', () => {
    it('should extract generic info fields from document', () => {
      const posts = getPosts(xml)
      expect(posts).to.length(20)
    })
  })

  describe('parseFeedDocument', () => {
    it('should extract address info from document', () => {
      const feed = parseFeedDocument(text)
      expect(feed).to.deep.equal({
        title: 'Sludinājumi - SS.LV - RSS. Nekustamie īpašumi : Mājas, vasarnīcas : Rīga : Centrs, Cenas',
        ttlSeconds: 5,
        posts: [
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/ocdem.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/ggibm.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bdllkj.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/ocdbh.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/afolk.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/idkkn.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bbjnxg.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/gpxid.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bbdigi.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/blxxn.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/blgfoj.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bdlpij.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/nbfdf.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/cioee.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bbblbh.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bfcxio.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/bbxjlk.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/epcec.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/ocnnh.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga/centre/adbop.html" },
        ],
      })
    })
  })
})
