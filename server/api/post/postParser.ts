interface InfoField {
    value: string;
    fieldNode: HTMLElement;
}

interface InfoFields {
    [key: string]: InfoField;
}

interface Coordinates {
    lat: number;
    lng: number;
}

interface AddressInfo {
    city?: string;
    state?: string;
    street?: string;
    coordinates?: Coordinates;
}

interface GenericInfo {
    [key: string]: string;
}

function getPostInfoFields(document: Document): InfoFields {
    const options = {
        optionsTableSelector: 'table.options_list',
        optionNameSelector: '.ads_opt_name',
        optionValueSelectorPrimary: '.ads_opt *:nth-of-type(1)',
        optionValueSelectorSecondary: '.ads_opt'
    };

    /**
     * Try to find all generic address info fields
     */
    const infoFieldNameNodes = document.querySelectorAll(`${options.optionsTableSelector} ${options.optionNameSelector}`);
    const fields: InfoFields = {};

    for (const infoFieldNameNode of infoFieldNameNodes) {
        const infoFieldNode = infoFieldNameNode.parentNode as HTMLElement;
        let infoFieldValueNode = infoFieldNameNode.parentNode?.querySelector(`${options.optionValueSelectorPrimary}`) as HTMLElement | null;

        if (!infoFieldValueNode) {
            infoFieldValueNode = infoFieldNameNode.parentNode?.querySelector(`${options.optionValueSelectorSecondary}`) as HTMLElement | null;
        }

        if (!infoFieldValueNode) {
            console.log('Found address field, but our field value dom selector didn\'t match');
            continue;
        }

        const infoFieldName = infoFieldNameNode.textContent || '';
        const infoFieldValue = infoFieldValueNode.textContent || '';

        fields[infoFieldName] = {
            'value': infoFieldValue,
            'fieldNode': infoFieldNode
        };
    }

    return fields;
}

function getPostGenericInfo(document: Document): GenericInfo {
    const infoFieldEntries = Object.entries(getPostInfoFields(document));
    const genericInfo: GenericInfo = {};

    for (const [fieldName, fieldData] of infoFieldEntries) {
        genericInfo[fieldName.replace(':', '').trim()] = fieldData['value'];
    }

    return genericInfo;
}

function parseCoordinatesField(coordinatesField: HTMLElement): Coordinates | null {
    const coordinatesClickScript = coordinatesField.getAttribute('onclick');
    let coordinates: string | null = null;

    if (coordinatesClickScript) {
        // E.g. click script - mnu('map',1,1,'/lv/gmap/fTgTeF4QAzt4FD4eFFM=.html?mode=1&c=56.9483837, 24.1065339, 14');return false;
        const coordinatesExpression = 'c=(.+\..+\,.+\..+)\,';
        const coordinateMatch = coordinatesClickScript.match(coordinatesExpression);

        if (coordinateMatch && coordinateMatch[1]) { // First matching regex group
            coordinates = coordinateMatch[1];
        }
    }

    if (!coordinates) {
        console.log('Failed parsing coordinates field onclick attribute.');
        return null;
    }

    const lat = parseFloat(coordinates.split(', ')[0]);
    const lng = parseFloat(coordinates.split(', ')[1]);

    return {
        lat,
        lng
    };
}

function getPostAddressInfo(document: Document): AddressInfo {
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
    };

    const infoFieldEntries = Object.entries(getPostInfoFields(document));
    const addressCodeEntries = Object.entries(options.addressCodes);
    const addressInfo: AddressInfo = {};

    for (const [fieldName, fieldData] of infoFieldEntries) {
        for (const [addressCode, addressTranslations] of addressCodeEntries) {
            for (const addressTranslation of addressTranslations) {
                if (fieldName.toLowerCase().indexOf(addressTranslation) !== -1) {
                    // This field is a Code of address
                    addressInfo[addressCode as keyof AddressInfo] = fieldData['value'] as any;
                }

                const coordinatesField = fieldData['fieldNode'].querySelector(`${options.coordinatesSelector}`) as HTMLElement | null;
                if (coordinatesField) {
                    const coordinates = parseCoordinatesField(coordinatesField);
                    
                    if (coordinates) {
                        addressInfo['coordinates'] = coordinates;
                    }
                }
            }
        }
    }

    return addressInfo;
}

function getPostPrice(document: Document): string | null {
    const priceSelector = '.ads_price';
    const priceNode = document.querySelector(priceSelector);

    if (!priceNode) {
        console.log('Couldn\'t find post price element');
        return null;
    }

    return priceNode.textContent;
}

function getPostTitle(document: Document): string | null {
    const titleSelector = '#msg_div_msg';
    const titleSize = 250;
    const titleNode = document.querySelector(titleSelector);

    if (!titleNode) {
        console.log('Couldn\'t find post title element');
        return null;
    }

    return titleNode.textContent
        ?.trim() // Remove start, end spaces
        .replace(/(\r\n|\n|\r)/gm, ' ') // Remove line breaks
        .replace(/[ ]{2,}/gm, ' ') // Remove multi-whitespace between words
        .slice(0, titleSize) || null; // Limit title size
}

export {
    getPostGenericInfo,
    getPostAddressInfo,
    getPostPrice,
    getPostTitle,
    GenericInfo,
    AddressInfo,
    Coordinates
};

