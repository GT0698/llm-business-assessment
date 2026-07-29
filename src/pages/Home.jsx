import { Link } from 'react-router-dom'
import { PARADIGMS } from '../paradigms.js'

function Card({ p }) {
  return (
    <div className="card" style={{ '--accent': p.accent }}>
      <div className="card-top">
        <span className="card-emoji">{p.icon}</span>
        <span className="card-n">{p.n}</span>
      </div>
      <h3>{p.title}</h3>
      <div className="card-en">{p.en} · {p.tag}</div>
      <p className="card-blurb">{p.blurb}</p>
      <div className="card-actions">
        <Link to={`/guide/${p.id}`} className="card-guide">查看方法论 →</Link>
      </div>
    </div>
  )
}

export default function Home() {
  const toc = PARADIGMS.filter((p) => p.category === 'toC')
  const tob = PARADIGMS.filter((p) => p.category === 'toB')
  return (
    <div className="home">
      <div className="home-wrap">
        <header className="hero">
          <div className="hero-kicker">大模型商业范式评估</div>
          <h1>
            用范式与商业价值，
            <br />
            判断 AI 产品是否值得做
          </h1>
          <p className="hero-sub">
            从<strong>范式匹配、竞品分析、商业化与 ROI</strong>，到 Demo、PRD、汇报与 PPT，
            把产品判断链路跑完整。
          </p>
        </header>

        <Link to="/flow" className="flow-banner">
          <div className="fb-left">
            <span className="fb-emoji">🚀</span>
            <div>
              <strong>商业评估主线 · 一条龙</strong>
              <p>背景目标 → 范式与竞品 → 商业化/ROI → Demo → PRD → 汇报 → PPT，7 步走完，数字贯通、产出自动保存。</p>
            </div>
          </div>
          <span className="fb-steps">📝→🧩→💰→🛠️→📄→📑→📊</span>
        </Link>

        <div className="banner-row">
          <Link to="/advisor" className="advisor-banner">
            <div className="ab-left">
              <span className="ab-emoji">🧭</span>
              <div>
                <strong>AI 产品顾问</strong>
                <p>填入你的产品 → 专家诊断 → 推荐范式 + 落地方案 + demo 设想。还能建产品库。</p>
              </div>
            </div>
            <span className="ab-go">咨询 →</span>
          </Link>
          <Link to="/compete" className="advisor-banner compete-banner">
            <div className="ab-left">
              <span className="ab-emoji">🔬</span>
              <div>
                <strong>竞品分析</strong>
                <p>给一个产品（可附链接）→ 联网检索 → 用了哪种范式、优缺点、对你的启发。</p>
              </div>
            </div>
            <span className="ab-go">分析 →</span>
          </Link>
        </div>

        <div className="cat-head">
          <h2>面向消费者 · toC</h2>
          <span>一套通用范式地图，为评估与产品决策提供基础</span>
        </div>
        <div className="grid">
          {toc.map((p) => <Card p={p} key={p.id} />)}
        </div>

        <div className="cat-head tob">
          <h2>面向企业 · toB</h2>
          <span>把大模型能力嵌入企业工作流，辅助判断产品的落地方式与商业价值</span>
        </div>
        <div className="grid">
          {tob.map((p) => <Card p={p} key={p.id} />)}
        </div>

        <footer className="home-foot">
          <div className="axis">
            <span>模型可见度：</span>
            <em>LLM 即界面</em>
            <span className="line" />
            <em>LLM 是隐形管道</em>
          </div>
          <div className="axis">
            <span>人的参与度：</span>
            <em>人主导每一步</em>
            <span className="line" />
            <em>机器主导 · 人只验收</em>
          </div>
          <p className="note">
            模型由右下角「模型设置」统一管理，支持 Claude、DeepSeek、OpenCode Go 及兼容 API。
            密钥可仅保存在当前浏览器，或由本地服务端环境变量提供；请求仅经本机服务转发。
          </p>
        </footer>
      </div>
    </div>
  )
}
