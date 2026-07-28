import { useState } from 'react'
import { genRoi } from '../api.js'
import RoiEstimator from './RoiEstimator.jsx'
import OperationStatus from './OperationStatus.jsx'

export default function RoiBlock({ product, paradigm, paradigmDesc, monetization, cached, onResult }) {
  const [data, setData] = useState(cached || null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const run = async () => {
    if (busy) return
    setBusy(true); setErr('')
    try {
      const r = await genRoi(product, paradigm, paradigmDesc, monetization)
      setData(r); onResult?.(r)
    } catch (e) { setErr(e.message || String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="roi-block">
      {err && <div className="error-box">⚠️ {err}</div>}
      <OperationStatus active={busy} label="正在测算 ROI 与预期收入" detail="正在生成三种情景和可计算假设。" />
      {data && <RoiEstimator data={data} />}
      <button className="ghost gmon-btn" onClick={run} disabled={busy}>{busy ? '测算中…' : data ? '🔄 重新测算' : '📊 测算 ROI / 预期收入'}</button>
    </div>
  )
}
