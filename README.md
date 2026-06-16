# LLM × toC 产品范式 · 七种 demo

一个 React + Vite 站点：首页展示 LLM 导向 toC 产品的 **7 种范式**，每个范式点进去是一个**真实调用 Claude** 的可玩 demo。

## 范式

| # | 范式 | demo |
|---|------|------|
| 01 | 对话即产品 (Chat-native) | 纯聊天，流式 |
| 02 | 角色陪伴 (Companion) | 三个不同人格的角色，语气各异 |
| 03 | 创作工具 (Co-creation) | 选类型 → 生成 → 换一个 / 更长 / 更短 |
| 04 | 嵌入式 Copilot | 编辑器里选中文字 → AI 改写/续写 → 一键应用 |
| 05 | 任务代理 Agent | 给目标 → 自动拆解计划 → 逐步执行 |
| 06 | 答案引擎 (AI-native rebuild) | 联网检索 + 结构化答案 + 来源 |
| 07 | 聚合 / 路由层 | 同一 prompt 并排对比两个模型 |

## 范式方法论页

每个范式页右上角有 **📖 产品方法论** 入口（首页卡片也有），进入后是一页 curated 知识：
产品设计要点 · 适用领域 · PRD 预览 · PRD 撰写要点 · 数据监测点 · 数据要素 · 主要应用案例。

其中 **PRD 预览** 卡片可点击进入 `/prd/:id` —— 一个 **AI 生成完整 PRD** 的页面：

- 用资深 LLM 产品专家的 system prompt（去 AI 味、拒绝常识堆砌、突出 LLM 独特性：幻觉控制 / 流式 / Token 成本 / 降级兜底 / 安全审核 / Prompt 工程）
- 每个范式预置一份具体示例产品的「产品基本信息」（产品名 / 目标用户 / 核心大模型能力 / 核心痛点），**字段可编辑** —— 也能给你自己的产品生成；还能**从产品库一键导入**
- 点「✨ 生成完整 PRD」流式产出一份含 *文档信息表 · 产品概述与核心价值 · 用户角色表 · 核心功能深拆（交互逻辑 + LLM 特有逻辑）· 非功能需求（TTFT/上下文窗口/合规过滤/幻觉抑制）· 埋点与数据看板（Token 消耗/点赞点踩闭环）· 风险与熔断降级* 的完整 Markdown 文档
- 用 react-markdown + remark-gfm 渲染表格/块引用/分隔线；结果缓存在本地，可**复制 Markdown / 打印导出 PDF / 重新生成**
- 另保留一份**结构化基线**（静态，无需 API key 即可查看）作为离线兜底

PRD 生成的服务端逻辑在 `/api/prd`（system prompt 在服务端，保证一致），同样支持 Claude / DeepSeek。

## AI 产品顾问 Agent（首页 🧭）

1. 填入你的产品（定位 / 目标人群 / 界面形态 / 主要功能…），可**保存到产品库**（localStorage 持久化，可多个、可加载、可删除）。
2. 填写目标或当前问题（增长 / 粘性 / 卡点…）。
3. 点「咨询专家」→ Claude 做 **3-4 步专家诊断 → 推荐范式（含次选）→ 把范式落地到你这个产品的方案 → demo 设想 → 注意要点**，并给出跳到对应 demo / 方法论页的入口。
4. 后端用结构化输出（json_schema）保证推荐落在 7 个范式之一。

## 架构

```
浏览器 (React)  ──/api──▶  Express 代理 (server/index.js)  ──▶  Claude API
                          ↑ API key 只存在这里
```

API key 永远不进前端。前端通过 Vite dev proxy 把 `/api` 转发到 Express（端口 8787）。

## 模型设置（支持 Claude + DeepSeek）

右下角悬浮 **⚙️ 模型设置**（全站可见）可切换：

- **服务商**：Claude (Anthropic) / DeepSeek
- **模型**：Opus 4.8 / Sonnet 4.6 / Haiku 4.5；DeepSeek-V3 (chat) / DeepSeek-R1 (reasoner)
- **API Key / Base URL**：可填自己的 key（存浏览器本地，仅发往本项目服务端代理）；留空则用服务端环境变量
- **测试连接** 一键自检

DeepSeek 走 OpenAI 兼容协议（`https://api.deepseek.com`）。注意：**答案引擎**的联网检索仅 Claude 支持，DeepSeek 会自动降级为模型内置知识回答。
「聚合/路由层」demo 可**跨服务商**并排对比（如 Opus 4.8 vs DeepSeek-V3）。

## 运行

```bash
# 两个 key 至少配一个（也可在 ⚙️ 里填）：
export ANTHROPIC_API_KEY=sk-ant-...
export DEEPSEEK_API_KEY=sk-...
npm install
npm run dev
```

然后打开 http://localhost:5173

- `npm run dev` 会用 concurrently 同时起后端代理 (8787) 和 Vite 前端 (5173)。
- 默认模型 `claude-opus-4-8`；路由层 demo 可切换 Sonnet / Haiku。
- 答案引擎用 `web_search` 服务端工具；若 key 未开通该工具，会自动回退到模型内置知识并提示。

## 文件

- `server/index.js` — 代理：`/api/chat`（流式）、`/api/complete`（含结构化输出）、`/api/answer`（联网检索）
- `src/paradigms.js` — 7 个范式的元数据（首页卡片）
- `src/pages/*` — 每个范式一个页面
- `src/api.js` — 前端调用封装
