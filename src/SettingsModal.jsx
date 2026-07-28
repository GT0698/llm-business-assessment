import { useState } from 'react'
import { PROVIDERS, activeModel, getConfig, setConfig } from './modelConfig.js'
import { complete } from './api.js'

export default function SettingsModal({ onClose }) {
  const [cfg, setCfg] = useState(getConfig())
  const [test, setTest] = useState(null)
  const [testing, setTesting] = useState(false)

  const prov = PROVIDERS[cfg.provider]
  const set = (patch) => setCfg((c) => ({ ...c, ...patch }))

  const onProvider = (provider) => {
    const next = PROVIDERS[provider]
    set({
      provider,
      model: next.models[0]?.id || '',
      customModel: '',
      baseURL: next.defaultBaseURL,
    })
    setTest(null)
  }

  const validate = () => {
    if (!activeModel(cfg)) return '请填写模型 ID'
    if (cfg.provider === 'openai-compatible' && !cfg.baseURL.trim()) return '自定义服务商必须填写 Base URL'
    return ''
  }

  const save = () => {
    const error = validate()
    if (error) return setTest({ ok: false, msg: error })
    setConfig(cfg)
    onClose()
  }

  const runTest = async () => {
    const error = validate()
    if (error) return setTest({ ok: false, msg: error })
    setConfig(cfg)
    setTesting(true)
    setTest(null)
    try {
      const t = await complete({
        messages: [{ role: 'user', content: '只回复两个字：在线' }],
        max_tokens: 16,
        effort: 'low',
      })
      setTest({ ok: true, msg: `连接成功 · 返回「${(t || '').trim().slice(0, 20)}」` })
    } catch (e) {
      setTest({ ok: false, msg: e.message || String(e) })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>⚙️ 模型设置</h2>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <p className="modal-sub">服务商、模型和输出偏好全站生效。API Key 仅保存在本机浏览器，并发往本项目的本地代理。</p>

        <label className="cfg-label">服务商</label>
        <div className="provider-seg">
          {Object.entries(PROVIDERS).map(([id, p]) => (
            <button key={id} className={cfg.provider === id ? 'on' : ''} onClick={() => onProvider(id)}>
              {p.label}
            </button>
          ))}
        </div>

        <label className="cfg-label">模型</label>
        {prov.models.length ? (
          <select className="cfg-input" value={cfg.model} onChange={(e) => set({ model: e.target.value })}>
            {prov.models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        ) : (
          <input
            className="cfg-input"
            value={cfg.customModel}
            placeholder="填写服务商文档中的模型 ID"
            onChange={(e) => set({ customModel: e.target.value })}
          />
        )}

        <label className="cfg-label">API Key（可选）</label>
        <input
          className="cfg-input"
          type="password"
          value={cfg.apiKey}
          placeholder={prov.keyHint}
          onChange={(e) => set({ apiKey: e.target.value })}
        />

        <label className="cfg-label">Base URL{cfg.provider === 'openai-compatible' ? '（必填）' : '（可选）'}</label>
        <input
          className="cfg-input"
          value={cfg.baseURL}
          placeholder={prov.baseURLPlaceholder}
          onChange={(e) => set({ baseURL: e.target.value })}
        />

        <label className="cfg-label">报告与 PRD 输出偏好（可选）</label>
        <textarea
          className="cfg-input cfg-textarea"
          value={cfg.outputInstructions}
          maxLength={2000}
          placeholder="例如：先给结论，再列依据、风险、待验证项和下一步。"
          onChange={(e) => set({ outputInstructions: e.target.value })}
        />

        <div className="cfg-note">
          {cfg.provider === 'anthropic'
            ? 'Claude 可使用项目内置的联网检索；使用中转站时，实际能力取决于中转站是否完整兼容 Anthropic 协议。'
            : '当前服务商走 OpenAI 兼容协议。答案引擎会降级为模型内置知识回答，不保证包含最新信息。'}
        </div>

        {test && <div className={`test-result ${test.ok ? 'ok' : 'bad'}`}>{test.ok ? '✓ ' : '✕ '}{test.msg}</div>}

        <div className="modal-actions">
          <button className="ghost" onClick={runTest} disabled={testing}>
            {testing ? '测试中…' : '测试连接'}
          </button>
          <button className="primary" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  )
}
