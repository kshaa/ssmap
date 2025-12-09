import { AddressInfo } from '@shared/types.js'
import { getPostInfoFields } from './getPostInfoFields'
import { parseCoordinatesField } from './parseCoordinatesField'

export const getPostAddressInfo = (document: Document): AddressInfo => {
  const options = {
    coordinatesSelector: '.ads_opt_link_map',
    addressCodes: {
      city: ['pilsēta', 'город'],
      state: ['vieta', 'местонахождение', 'rajons', 'район'],
      street: ['adrese', 'адрес', 'iela', 'улица'],
    },
  }

  const infoFieldEntries = Object.entries(getPostInfoFields(document))
  const addressCodeEntries = Object.entries(options.addressCodes)
  const addressInfo: AddressInfo = {}

  for (const [fieldName, fieldData] of infoFieldEntries) {
    for (const [addressCode, addressTranslations] of addressCodeEntries) {
      for (const addressTranslation of addressTranslations) {
        if (fieldName.toLowerCase().indexOf(addressTranslation) !== -1) {
          // This field is a Code of address
          addressInfo[addressCode as keyof AddressInfo] = fieldData['value'] as any
        }

        const coordinatesField = fieldData['fieldNode'].querySelector(
          `${options.coordinatesSelector}`
        ) as HTMLElement | null
        if (coordinatesField) {
          const coordinates = parseCoordinatesField(coordinatesField)

          if (coordinates) {
            addressInfo['coordinates'] = coordinates
          }
        }
      }
    }
  }

  return addressInfo
}
