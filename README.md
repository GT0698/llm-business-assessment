# 商业范式与商业价值评估工作台

一个部署在本机的通用 AI 产品分析工作台。它用于判断产品适合采用哪种 LLM 产品范式、商业上是否值得做，并进一步生成商业分析、提案、PRD、演示文稿和可交互 Demo。

核心评估方法保持行业通用；金融机构、互联网企业或其他行业的差异，通过产品输入和「报告与 PRD 输出偏好」控制，不会被写死在评估逻辑里。

## 主要能力

- 7 种 toC 产品范式的教学与可交互 Demo
- AI 产品顾问：诊断产品、推荐主要与备选范式
- 商业化方案、ROI 与收入情景评估
- 竞品分析与多产品对比
- 商业提案、完整 PRD、PPT 内容和可交互原型生成
- 本地产品库与结果缓存
- 全站统一的模型服务商、模型和输出偏好

## 稳定的本地启动

首次使用：

```bash
npm install
npm run local
```

以后只需要在项目目录运行：

```bash
npm run local
```

程序会自动寻找可用的前后端端口并打开正确页面，避免电脑里残留的旧进程造成端口冲突或连接到旧版本。关闭启动它的终端窗口，或按 `Ctrl+C`，即可停止本次服务。

`npm run dev` 仍保留给开发调试使用，固定使用前端 5173、后端 8787。

## 模型设置

打开页面右下角的 **⚙️ 模型设置**。当前支持：

| 服务商 | 协议 | 默认 Base URL | 模型 |
|---|---|---|---|
| Claude | Anthropic | `https://api.anthropic.com` | Opus / Sonnet / Haiku |
| DeepSeek 官方 | OpenAI 兼容 | `https://api.deepseek.com` | V4 Flash / V4 Pro |
| OpenCode Go | OpenAI 兼容 | `https://opencode.ai/zen/go/v1` | V4 Flash / V4 Pro |
| 其他兼容接口 | OpenAI 兼容 | 自行填写 | 自行填写模型 ID |

配置流程：

1. 选择服务商。
2. 选择预置模型，或在「其他兼容接口」中填写服务商文档给出的模型 ID。
3. 填写该服务商单独创建的 API Key。
4. 非预置服务商必须填写 Base URL；如果复制的是完整 `/chat/completions` 地址，服务端会自动规整。
5. 点击「测试连接」，成功后保存。

API Key 和模型设置保存在当前浏览器的本地存储中，只会发往本机运行的 Express 代理。它们不会写入 Git 仓库。若使用第三方中转站，数据安全、模型真实性、限流和稳定性由中转站决定。

### 使用环境变量

不想在网页中填写 Key 时，也可以在启动前设置：

```bash
export ANTHROPIC_API_KEY=...
export DEEPSEEK_API_KEY=...
export OPENCODE_API_KEY=...
export OPENAI_COMPATIBLE_API_KEY=...
npm run local
```

只需配置实际使用的一个。自定义 OpenAI 兼容服务商仍需在网页中填写 Base URL 和模型 ID。

## 个性化输出

模型设置中有「报告与 PRD 输出偏好」。它会统一作用于商业分析、提案、PRD 和其他模型输出，但不会改变通用评估框架。

默认偏好是：

> 先给结论，再说明依据、风险、待验证项和下一步。表达专业、具体、适合业务评审。

你可以改成自己的汇报口径，例如要求：

- 面向管理层，首屏给出做/不做/有条件做；
- 明确区分事实、假设和推断；
- PRD 加入验收标准、埋点和降级方案；
- 报告适配金融机构的合规评审，或互联网企业的增长评审。

## 能力边界

- 项目内置的联网检索目前仅走 Anthropic 的 web search 工具。
- DeepSeek、OpenCode Go 和其他 OpenAI 兼容接口会自动降级为模型内置知识回答，因此最新信息需要人工核验。
- 中转站即使声称兼容 Claude，也不一定完整支持 Anthropic 的工具调用、结构化输出或流式协议；请以「测试连接」和实际功能测试为准。
- 模型给出的商业数据和 ROI 是决策假设，不是已验证事实，正式立项前仍需补充真实业务数据。

## 架构

```text
浏览器（React）
    │ /api
    ▼
本机 Express 代理
    ├─ Anthropic 协议 ── Claude / Claude 中转
    └─ OpenAI 兼容协议 ── DeepSeek / OpenCode Go / 其他服务商
```

主要文件：

- `src/modelConfig.js`：服务商、模型、本地配置和迁移逻辑
- `src/SettingsModal.jsx`：模型与个性化输出设置
- `server/providers.js`：Anthropic / OpenAI 兼容协议适配
- `server/index.js`：业务 API、商业分析与文档生成
- `scripts/start-local.mjs`：自动端口检测与本地一键启动
- `src/pages/*`：范式 Demo、顾问、商业分析和文档页面

## 开发与构建

```bash
npm run build
```

健康检查：

```text
GET /api/health
```

成功时返回当前服务名称与版本号。
