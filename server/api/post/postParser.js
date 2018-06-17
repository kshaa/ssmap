function getPostInfoFields(document) {
    const options = {
        optionsTableSelector: 'table.options_list',
        optionNameSelector: '.ads_opt_name',
        optionValueSelectorPrimary: '.ads_opt *:nth-of-type(1)',
        optionValueSelectorSecondary: '.ads_opt'
    }

    /**
     * Try to find all generic address info fields
     */
    const infoFieldNameNodes = document.querySelectorAll(`${options.optionsTableSelector} ${options.optionNameSelector}`)
    const fields = {}

    for (const infoFieldNameNode of infoFieldNameNodes) {
        infoFieldNode = infoFieldNameNode.parentNode
        infoFieldValueNode = infoFieldNameNode.parentNode.querySelector(`${options.optionValueSelectorPrimary}`)

        if (!infoFieldValueNode) {
            infoFieldValueNode = infoFieldNameNode.parentNode.querySelector(`${options.optionValueSelectorSecondary}`)
        }

        if (!infoFieldValueNode) {
            console.log('Found address field, but our field value dom selector didn\'t match')
            continue;
        }

        infoFieldName = infoFieldNameNode.textContent
        infoFieldValue = infoFieldValueNode.textContent

        fields[infoFieldName] = {
            'value': infoFieldValue,
            'fieldNode': infoFieldNode
        }
    }

    return fields
}

function getPostGenericInfo(document) {
    const infoFieldEntries = Object.entries(getPostInfoFields(document))
    const genericInfo = {}

    for (const [fieldName, fieldData] of infoFieldEntries) {
        genericInfo[fieldName.replace(':', '').trim()] = fieldData['value']
    }

    return genericInfo
}

function parseCoordinatesField(coordinatesField) {
    const coordinatesClickScript = coordinatesField.getAttribute('onclick')
    var coordinates = null

    if (coordinatesClickScript) {
        // E.g. click script - mnu('map',1,1,'/lv/gmap/fTgTeF4QAzt4FD4eFFM=.html?mode=1&c=56.9483837, 24.1065339, 14');return false;
        coordinatesExpression = 'c=(.+\..+\,.+\..+)\,'
        coordinateMatch = coordinatesClickScript.match(coordinatesExpression)

        if ('1' in coordinateMatch) { // First matching regex group
            coordinates = coordinateMatch[1]
        }
    }

    if (!coordinates) {
        console.log('Failed parsing coordinates field onclick attribute.')

        return coordinates;
    }

    const lat = parseFloat(coordinates.split(', ')[0])
    const lng = parseFloat(coordinates.split(', ')[1])

    return {
        lat,
        lng
    };
}

function getPostAddressInfo(document) {
    const options = {
        coordinatesSelector: '.ads_opt_link_map',
        addressCodes: {
            'city': [
                'pilsēta',
                'город'
            ],
            'state': [
                'vieta',
                'местонахождение',
                'rajons',
                'район'

            ],
            'street': [
                'adrese',
                'адрес',
                'iela',
                'улица'
            ]
        }
    }

    const infoFieldEntries = Object.entries(getPostInfoFields(document))
    const addressCodeEntries = Object.entries(options.addressCodes)
    const addressInfo = {}

    for (const [fieldName, fieldData] of infoFieldEntries) {
        for (const [addressCode, addressTranslations] of addressCodeEntries) {
            for (const addressTranslation of addressTranslations) {
                if (fieldName.toLowerCase().indexOf(addressTranslation) !== -1) {
                    // This field is a Code of address
                    addressInfo[addressCode] = fieldData['value']
                }

                const coordinatesField = fieldData['fieldNode'].querySelector(`${options.coordinatesSelector}`)
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

function getPostPrice(document) {
    const priceSelector = '.ads_price'
    const priceNode = document.querySelector(priceSelector)

    if (!priceNode) {
        console.log('Couldn\'t find post price element')

        return null;
    }

    return priceNode.textContent
}

function getPostTitle(document) {
    const titleSelector = '#msg_div_msg'
    const titleSize = 250
    const titleNode = document.querySelector(titleSelector)

    if (!titleNode) {
        console.log('Couldn\'t find post title element')

        return null;
    }

    return titleNode.textContent.trim() // Remove start, end spaces
        .replace(/(\r\n|\n|\r)/gm, ' ') // Remove line breaks
        .replace(/[ ]{2,}/gm, ' ') // Remove multi-whitespace between words
        .slice(0, titleSize) // Limit title size
}

module.exports = {
    getPostGenericInfo,
    getPostAddressInfo,
    getPostPrice,
    getPostTitle
}