import { useEffect, useState } from 'react'

export default function OperationStatus({ active, label = '正在处理', detail = '模型仍在运算，请保持页面打开。' }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) {
      setSeconds(0)
      return undefined
    }
    const started = Date.now()
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [active, label])

  if (!active) return null
  const message = seconds >= 90
    ? '耗时较长，但请求仍未结束；建议继续等待。超过 5 分钟可重试或切换模型。'
    : detail

  return (
    <div className="op-status" role="status" aria-live="polite">
      <span className="op-status-ring" aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <span>{message} 已等待 {seconds} 秒。</span>
      </div>
      <em>运行中</em>
    </div>
  )
}
