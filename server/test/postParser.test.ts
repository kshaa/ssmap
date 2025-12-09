import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { getPostTitle } from '@src/services/postParser/getPostTitle'
import { getPostPrice } from '@src/services/postParser/getPostPrice'
import { getPostGenericInfo } from '@src/services/postParser/getPostGenericInfo'
import { getPostAddressInfo } from '@src/services/postParser/getPostAddressInfo'
import { loadFixture } from '@test/common/loadFixture'

describe('PostParser', () => {
  let dom: JSDOM

  before(async () => {
    const html = await loadFixture('post.html')
    dom = new JSDOM(html)
  })

  describe('getPostTitle', () => {
    it('should extract the post title from document', () => {
      const title = getPostTitle(dom.window.document)
      expect(title).to.include('Pārdod māju ar iekšējo apdari')
    })
  })

  describe('getPostPrice', () => {
    it('should extract the post price from document', () => {
      const price = getPostPrice(dom.window.document)
      expect(price).to.equal('149 400 €')
    })
  })

  describe('getPostGenericInfo', () => {
    it('should extract generic info fields from document', () => {
      const genericInfo = getPostGenericInfo(dom.window.document)
      expect(genericInfo).to.deep.eq({
        Ciems: 'Pēternieki',
        Iela: 'Orhidejas',
        Istabas: '\n\t\t\t\t\t\t5\n\t\t\t\t\t',
        'Pilsēta, rajons': 'Rīgas rajons',
        'Pilsēta/pagasts': 'Olaines pag.',
        Platība: '\n\t\t\t\t\t\t160 m²\n\t\t\t\t\t',
        'Stāvu skaits': '\n\t\t\t\t\t\t2\n\t\t\t\t\t',
        'Zemes platība': '\n\t\t\t\t\t\t2743 m²\n\t\t\t\t\t',
        Ērtības:
          '\n\t\t\t\t\t\tBlakus upei, Dārzs, Garāža, Gāzes  katls, Karstais ūdens, Kūts, Šķūnis\n\t\t\t\t\t',
      })
    })
  })

  describe('getPostAddressInfo', () => {
    it('should extract address info from document', () => {
      const addressInfo = getPostAddressInfo(dom.window.document)
      expect(addressInfo).to.deep.equal({
        city: 'Rīgas rajons',
        state: 'Rīgas rajons',
        street: 'Orhidejas',
        coordinates: {
          lat: 56.76125546541569,
          lng: 23.93245518799888,
        },
      })
    })
  })
})
