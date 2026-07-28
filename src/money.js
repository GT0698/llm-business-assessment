export function formatCompactNumber(n) {
  if (!isFinite(n)) return '∞'
  const a = Math.abs(n)
  if (a >= 1e8) return `${(n / 1e8).toFixed(2)}亿`
  if (a >= 1e4) return `${(n / 1e4).toFixed(1)}万`
  return Math.round(n).toLocaleString()
}

export function currencyMark(currency = '元') {
  const unit = String(currency || '元').trim()
  const normalized = unit.toUpperCase()
  if (['元', '人民币', 'CNY', 'RMB', '¥', '￥'].includes(normalized) || ['元', '人民币', '¥', '￥'].includes(unit)) return '¥'
  if (['美元', 'USD', 'US$', '$'].includes(normalized) || ['美元', '$'].includes(unit)) return '$'
  if (['欧元', 'EUR', '€'].includes(normalized) || ['欧元', '€'].includes(unit)) return '€'
  if (['英镑', 'GBP', '£'].includes(normalized) || ['英镑', '£'].includes(unit)) return '£'
  return unit
}

export function formatMoney(n, currency = '元') {
  const mark = currencyMark(currency)
  const value = formatCompactNumber(n)
  return ['¥', '$', '€', '£'].includes(mark) ? `${mark}${value}` : `${value}${mark}`
}
