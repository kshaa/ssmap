import { JSDOM } from 'jsdom'
import { getPostGenericInfo } from '@src/services/postParser/getPostGenericInfo.js'
import { getPostAddressInfo } from '@src/services/postParser/getPostAddressInfo.js'
import { getPostPrice } from '@src/services/postParser/getPostPrice.js'
import { getPostTitle } from '@src/services/postParser/getPostTitle.js'
import { ParseError } from '@shared/errors/parseError'
import { ParsedPost } from '@shared/post'
import { getPostPriceStructured } from './getPostPriceStructured'
import { getPostAreaStructured } from './getPostAreaStructured'

export const parsePostDocument = (document: string): ParsedPost => {
  const ssdom = new JSDOM(document, {
    contentType: 'text/html',
  })

  try {
    const genericInfo = getPostGenericInfo(ssdom.window.document)
    const addressInfo = getPostAddressInfo(ssdom.window.document)
    const price = getPostPrice(ssdom.window.document)
    const priceStructured = price ? getPostPriceStructured(price) : undefined
    const areaStructured = getPostAreaStructured(genericInfo)
    const title = getPostTitle(ssdom.window.document)

    return {
      addressInfo,
      genericInfo,
      areaStructured,
      price,
      priceStructured,
      title,
    }
  } catch (err: unknown) {
    throw new ParseError({ entity: 'post', isUserError: false }, err)
  }
}