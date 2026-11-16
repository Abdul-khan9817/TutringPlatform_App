export function formatEuro(amount: number | { toNumber(): number } | string): string {
  let num: number
  if (typeof amount === 'object' && 'toNumber' in amount) {
    num = amount.toNumber()
  } else {
    num = parseFloat(String(amount))
  }
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(num)
}

export function decimalToNumber(d: { toNumber(): number }): number {
  return d.toNumber()
}
