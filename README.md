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

A ferramenta calcula limites de blocos IPv4; não verifica atribuição, disponibilidade, roteabilidade nem políticas de endereços especiais. A cópia depende das permissões do navegador, com tentativa alternativa para arquivos locais.

## Entregas

Esta primeira entrega contém a calculadora funcional. Exemplos clicáveis e explicações visuais serão adicionados em um segundo PR, somente após confirmação do merge do primeiro. Hospedagem na Vercel será tratada em etapa posterior.
