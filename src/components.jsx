// Minimal, dependency-free markdown-ish renderer: headings, bullets, bold, code.
export function Rich({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  const blocks = []
  let list = null
  const flush = () => {
    if (list) {
      blocks.push(
        <ul key={blocks.length} className="md-ul">
          {list.map((it, i) => (
            <li key={i}>{inline(it)}</li>
          ))}
        </ul>
      )
      list = null
    }
  }
  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, '')
    const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/)
    if (m) {
      ;(list ||= []).push(m[1])
      return
    }
    flush()
    if (!line.trim()) return
    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) blocks.push(<h4 key={blocks.length} className="md-h">{inline(h[2])}</h4>)
    else blocks.push(<p key={blocks.length} className="md-p">{inline(line)}</p>)
  })
  flush()
  return <div className="rich">{blocks}</div>
}

function inline(s) {
  // **bold** and `code`
  const parts = []
  let i = 0
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g
  let m
  while ((m = re.exec(s))) {
    if (m.index > i) parts.push(s.slice(i, m.index))
    if (m[2]) parts.push(<strong key={parts.length}>{m[2]}</strong>)
    else parts.push(<code key={parts.length}>{m[3]}</code>)
    i = m.index + m[0].length
  }
  if (i < s.length) parts.push(s.slice(i))
  return parts
}

export function Spinner({ label = '生成中' }) {
  return (
    <span className="spinner">
      <span className="bd" />
      <span className="bd" />
      <span className="bd" />
      {label}
    </span>
  )
}
