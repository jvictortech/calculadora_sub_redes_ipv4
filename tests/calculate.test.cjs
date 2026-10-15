const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateIPv4: calc } = require('../js/app.js');

test('limites de blocos e hosts, incluindo prefixos extremos', () => {
  for (const [input, network, broadcast, first, last, total, hosts] of [
    ['192.168.10.130/26', '192.168.10.128', '192.168.10.191', '192.168.10.129', '192.168.10.190', 64, 62],
    ['10.0.0.1/30', '10.0.0.0', '10.0.0.3', '10.0.0.1', '10.0.0.2', 4, 2],
    ['255.255.255.255/0', '0.0.0.0', '255.255.255.255', '0.0.0.1', '255.255.255.254', 4294967296, 4294967294],
    ['192.0.2.1/31', '192.0.2.0', null, '192.0.2.0', '192.0.2.1', 2, 2],
    ['255.255.255.255/32', '255.255.255.255', null, '255.255.255.255', '255.255.255.255', 1, 1]
  ]) {
    const r = calc(input);
    assert.deepEqual([r.network, r.broadcast, r.first, r.last, r.total, r.hosts], [network, broadcast, first, last, total, hosts]);
  }
});
test('máscaras, wildcard e binário para todos os prefixos', () => {
  for (let prefix = 0; prefix <= 32; prefix++) {
    const r = calc(`192.168.10.25/${prefix}`);
    assert.equal(r.maskBinary.replaceAll('.', ''), '1'.repeat(prefix) + '0'.repeat(32 - prefix));
    const n = ip => ip.split('.').reduce((a, b) => a * 256 + Number(b), 0);
    assert.equal(n(r.mask) + n(r.wildcard), 4294967295);
    assert.equal(r.total, 2 ** (32 - prefix));
  }
  assert.equal(calc('192.168.10.25/24').ipBinary, '11000000.10101000.00001010.00011001');
});
test('rejeita entradas inválidas', () => {
  for (const input of ['256.1.1.1/24', '256.1.1.1', '192.168.1/24', '192.168.1.1/33', '', '1.2.3.4/-1', '1.2.3.4', '1.2.3.4/1.5']) assert.throws(() => calc(input));
});
test('exemplos didáticos e diagnóstico de entradas incompletas', () => {
  assert.equal(calc('192.168.1.10/24').hosts, 254);
  assert.equal(calc('192.0.2.0/31').first, '192.0.2.0');
  assert.equal(calc('192.0.2.10/32').first, '192.0.2.10');
  assert.equal(calc('192.168.10.130/26').networkBinary, '11000000.10101000.00001010.10000000');
  for (const [input, message] of [
    ['', /Digite/], ['192.168.1/24', /incompleto/], ['192..1.1/24', /incompleto/],
    ['256.1.1.1/24', /octeto/], ['1.2.3.4', /prefixo/], ['1.2.3.4/', /prefixo/],
    ['1.2.3.4/33', /entre/], ['1.2.3.4/abc', /inteiro/], ['1.2.3.4/24/1', /única barra/]
  ]) assert.throws(() => calc(input), message);
});
