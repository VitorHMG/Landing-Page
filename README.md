# AtlasMap | Banner Digital

Landing page em formato de banner digital interativo para apresentação do projeto acadêmico AtlasMap.

## Sobre o projeto

O AtlasMap é um protótipo web para cadastro, visualização e acompanhamento de projetos sustentáveis. A aplicação reúne:

- login e cadastro simulados;
- cards de projetos com curtidas;
- painel de perfil com projetos criados e curtidos;
- edição de projetos cadastrados;
- cadastro por coordenadas;
- mapa interativo com Mapbox GL JS;
- persistência simulada com LocalStorage.

## Estrutura

```bash
banner-digital-github/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── imagens/
    └── docs/
```

Para a apresentação final, os arquivos deste banner podem ficar na mesma pasta dos arquivos do protótipo principal (`login.html`, `mapa.html`, `style.css`, `js/scripts.js` e imagens).

Como o protótipo principal também usa `index.html`, este projeto inclui uma cópia chamada `banner.html`. Use `banner.html` como página de apresentação quando quiser manter o `index.html` do aplicativo AtlasMap funcionando como página inicial após o login.

## Links esperados na apresentação

- `index.html`: banner digital neste repositório.
- `banner.html`: cópia pronta para uso quando o banner ficar na mesma pasta do protótipo.
- `login.html`: entrada do protótipo AtlasMap.
- `mapa.html`: mapeamento de projetos.

## Publicação no GitHub Pages

1. Envie os arquivos para um repositório público.
2. Acesse **Settings > Pages**.
3. Selecione **Deploy from a branch**.
4. Escolha a branch `main` e a pasta `/root`.
5. Aguarde o GitHub gerar o link público.

O QR Code da página é gerado automaticamente com a URL aberta no navegador.
