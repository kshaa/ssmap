import { expect } from 'chai'
import { getPostAreaStructured } from './getPostAreaStructured'

describe('getPostAreaStructured', () => {
    it('should return the structured area', () => {
        expect(getPostAreaStructured({ 'Platība': '160 m²' })).to.deep.equal({ amount: 160, unit: 'm²' })
        expect(getPostAreaStructured({ 'Platība': '     2743   m²  ' })).to.deep.equal({ amount: 2743, unit: 'm²' })
        expect(getPostAreaStructured({ 'Platība': '427.6 kv.' })).to.deep.equal({ amount: 427.6, unit: 'kv.' })
        expect(getPostAreaStructured({ 'Platība': '427,6 kv.' })).to.deep.equal({ amount: 427.6, unit: 'kv.' })
    })
    it('should return null if the area is not a valid number', () => {
        expect(getPostAreaStructured({ 'Platība': 'potato 123' })).to.deep.equal(null)
    })
})