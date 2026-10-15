# Calculadora de Sub-redes IPv4

Ferramenta didática de Redes de Computadores e projeto de portfólio de **João Victor Pinheiro da Silva**, professor de Informática no **IFPA – Campus Altamira**.

## Execução local

Baixe ou clone o repositório e abra `index.html` no navegador. Funciona offline, sem instalação, frameworks, dependências externas ou build. Desenvolvido com HTML5, CSS3 e JavaScript puro.

## Funcionalidades

Informe um IPv4 com CIDR, como `192.168.10.25/24`, e clique em **Calcular**. Exibe IP, prefixo, máscara, wildcard, rede, broadcast quando aplicável, intervalo utilizável, totais de endereços e hosts e IP/máscara em binário. Há botões para limpar e copiar o resultado, mensagens de validação e interface responsiva com rótulos e foco visível.

Aceita prefixos de /0 a /32. Redes convencionais reservam rede e broadcast; /31 considera os dois endereços utilizáveis em enlaces ponto a ponto, sem broadcast; /32 representa uma rota de host com um endereço, sem broadcast. Os cálculos usam aritmética exata em vez de operações de 32 bits com sinal.

## Estrutura

```text
index.html       Interface e estrutura semântica
css/style.css    Estilos e adaptação a telas pequenas
js/app.js        Validação, cálculo e interação
tests/calculate.test.cjs  Verificação dos cálculos com Node.js
```

## Verificação

Opcionalmente, com Node.js instalado, execute `node --test tests/calculate.test.cjs`. O uso da calculadora não exige Node.js. Confira também a navegação por teclado, os botões e a interface em telas de desktop e celular.

Para a verificação da interface, use `node tests/browser-check.cjs` com Node.js 22+ e Chrome instalado. No Windows, o script usa o caminho padrão do Chrome; em outras instalações, defina `CHROME_PATH` com o caminho do executável. O teste abre o arquivo local, verifica exemplos, cores dos bits, foco após cálculo e erros, limpeza e ausência de rolagem horizontal em 1280, 390 e 320 pixels. Capturas e perfis de diagnóstico são salvos na pasta temporária do sistema. Não instala pacotes nem publica o site.

A ferramenta calcula limites de blocos IPv4; não verifica atribuição, disponibilidade, roteabilidade nem políticas de endereços especiais. A cópia depende das permissões do navegador, com tentativa alternativa para arquivos locais.

## Exemplos didáticos

Os botões de exemplo preenchem o campo e calculam imediatamente:

| Entrada | Rede | Broadcast | Hosts utilizáveis |
| --- | --- | --- | --- |
| 192.168.1.10/24 | 192.168.1.0 | 192.168.1.255 | 254 |
| 192.168.10.130/26 | 192.168.10.128 | 192.168.10.191 | 62 |
| 10.0.0.1/30 | 10.0.0.0 | 10.0.0.3 | 2 |
| 192.0.2.0/31 | 192.0.2.0 | Não se aplica | 2 |
| 192.0.2.10/32 | 192.0.2.10 | Não se aplica | 1 |

A seção **Entenda o cálculo** relaciona prefixo, bits de host, potência de dois e obtenção da rede por AND. A visualização destaca os bits de rede em verde e os de host em vermelho sublinhado, com legenda e descrição acessível. Em /0, todos os bits são de host; em /32, todos são de rede.

## Validação e limitações

Há mensagens específicas para campo vazio, IPv4 incompleto, octetos inválidos, prefixo ausente e prefixos fora de /0–/32. São aceitos somente IPv4 em formato decimal pontuado com CIDR inteiro; IPv6, VLSM e divisão em múltiplas sub-redes não são suportados. Zeros iniciais são interpretados como decimais e normalizados no resultado. A contagem é matemática: endereços especiais não são filtrados do intervalo, inclusive em /0.

O projeto continua offline, sem dependências de execução. Não há configuração de hospedagem nesta entrega.
