# Calculadora de Sub-redes IPv4

Acessivel em qualquer navegador: https://jvictortech.github.io/calculadora_sub_redes_ipv4

Ferramenta didática de Redes de Computadores e projeto de portfólio de **João Victor Pinheiro da Silva**, professor de Informática no **IFPA – Campus Altamira**.

## Execução local

Baixe ou clone o repositório e abra `index.html` no navegador. Funciona offline, sem instalação, frameworks, dependências externas ou build. Desenvolvido com HTML5, CSS3 e JavaScript puro.

## Funcionalidades

Informe um IPv4 com CIDR, como `192.168.10.25/24`, e clique em **Calcular**. Exibe IP, prefixo, máscara, wildcard, rede, broadcast quando aplicável, intervalo utilizável, totais de endereços e hosts e IP/máscara em binário. Há botões para limpar e copiar o resultado, mensagens de validação e interface responsiva com rótulos e foco visível.

Aceita prefixos de /0 a /32. Redes convencionais reservam rede e broadcast; /31 considera os dois endereços utilizáveis em enlaces ponto a ponto, sem broadcast; /32 representa uma rota de host com um endereço, sem broadcast. Os cálculos usam aritmética exata em vez de operações de 32 bits com sinal.


