import { byId } from './paradigms.js'
import { formatMoney } from './money.js'

function roiCalc(s, h) {
  const users = +s.users || 0, payRate = +s.payRate || 0, arpu = +s.arpuMonthly || 0, gm = +s.grossMargin || 0, cac = +s.cac || 0, fc = +s.fixedCostMonthly || 0
  const paying = users * payRate / 100, mrr = paying * arpu, revenue = mrr * h
  const gp = revenue * gm / 100, acq = paying * cac, fixed = fc * h, invest = acq + fixed
  const net = gp - acq - fixed
  const roi = invest > 0 ? net / invest : net > 0 ? Infinity : 0
  const mn = mrr * gm / 100 - fc
  const payback = net <= 0 ? Infinity : mn > 0 ? invest / mn : Infinity
  return { revenue, net, roi, payback }
}
const esc = (s) => (s || '').replace(/\|/g, '/').replace(/\n+/g, ' ')

// Assemble a product's artifacts into one master-report Markdown string.
export function buildMasterReport(p, selectedKeys) {
  const a = p.artifacts || {}
  const sections = reportSections(p)
  const selected = new Set(selectedKeys || sections.filter((s) => s.available).map((s) => s.key))
  const included = sections.filter((s) => s.available && selected.has(s.key))
  const L = []
  L.push(`# ${p.name || '产品'} · 产品改造总报告`)
  if (p.positioning) L.push(`\n> ${p.positioning}`)
  L.push(`\n## 目录`)
  included.forEach((section, index) => L.push(`${index + 1}. ${section.title}`))
  L.push(`\n<div class="report-page-break"></div>`)

  let sectionNumber = 0
  const has = (key) => selected.has(key)
  const heading = (title) => {
    sectionNumber += 1
    L.push(`\n## ${sectionNumber}. ${title}`)
  }

  if (has('overview')) {
    heading('产品概览')
    L.push(`- **定位**：${p.positioning || '—'}`)
    L.push(`- **目标人群**：${p.audience || '—'}`)
    L.push(`- **界面 / 形态**：${p.ui || '—'}`)
    L.push(`- **主要功能**：${p.features || '—'}`)
    if (p.goal) L.push(`- **改造目标**：${p.goal}`)
  }

  if (has('fit') && a.fit?.scores?.length) {
    heading('范式契合度')
    if (a.fit.summary) L.push(`> ${a.fit.summary}\n`)
    L.push(`| 范式 | 契合分 | 理由 |`)
    L.push(`| --- | --- | --- |`)
    ;[...a.fit.scores].sort((x, y) => y.score - x.score).forEach((s) => { const pa = byId(s.id); L.push(`| ${pa ? pa.title : s.id} | ${s.score} | ${esc(s.reason)} |`) })
  }

  if (has('diagnosis') && a.diagnosis) {
    const d = a.diagnosis, pa = byId(d.recommended)
    heading('专家诊断')
    L.push(`**推荐范式：${d.paradigmName || (pa ? pa.title : d.recommended)}**`)
    if (d.why) L.push(`\n${d.why}`)
    if (d.diagnosis?.length) { L.push(`\n**诊断要点：**`); d.diagnosis.forEach((x) => L.push(`- **${x.title}**：${x.insight}`)) }
    if (d.cautions?.length) { L.push(`\n**注意要点：**`); d.cautions.forEach((c) => L.push(`- ${c}`)) }
  }

  if (has('bmc') && a.bmc) {
    heading('商业模式画布')
    const cells = [['valuePropositions', '价值主张'], ['customerSegments', '客户细分'], ['channels', '渠道通路'], ['customerRelationships', '客户关系'], ['revenueStreams', '收入来源'], ['keyResources', '核心资源'], ['keyActivities', '关键业务'], ['keyPartners', '重要伙伴'], ['costStructure', '成本结构']]
    cells.forEach(([k, label]) => { if (a.bmc[k]?.length) { L.push(`\n**${label}**`); a.bmc[k].forEach((x) => L.push(`- ${x}`)) } })
  }

  if (has('monetization') && a.monetization) {
    const m = a.monetization
    heading('商业化策略')
    L.push(`**商业化模式：${m.model}** —— ${m.modelReason}`)
    if (m.pricing?.length) {
      L.push(`\n**定价档位：**`)
      L.push(`| 档位 | 价格 | 面向 | 包含 |`)
      L.push(`| --- | --- | --- | --- |`)
      m.pricing.forEach((t) => L.push(`| ${t.tier} | ${t.price} | ${esc(t.forWho)} | ${esc((t.includes || []).join('、'))} |`))
    }
    if (m.pricingLogic?.length) { L.push(`\n**定价逻辑：**`); m.pricingLogic.forEach((x) => L.push(`- ${x}`)) }
    if (m.conversionLogic?.length) { L.push(`\n**转化逻辑（免费→付费）：**`); m.conversionLogic.forEach((x) => L.push(`- ${x}`)) }
    if (m.metrics?.length) L.push(`\n**关键指标：** ${m.metrics.join('、')}`)
    if (m.risks?.length) { L.push(`\n**商业化风险：**`); m.risks.forEach((x) => L.push(`- ${x}`)) }
  }

  if (has('roi') && a.roi?.scenarios?.length) {
    const r = a.roi, cur = r.currency || '元', h = r.horizonMonths || 12
    heading(`ROI / 收入预估（评估期 ${h} 个月）`)
    L.push(`| 情景 | 期内收入 | 净利润 | ROI | 回本周期 |`)
    L.push(`| --- | --- | --- | --- | --- |`)
    r.scenarios.forEach((s) => { const k = roiCalc(s, h); L.push(`| ${s.name} | ${formatMoney(k.revenue, cur)} | ${formatMoney(k.net, cur)} | ${isFinite(k.roi) ? Math.round(k.roi * 100) + '%' : '∞'} | ${isFinite(k.payback) ? Math.ceil(k.payback) + '月' : '—'} |`) })
    if (r.assumptionNotes?.length) { L.push(`\n**假设依据：**`); r.assumptionNotes.forEach((x) => L.push(`- ${x}`)) }
  }

  if (has('prd') && a.prd) { heading('产品需求文档（PRD）'); L.push('\n' + a.prd) }
  if (has('proposal') && a.proposal) { heading('汇报 / 提案方案'); L.push('\n' + a.proposal) }

  return L.join('\n')
}

// Which sections are present — for showing what's included.
export function reportSections(p) {
  const a = p.artifacts || {}
  return [
    { key: 'overview', label: '概览', title: '产品概览', available: true },
    { key: 'fit', label: '契合度', title: '范式契合度', available: !!a.fit?.scores?.length },
    { key: 'diagnosis', label: '诊断', title: '专家诊断', available: !!a.diagnosis },
    { key: 'bmc', label: '画布', title: '商业模式画布', available: !!a.bmc },
    { key: 'monetization', label: '商业化', title: '商业化策略', available: !!a.monetization },
    { key: 'roi', label: 'ROI', title: 'ROI / 收入预估', available: !!a.roi?.scenarios?.length },
    { key: 'prd', label: 'PRD', title: '产品需求文档（PRD）', available: !!a.prd },
    { key: 'proposal', label: '汇报', title: '汇报 / 提案方案', available: !!a.proposal },
  ]
}
