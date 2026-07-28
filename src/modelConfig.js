// 模型配置存在浏览器 localStorage，全站生效。
// provider 表示具体服务商，protocol 决定服务端使用 Anthropic 还是 OpenAI 兼容协议。
const KEY = 'llm_model_config_v1'

export const PROVIDERS = {
  anthropic: {
    label: 'Claude',
    protocol: 'anthropic',
    defaultBaseURL: 'https://api.anthropic.com',
    baseURLPlaceholder: '默认 https://api.anthropic.com；中转站可填它提供的 Anthropic 地址',
    keyHint: '留空则使用服务端 ANTHROPIC_API_KEY',
    models: [
      { id: 'claude-opus-4-8', name: 'Opus 4.8 · 最强' },
      { id: 'claude-sonnet-4-6', name: 'Sonnet 4.6 · 均衡' },
      { id: 'claude-haiku-4-5', name: 'Haiku 4.5 · 最快' },
    ],
  },
  deepseek: {
    label: 'DeepSeek 官方',
    protocol: 'openai',
    defaultBaseURL: 'https://api.deepseek.com',
    baseURLPlaceholder: '默认 https://api.deepseek.com',
    keyHint: '留空则使用服务端 DEEPSEEK_API_KEY',
    models: [
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash · 更快更省' },
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro · 更强分析' },
    ],
  },
  'opencode-go': {
    label: 'OpenCode Go',
    protocol: 'openai',
    defaultBaseURL: 'https://opencode.ai/zen/go/v1',
    baseURLPlaceholder: '默认 https://opencode.ai/zen/go/v1',
    keyHint: '留空则使用服务端 OPENCODE_API_KEY',
    models: [
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash · 更快更省' },
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro · 更强分析' },
    ],
  },
  'openai-compatible': {
    label: '其他兼容接口',
    protocol: 'openai',
    defaultBaseURL: '',
    baseURLPlaceholder: '必填，例如 https://example.com/v1',
    keyHint: '填写该服务商单独创建的 API Key',
    models: [],
  },
}

const DEFAULT = {
  provider: 'anthropic',
  model: 'claude-opus-4-8',
  customModel: '',
  apiKey: '',
  baseURL: '',
  outputInstructions: '先给结论，再说明依据、风险、待验证项和下一步。表达专业、具体、适合业务评审。',
}

export function getConfig() {
  try {
    const config = { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
    if (!PROVIDERS[config.provider]) config.provider = DEFAULT.provider
    if (config.provider === 'deepseek' && config.baseURL?.includes('opencode.ai')) {
      config.provider = 'opencode-go'
    }
    if (config.model === 'deepseek-chat') config.model = 'deepseek-v4-flash'
    if (config.model === 'deepseek-reasoner') config.model = 'deepseek-v4-pro'
    return config
  } catch {
    return { ...DEFAULT }
  }
}

export function setConfig(c) {
  localStorage.setItem(KEY, JSON.stringify({ ...DEFAULT, ...c }))
}

export function activeModel(config = getConfig()) {
  return config.provider === 'openai-compatible'
    ? config.customModel.trim()
    : config.model
}

// Merge the active config into an outgoing request body.
// Router demo 中显式选择 DeepSeek 时，也会沿用当前 OpenAI 兼容服务商的凭证。
export function withConfig(body = {}) {
  const c = getConfig()
  const requestedProvider = body.provider
  const configuredProtocol = PROVIDERS[c.provider]?.protocol
  let provider = requestedProvider || c.provider

  if (requestedProvider === 'deepseek' && configuredProtocol === 'openai') {
    provider = c.provider
  }

  const usesActiveProvider = !requestedProvider || provider === c.provider
  const model = body.model || activeModel(c)
  const out = {
    ...body,
    provider,
    model,
    outputInstructions: c.outputInstructions?.trim() || '',
  }

  if (usesActiveProvider) {
    if (c.apiKey) out.apiKey = c.apiKey
    if (c.baseURL) out.baseURL = c.baseURL
  }
  return out
}
