import { AreaStructured, GenericInfo } from "@shared/post"

const isDigitOrDecimalPointOrComma = (char: string): boolean => {
    return (char >= '0' && char <= '9') || char === '.' || char === ','
}

export const getPostAreaStructured = (genericInfo: GenericInfo): AreaStructured | null => {
    if (!genericInfo) return null

    const text = genericInfo['Platība']?.trim()
    if (!text) return null

    const indexOfAmountEnd = text.trim().split('').findIndex((char) => !isDigitOrDecimalPointOrComma(char))
    const amountText = text.substring(0, indexOfAmountEnd).trim().replace(',', '.')
    const unit = text.substring(indexOfAmountEnd).trim()

    if (!amountText || !unit) return null

    const amount = Number(amountText)


    return { amount, unit }
}
