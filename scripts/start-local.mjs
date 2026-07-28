import net from 'node:net'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function canUse(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.once('error', () => resolve(false))
    const options = host ? { port, host } : { port }
    server.listen(options, () => {
      server.close(() => resolve(true))
    })
  })
}

async function freePort(start, host) {
  for (let port = start; port < start + 100; port += 1) {
    if (await canUse(port, host)) return port
  }
  throw new Error(`从 ${start} 开始的 100 个端口都不可用`)
}

// Express 默认监听所有地址；Vite 明确只监听 127.0.0.1。探测方式必须与实际绑定一致。
const apiPort = await freePort(8787)
const webPort = await freePort(5173, '127.0.0.1')

const common = {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env },
}

const backend = spawn(process.execPath, ['server/index.js'], {
  ...common,
  env: { ...common.env, PORT: String(apiPort) },
})

const viteArgs = [
  path.join(root, 'node_modules/vite/bin/vite.js'),
  '--host',
  '127.0.0.1',
  '--port',
  String(webPort),
  '--strictPort',
]
if (process.env.NO_OPEN !== '1') viteArgs.push('--open')

const frontend = spawn(process.execPath, viteArgs, {
  ...common,
  env: {
    ...common.env,
    VITE_PORT: String(webPort),
    VITE_API_PORT: String(apiPort),
  },
})

console.log('\n[local] 大模型商业范式评估已启动')
console.log(`[local] 使用地址：http://127.0.0.1:${webPort}`)
console.log(`[local] 本地代理：http://127.0.0.1:${apiPort}`)
console.log('[local] 关闭此终端窗口或按 Ctrl+C 即可停止\n')

let closing = false
function shutdown(code = 0) {
  if (closing) return
  closing = true
  if (!backend.killed) backend.kill('SIGTERM')
  if (!frontend.killed) frontend.kill('SIGTERM')
  setTimeout(() => process.exit(code), 300).unref()
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(0))
}

backend.on('exit', (code, signal) => {
  if (!closing && code !== 0) {
    console.error(`[local] 后端异常退出（${signal || code}）`)
    shutdown(code || 1)
  }
})
frontend.on('exit', (code, signal) => {
  if (!closing && code !== 0) {
    console.error(`[local] 前端异常退出（${signal || code}）`)
    shutdown(code || 1)
  }
})
