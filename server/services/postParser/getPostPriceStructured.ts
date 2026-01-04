import { StructuredPrice } from "@shared/post"

export const getPostPriceStructured = (value: string): StructuredPrice | null => {
    if (!value) return null

    // If there are parentheses, we need to remove everything after them including the parentheses
    const parenthesisIndex = value.indexOf('(')
    const valueWithoutParentheses = parenthesisIndex !== -1 ? value.substring(0, parenthesisIndex) : value
    const parts: string[] = valueWithoutParentheses.split(' ') ?? []

    // Split parts into two arrays
    // First part is all strings that are only numbers
    // The other part is the rest (usually currency and possibly period)
    const nonIntegerIndex = parts.findIndex(part => {
        const casted = Number(part)
        return isNaN(casted)
    })
    const integerParts = parts.slice(0, nonIntegerIndex)
    const nonIntegerParts = parts.slice(nonIntegerIndex)

    // First we parse the first part as an integer, that's the amount
    const amountString = integerParts.join('')
    if (!amountString) return null
    const amount = Number(amountString)
    if (isNaN(amount)) return null

    // Now we parse the second part, we merge everything again and split on the slash (if it's there)
    const currencyAndOptionalPeriod = nonIntegerParts.join('').split('/')
    const currencyString = currencyAndOptionalPeriod[0]
    const currency = currencyString || undefined
    const period = currencyAndOptionalPeriod[1] || undefined

    if (period) return { amount, currency, period }
    return { amount, currency }
}
