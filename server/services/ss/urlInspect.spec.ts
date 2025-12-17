import { describe, it } from 'mocha'
import { expect } from 'chai'
import { ThingKind } from '@shared/synchronizedThing'
import { urlInspect } from './urlInspect'

describe('urlInspect', () => {
  it('should return the correct kind for a post url', () => {
    const result = urlInspect('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html', true)
    expect(result).to.deep.equal({ kind: ThingKind.Post, url: 'https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/hilnj.html' })
  })
  it('should return the correct kind for a feed url', () => {
    const result = urlInspect('https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml', true)
    expect(result).to.deep.equal({ kind: ThingKind.FeedAndPosts, url: 'https://www.ss.lv/rss/real-estate/homes-summer-residences/riga/centre.xml' })
  })
  it('should return the correct kind for a listing page #1 url', () => {
    const result = urlInspect('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki', true)
    expect(result).to.deep.equal({ kind: ThingKind.ListingPageAndPosts, url: 'https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki' })
  })
  it('should return the correct kind for a listing page #1 url', () => {
    const result = urlInspect('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/page1.html', true)
    expect(result).to.deep.equal({ kind: ThingKind.ListingPageAndPosts, url: 'https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/' })
  })
  it('should return the correct kind for a listing page #2 url', () => {
    const result = urlInspect('https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/page2.html', true)
    expect(result).to.deep.equal({ kind: ThingKind.ListingPageAndPosts, url: 'https://www.ss.lv/msg/lv/real-estate/homes-summer-residences/riga-region/olaines-pag/peternieki/' })
  })

})