"use strict";

// Conversões aritméticas evitam o sinal negativo dos operadores bit a bit de JS.
function toIPv4(value) {
  return [24, 16, 8, 0].map(bits => Math.floor(value / 2 ** bits) % 256).join(".");
}

function calculateIPv4(input) {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(input.trim());
  if (!match) throw new Error("Informe um IPv4 completo com prefixo, como 192.168.10.25/24.");
  const octets = match.slice(1, 5).map(Number);
  const prefix = Number(match[5]);
  if (octets.some(octet => octet > 255)) throw new Error("Cada octeto do IPv4 deve estar entre 0 e 255.");
  if (prefix > 32) throw new Error("O prefixo CIDR deve estar entre /0 e /32.");
  const ipNumber = octets.reduce((value, octet) => value * 256 + octet, 0);
  // Todos os inteiros IPv4 e 2^32 são exatos no tipo Number.
  const total = 2 ** (32 - prefix);
  const wildcard = total - 1;
  const mask = 2 ** 32 - total;
  // Zerar os bits de host equivale a encontrar o início do bloco.
  const network = Math.floor(ipNumber / total) * total;
  const end = network + wildcard;
  const conventional = prefix < 31;
  const binary = value => toIPv4(value).split(".").map(octet => Number(octet).toString(2).padStart(8, "0")).join(".");
  return {
    ip: toIPv4(ipNumber), prefix, mask: toIPv4(mask), wildcard: toIPv4(wildcard),
    network: toIPv4(network), broadcast: conventional ? toIPv4(end) : null,
    first: toIPv4(conventional ? network + 1 : network),
    last: toIPv4(conventional ? end - 1 : end), total,
    hosts: conventional ? total - 2 : total,
    ipBinary: binary(ipNumber), maskBinary: binary(mask),
    note: prefix === 31
      ? "Rede /31: usada em enlaces ponto a ponto. Os dois endereços são utilizáveis e não há endereço de broadcast."
      : prefix === 32
        ? "Rede /32: representa uma rota de host, com um único endereço. Não há endereço de broadcast."
        : "Rede convencional: os endereços de rede e broadcast são reservados e descontados dos hosts utilizáveis."
  };
}

if (typeof document !== "undefined") {
  const form = document.getElementById("calculator");
  const input = document.getElementById("address");
  const result = document.getElementById("result");
  const error = document.getElementById("error");
  const status = document.getElementById("status");
  const copy = document.getElementById("copy");
  let resultText = "";
  function clearResult() {
    result.hidden = true;
    copy.disabled = true;
    resultText = "";
    error.textContent = "";
    status.textContent = "";
    input.removeAttribute("aria-invalid");
  }
  input.addEventListener("input", clearResult);
  form.addEventListener("reset", () => { clearResult(); input.focus(); });
  form.addEventListener("submit", event => {
    event.preventDefault();
    clearResult();
    try {
      const data = calculateIPv4(input.value);
      const rows = [
        ["Endereço IPv4 informado", data.ip], ["Prefixo CIDR", `/${data.prefix}`],
        ["Máscara decimal", data.mask], ["Máscara inversa (wildcard)", data.wildcard],
        ["Endereço da rede", data.network], ["Endereço de broadcast", data.broadcast ?? "Não se aplica"],
        ["Primeiro endereço utilizável", data.first], ["Último endereço utilizável", data.last],
        ["Quantidade total de endereços", data.total.toLocaleString("pt-BR")],
        ["Hosts utilizáveis", data.hosts.toLocaleString("pt-BR")]
      ];
      const details = document.getElementById("details");
      details.replaceChildren();
      for (const [label, value] of rows) {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label; dd.textContent = value;
        details.append(dt, dd);
      }
      document.getElementById("note").textContent = data.note;
      document.getElementById("ip-binary").textContent = data.ipBinary;
      document.getElementById("mask-binary").textContent = data.maskBinary;
      resultText = rows.map(row => row.join(": ")).join("\n") + `\nIP binário: ${data.ipBinary}\nMáscara binária: ${data.maskBinary}\n${data.note}`;
      result.hidden = false; copy.disabled = false;
      document.getElementById("result-title").focus();
    } catch (exception) {
      error.textContent = exception.message;
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
  });
  copy.addEventListener("click", async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(resultText);
      } else {
        // Compatibilidade ao abrir por file:// em navegadores sem Clipboard API.
        const area = document.createElement("textarea");
        area.value = resultText;
        area.style.position = "fixed"; area.style.opacity = "0";
        document.body.append(area); area.select();
        let copied;
        try { copied = document.execCommand("copy"); } finally { area.remove(); copy.focus(); }
        if (!copied) throw new Error("Cópia indisponível");
      }
      status.textContent = "Resultado copiado.";
    } catch {
      status.textContent = "O navegador não permitiu a cópia. Selecione e copie o resultado manualmente.";
    }
  });
}

if (typeof module !== "undefined") module.exports = { calculateIPv4 };
