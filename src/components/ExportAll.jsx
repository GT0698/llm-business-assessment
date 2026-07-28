import { useEffect, useRef, useState } from 'react'
import { downloadMd, downloadDoc, printReport } from '../reportExport.js'
import { buildMasterReport, reportSections } from '../masterReport.js'

export default function ExportAll({ product }) {
  const name = `${product.name || '产品'}-总报告`
  const sections = reportSections(product)
  const available = sections.filter((s) => s.available).map((s) => s.key)
  const availabilityKey = available.join('|')
  const productKey = product.id || product.name || 'product'
  const knownAvailable = useRef(available)
  const [selected, setSelected] = useState(available)

  useEffect(() => {
    setSelected(available)
    knownAvailable.current = available
  }, [productKey])

  useEffect(() => {
    setSelected((current) => {
      const currentSet = new Set(current)
      const previousSet = new Set(knownAvailable.current)
      return available.filter((key) => currentSet.has(key) || !previousSet.has(key))
    })
    knownAvailable.current = available
  }, [availabilityKey])

  const selectedSet = new Set(selected)
  const availableCount = available.length
  const selectedCount = selected.filter((key) => available.includes(key)).length
  const allSelected = availableCount > 0 && selectedCount === availableCount
  const md = () => buildMasterReport(product, selected)
  const toggle = (key) => setSelected((current) => current.includes(key) ? current.filter((x) => x !== key) : [...current, key])
  const toggleAll = () => setSelected(allSelected ? [] : available)

  return (
    <div className="export-all">
      <div className="export-all-row">
        <span className="export-all-label">📦 导出整份报告</span>
        <button disabled={!selectedCount} onClick={() => downloadMd(name, md())}>⬇ .md</button>
        <button disabled={!selectedCount} onClick={() => downloadDoc(name, md())}>⬇ Word</button>
        <button disabled={!selectedCount} onClick={() => printReport(name, md())}>🖨️ PDF</button>
      </div>
      <div className="export-all-hint">选择需要写入总报告的模块；标题页和目录会随选择自动更新。</div>
      <div className="export-all-secs">
        <label className="export-section export-section-all">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          <span>全选</span>
        </label>
        {sections.map((section) => (
          <label key={section.key} className={`export-section ${section.available ? '' : 'disabled'}`}>
            <input
              type="checkbox"
              checked={section.available && selectedSet.has(section.key)}
              disabled={!section.available}
              onChange={() => toggle(section.key)}
            />
            <span>{section.label}</span>
          </label>
        ))}
        <em>已选 {selectedCount}/{availableCount} 个可用模块</em>
      </div>
    </div>
  )
}
