// Parsing/formatting of money typed by the user in pt-BR forms.

// "12,34" | "1.234,56" | "1.234.567" | "1234"
const PT_BR_PATTERN = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/
// "12.34" | "12.3" (dot as decimal separator)
const DOT_DECIMAL_PATTERN = /^\d+\.\d{1,2}$/

/**
 * Parses a money amount typed in a pt-BR form.
 * Accepts "12,34", "1.234,56", "12.34", "1234" and an optional "R$" prefix.
 * A dot followed by exactly three digits is read as a thousands separator
 * ("1.234" = 1234). Returns NaN when the input is not a valid amount.
 */
export function parseAmount(input: string): number {
  const value = input.replace(/R\$/i, '').replace(/\s/g, '')

  if (DOT_DECIMAL_PATTERN.test(value)) return Number(value)
  if (PT_BR_PATTERN.test(value)) return Number(value.replace(/\./g, '').replace(',', '.'))

  return Number.NaN
}

/** Formats a number for a pt-BR amount input, e.g. 1234.5 -> "1234,50". */
export function formatAmountInput(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  })
}

/** Formats a number as Brazilian currency, e.g. 1234.5 -> "R$ 1.234,50". */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
