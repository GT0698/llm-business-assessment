import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Knowledge from './pages/Knowledge.jsx'
import Prd from './pages/Prd.jsx'
import Proposal from './pages/Proposal.jsx'
import Advisor from './pages/Advisor.jsx'
import Compete from './pages/Compete.jsx'
import Workspace from './pages/Workspace.jsx'
import ProductWorkspace from './pages/ProductWorkspace.jsx'
import Flow from './pages/Flow.jsx'
import TopNav from './TopNav.jsx'
import SettingsModal from './SettingsModal.jsx'
import { getConfig } from './modelConfig.js'

export default function App() {
  const [open, setOpen] = useState(false)
  const cfg = getConfig()
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guide/:id" element={<Knowledge />} />
        <Route path="/prd/:id" element={<Prd />} />
        <Route path="/proposal/:id" element={<Proposal />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/compete" element={<Compete />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/:pid" element={<ProductWorkspace />} />
        <Route path="/flow" element={<Flow />} />
        <Route path="/flow/:pid" element={<Flow />} />
      </Routes>

      <button className="gear-fab" onClick={() => setOpen(true)} title="模型设置">
        <span className="gear-ico">⚙️</span>
        <span className="gear-model">{cfg.model}</span>
      </button>
      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  )
}
