# Just Watching - Firefox Cookie Detection Extension

## Descrição
"Just Watching" é uma extensão de navegador para Firefox com o objetivo de detectar a quantidade de cookie e informações que são guardadas de forma local por algum site. A ideia é dar maior segurança na hora de acessar um site por saber se ele utiliza armazenamento local e qual o numero e classificação dos cookies que o site utiliza.

## Funcionalidades
- **Monitoramento de Solicitações de Terceiros**: Detecta e conta as solicitações feitas a domínios que não são da página principal.
- **Detecção de Cookies de Primeira e Terceira Parte**: Diferencia e conta cookies de primeira e terceira parte usados pelas páginas.
- **Uso de Armazenamento Local**: Monitora o uso de `localStorage` e `sessionStorage`.
- **Avaliação de Privacidade**: Atribui uma pontuação ao site baseado nas metricas dando ao usuário uma visão facilitada do nível de segurança do site acessado.

## Instalação
Para instalar no seu navegador Firefox, siga estes passos:

1. Clone ou baixe este repositório para o seu computador.
2. Abra o Firefox e digite `about:debugging` na barra de endereços.
3. Clique em "This Firefox" (ou "Este Firefox") na barra lateral esquerda.
4. Clique em "Load Temporary Add-on" (ou "Carregar Complemento Temporário") e selecione o arquivo `manifest.json` de dentro da pasta do projeto.
5. A extensão agora deve estar ativa em seu navegador.

