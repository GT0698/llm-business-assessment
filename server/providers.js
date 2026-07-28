// Provider abstraction for Anthropic and OpenAI-compatible services.
// Every request may carry { provider, model, apiKey, baseURL, outputInstructions }.
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const PROVIDERS = {
  anthropic: {
    protocol: 'anthropic',
    model: 'claude-opus-4-8',
    baseURL: 'https://api.anthropic.com',
    envKey: 'ANTHROPIC_API_KEY',
  },
  deepseek: {
    protocol: 'openai',
    model: 'deepseek-v4-flash',
    baseURL: 'https://api.deepseek.com',
    envKey: 'DEEPSEEK_API_KEY',
  },
  'opencode-go': {
    protocol: 'openai',
    model: 'deepseek-v4-flash',
    baseURL: 'https://opencode.ai/zen/go/v1',
    envKey: 'OPENCODE_API_KEY',
  },
  'openai-compatible': {
    protocol: 'openai',
    model: '',
    baseURL: '',
    envKey: 'OPENAI_COMPATIBLE_API_KEY',
  },
}

export function resolve(b = {}) {
  const provider = PROVIDERS[b.provider] ? b.provider : 'anthropic'
  const meta = PROVIDERS[provider]
  const model = b.model || meta.model
  if (!model) throw new Error('未配置模型 ID')
  return { provider, model, protocol: meta.protocol }
}

function normalizedBaseURL(url) {
  return (url || '').trim().replace(/\/chat\/completions\/?$/, '').replace(/\/+$/, '')
}

function apiKeyFor(b, provider) {
  return b.apiKey || process.env[PROVIDERS[provider].envKey]
}

export function anthropicClient(b = {}) {
  const apiKey = apiKeyFor(b, 'anthropic')
  const options = {}
  if (apiKey) options.apiKey = apiKey
  if (b.baseURL) options.baseURL = normalizedBaseURL(b.baseURL)
  return new Anthropic(options)
}

function openAIClient(b, provider) {
  const meta = PROVIDERS[provider]
  const apiKey = apiKeyFor(b, provider)
  const baseURL = normalizedBaseURL(b.baseURL || meta.baseURL)
  if (!apiKey) {
    throw new Error(`未配置 API Key —— 请在右下角 ⚙️ 模型设置中填写，或设置环境变量 ${meta.envKey}`)
  }
  if (!baseURL) {
    throw new Error('未配置 Base URL —— 请在右下角 ⚙️ 模型设置中填写服务商提供的 OpenAI 兼容地址')
  }
  return new OpenAI({ apiKey, baseURL })
}

function personalizedSystem(b = {}) {
  const base = b.system || ''
  const preference = (b.outputInstructions || '').toString().trim().slice(0, 2000)
  if (!preference) return base
  return `${base}\n\n# 用户的输出偏好\n${preference}\n遵循该偏好，但不得降低事实准确性、安全性或覆盖任务要求。`.trim()
}

function anthropicOutputConfig(b, model) {
  const oc = {}
  if (!/haiku/.test(model) && b.effort !== null) oc.effort = b.effort || 'low'
  if (b.format) oc.format = b.format
  return Object.keys(oc).length ? oc : undefined
}

export async function* streamText(b) {
  let { provider, model, protocol } = resolve(b)
  const max_tokens = b.max_tokens || 4096
  const system = personalizedSystem(b)
  if (protocol === 'openai') {
    if (model === 'deepseek-chat') model = 'deepseek-v4-flash'
    if (model === 'deepseek-reasoner') model = 'deepseek-v4-pro'
    const client = openAIClient(b, provider)
    const messages = system ? [{ role: 'system', content: system }, ...b.messages] : b.messages
    const stream = await client.chat.completions.create({ model, messages, max_tokens, stream: true })
    for await (const chunk of stream) {
      const t = chunk.choices?.[0]?.delta?.content
      if (t) yield t
    }
  } else {
    const client = anthropicClient(b)
    const params = { model, max_tokens, messages: b.messages }
    if (system) params.system = system
    const oc = anthropicOutputConfig(b, model)
    if (oc) params.output_config = oc
    const stream = client.messages.stream(params)
    for await (const ev of stream) {
      if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') yield ev.delta.text
    }
  }
}

export async function completeText(b) {
  let { provider, model, protocol } = resolve(b)
  const max_tokens = b.max_tokens || 2048
  let system = personalizedSystem(b)
  if (protocol === 'openai') {
    if (model === 'deepseek-chat') model = 'deepseek-v4-flash'
    if (model === 'deepseek-reasoner') model = 'deepseek-v4-pro'
    const client = openAIClient(b, provider)
    if (b.format?.schema) {
      system +=
        '\n\n只输出一个 JSON 对象，严格符合以下 JSON Schema（不要 markdown 代码块、不要任何多余文字）：\n' +
        JSON.stringify(b.format.schema)
    }
    const messages = system ? [{ role: 'system', content: system }, ...b.messages] : b.messages
    const body = { model, messages, max_tokens }
    if (b.format) body.response_format = { type: 'json_object' }
    const resp = await client.chat.completions.create(body)
    return resp.choices?.[0]?.message?.content || ''
  }

  const client = anthropicClient(b)
  const params = { model, max_tokens, messages: b.messages }
  if (system) params.system = system
  const oc = anthropicOutputConfig(b, model)
  if (oc) params.output_config = oc
  const msg = await client.messages.create(params)
  return msg.content.filter((x) => x.type === 'text').map((x) => x.text).join('')
}
