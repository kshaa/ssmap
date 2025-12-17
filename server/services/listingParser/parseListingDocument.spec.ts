import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import { loadDocumentWithUrlFixture } from '../testing/utils/loadDocumentWithUrl'
import { JSDOM } from 'jsdom'
import { parseListingDocument } from './parseListingDocument'

describe('ListingParser', () => {
  let text: string
  let html: Document

  before(async () => {
    const result = await loadDocumentWithUrlFixture('listingPage.html')
    text = result.text
    const dom = new JSDOM(text, { contentType: 'text/html' })
    html = dom.window.document
  })

  describe('parseListingDocument', () => {
    it('should extract address info from document', () => {
      const feed = parseListingDocument(text)
      expect(feed).to.deep.equal({
        "posts": [
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/gnblx.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/eejdd.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/dundagas-pag/jideh.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/rojas-pag/bjxbed.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/doexn.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/mersraga-pag/deomh.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/sabile/ciccf.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/lubes-pag/bfendi.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/lubes-pag/bghlgk.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/ives-pag/gnelc.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/laidzes-pag/jeexf.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/gibulu-pag/bbdio.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/agpie.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/bkkjbe.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/dundagas-pag/jffxo.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/gnkgx.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/laidzes-pag/iennk.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/ives-pag/beiigc.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/cexfn.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/balgales-pag/fpofl.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/stende/afnxe.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/rojas-pag/aaoxe.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/vandzenes-pag/bhgobl.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/hjkde.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/fkipg.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/laucienes-pag/agpcp.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/cbhip.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/dundagas-pag/ifnnd.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/afcih.html" },
          { "url": "https://www.ss.lv/msg/lv/real-estate/flats/talsi-and-reg/talsi/flinf.html" },
        ]
      })
    })
  })
})
