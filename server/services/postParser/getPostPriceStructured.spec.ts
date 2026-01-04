import { expect } from 'chai'
import { getPostPriceStructured } from './getPostPriceStructured'

describe('getPostPriceStructured', () => {
    it('should return the structured price', () => {
        expect(getPostPriceStructured('96 000 €')).to.deep.equal({ amount: 96000, currency: '€' })
        expect(getPostPriceStructured('990 000 €')).to.deep.equal({ amount: 990000, currency: '€' })
        expect(getPostPriceStructured('99 500 €')).to.deep.equal({ amount: 99500, currency: '€' })
        expect(getPostPriceStructured('99 700 €')).to.deep.equal({ amount: 99700, currency: '€' })
        expect(getPostPriceStructured('950 €/mēn.')).to.deep.equal({ amount: 950, currency: '€', period: 'mēn.' })
        expect(getPostPriceStructured('70 €/dienā')).to.deep.equal({ amount: 70, currency: '€', period: 'dienā' })
        expect(getPostPriceStructured('400 €/ned.')).to.deep.equal({ amount: 400, currency: '€', period: 'ned.' })
    })
    it('should return null if the price is not a valid number', () => {
        expect(getPostPriceStructured('potato 123')).to.deep.equal(null)
    })
})