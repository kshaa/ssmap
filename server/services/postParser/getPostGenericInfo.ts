import { GenericInfo } from '@shared/types.js';
import { getPostInfoFields } from './getPostInfoFields';

export const getPostGenericInfo = (document: Document): GenericInfo => {
    const infoFieldEntries = Object.entries(getPostInfoFields(document));
    const genericInfo: GenericInfo = {};

    for (const [fieldName, fieldData] of infoFieldEntries) {
        genericInfo[fieldName.replace(':', '').trim()] = fieldData['value'];
    }

    return genericInfo;
}
