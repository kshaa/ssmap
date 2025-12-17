import { InfoFields } from './types'

export const getPostInfoFields = (document: Document): InfoFields => {
  const options = {
    optionsTableSelector: 'table.options_list',
    optionNameSelector: '.ads_opt_name',
    optionValueSelectorPrimary: '.ads_opt *:nth-of-type(1)',
    optionValueSelectorSecondary: '.ads_opt',
  }

  /**
   * Try to find all generic address info fields
   */
  const infoFieldNameNodes = document.querySelectorAll(
    `${options.optionsTableSelector} ${options.optionNameSelector}`
  )
  const fields: InfoFields = {}

  for (const infoFieldNameNode of infoFieldNameNodes) {
    const infoFieldNode = infoFieldNameNode.parentNode as HTMLElement
    let infoFieldValueNode = infoFieldNameNode.parentNode?.querySelector(
      `${options.optionValueSelectorPrimary}`
    ) as HTMLElement | null

    if (!infoFieldValueNode) {
      infoFieldValueNode = infoFieldNameNode.parentNode?.querySelector(
        `${options.optionValueSelectorSecondary}`
      ) as HTMLElement | null
    }

    if (!infoFieldValueNode) {
      continue
    }

    const infoFieldName = infoFieldNameNode.textContent || ''
    const infoFieldValue = infoFieldValueNode.textContent || ''

    fields[infoFieldName] = {
      value: infoFieldValue,
      fieldNode: infoFieldNode,
    }
  }

  return fields
}
