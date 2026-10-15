"use strict";

// Conversões aritméticas evitam o sinal negativo dos operadores bit a bit de JS.
function toIPv4(value) {
  return [24, 16, 8, 0].map(bits => Math.floor(value / 2 ** bits) % 256).join(".");
}

function calculateIPv4(input) {
  const text = input.trim();
  if (!text) throw new Error("Digite um endereço IPv4 e seu prefixo CIDR.");
  const parts = text.split("/");
  if (parts.length > 2) throw new Error("Use uma única barra entre o IPv4 e o prefixo CIDR.");
  const octetTexts = parts[0].split(".");
  if (octetTexts.length !== 4 || octetTexts.some(octet => octet === "")) {
    throw new Error("IPv4 incompleto: informe quatro octetos, como 192.168.10.25.");
  }
  if (octetTexts.some(octet => !/^\d{1,3}$/.test(octet) || Number(octet) > 255)) {
    throw new Error("Cada octeto do IPv4 deve ser um número inteiro de 0 a 255, com até três dígitos.");
  }
  if (parts.length < 2 || parts[1] === "") throw new Error("Informe o prefixo CIDR após a barra, como /24.");
  if (!/^\d{1,2}$/.test(parts[1]) || Number(parts[1]) > 32) {
    throw new Error("O prefixo CIDR deve ser um número inteiro entre /0 e /32.");
  }
  const octets = octetTexts.map(Number);
  const prefix = Number(parts[1]);
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
    ipBinary: binary(ipNumber), maskBinary: binary(mask), networkBinary: binary(network),
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
  document.querySelectorAll("[data-example]").forEach(button => {
    button.addEventListener("click", () => {
      input.value = button.dataset.example;
      form.requestSubmit();
    });
  });
  function renderBits(id, value, prefix) {
    const target = document.getElementById(id);
    target.replaceChildren();
    target.setAttribute("aria-label", `${value}. ${prefix} bits de rede e ${32 - prefix} bits de host.`);
    value.split(".").forEach((octet, index) => {
      const group = document.createElement("span");
      group.className = "octet";
      group.setAttribute("aria-hidden", "true");
      [...octet].forEach((bit, offset) => {
        const digit = document.createElement("span");
        const isNetwork = index * 8 + offset < prefix;
        digit.className = isNetwork ? "network-bit" : "host-bit";
        digit.textContent = bit;
        digit.title = `Bit ${index * 8 + offset + 1}: ${isNetwork ? "rede (R)" : "host (H)"}`;
        group.append(digit);
      });
      target.append(group);
      if (index < 3) target.append(document.createTextNode("."));
    });
  }
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
      renderBits("ip-binary", data.ipBinary, data.prefix);
      renderBits("mask-binary", data.maskBinary, data.prefix);
      renderBits("network-binary", data.networkBinary, data.prefix);
      document.getElementById("bit-summary").textContent = `/${data.prefix}: ${data.prefix} bits de rede e 32 − ${data.prefix} = ${32 - data.prefix} bits de host. Total: 2 elevado a ${32 - data.prefix} = ${data.total.toLocaleString("pt-BR")} endereços.`;
      document.getElementById("calculation-summary").textContent = `${data.ip} AND ${data.mask} = ${data.network}. ${data.note}`;
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
