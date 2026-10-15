// Verificação opcional: Node.js 22+ e Chrome/Chromium instalado. Sem pacotes externos.
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');

(async () => {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'ipv4-qa-'));
  const executable = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = spawn(executable, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let launchError;
  browser.on('error', error => { launchError = error; });
  let socket;
  try {
    let port;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (launchError) throw launchError;
      try { port = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    if (!port) throw new Error('Chrome não iniciou em 10 segundos.');
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    };
    async function send(method, params = {}) {
      const id = ++sequence;
      const response = new Promise(resolve => pending.set(id, resolve));
      socket.send(JSON.stringify({ id, method, params }));
      const message = await response;
      if (message.error) throw new Error(JSON.stringify(message.error));
      return message.result;
    }
    async function evaluate(expression) {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }
    await send('Page.navigate', { url: pathToFileURL(path.resolve(__dirname, '../index.html')).href });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate('document.readyState === "complete" && !!document.querySelector("[data-example]")')) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    for (const width of [1280, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Overflow em ${width}px`);
      const examples = await evaluate('Array.from(document.querySelectorAll("[data-example]"), b => b.dataset.example)');
      assert.equal(examples.length, 5);
      for (const example of examples) {
        const state = await evaluate(`(() => {
          document.querySelector('[data-example="${example}"]').click();
          return { visible: !document.querySelector('#result').hidden,
            bits: document.querySelectorAll('#ip-binary .network-bit').length,
            hostBits: document.querySelectorAll('#ip-binary .host-bit').length,
            focus: document.activeElement.id,
            overflow: document.documentElement.scrollWidth > innerWidth };
        })()`);
        assert.deepEqual(state, { visible: true, bits: Number(example.split('/')[1]), hostBits: 32 - Number(example.split('/')[1]), focus: 'result-title', overflow: false });
      }
      await evaluate('document.querySelectorAll("[data-example]")[1].click()');
      await evaluate('window.scrollTo(0, document.querySelector("#result").offsetTop)');
      const screenshot = await send('Page.captureScreenshot', { captureBeyondViewport: true });
      await fs.writeFile(path.join(os.tmpdir(), `ipv4-result-${width}.png`), Buffer.from(screenshot.data, 'base64'));
      for (const input of ['256.1.1.1/24', '192.168.1/24', '1.2.3.4/33']) {
        assert.equal(await evaluate(`(() => { document.querySelector('#address').value = ${JSON.stringify(input)}; document.querySelector('form').requestSubmit(); return document.querySelector('#result').hidden && !!document.querySelector('#error').textContent && document.activeElement.id === 'address'; })()`), true);
      }
      assert.equal(await evaluate('(() => { document.querySelector("button[type=reset]").click(); return document.querySelector("#address").value === "" && !document.querySelector("#error").textContent && document.querySelector("#copy").disabled; })()'), true);
      console.log(`OK: exemplos, bits, validação, foco, limpar e layout em ${width}px`);
    }
  } finally {
    if (socket) socket.close();
    browser.kill();
    // Perfil temporário preservado para diagnóstico; nenhum arquivo do projeto é alterado.
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
