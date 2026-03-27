# Detraxis Site

Website institucional da Detraxis com múltiplas páginas HTML, design system em CSS tokens e deploy automatizado no GitHub Pages.

## Stack e filosofia

- HTML/CSS/JS vanilla (sem framework de UI)
- Design system modular (tokens + componentes reutilizáveis)
- Build para produção com minificação
- Deploy automático via GitHub Actions
- Fonte legível no repositório, artefato otimizado em `dist/`

## Estrutura do projeto

```text
.
├─ .github/workflows/
│  └─ deploy.yml                 # CI/CD para build e deploy no Pages
├─ scripts/
│  └─ build.mjs                  # Build e minificação para dist/
├─ site/
│  ├─ css/
│  │  ├─ tokens.css              # Tokens globais (cores, spacing, tipografia, etc.)
│  │  ├─ base.css                # Reset e base tipográfica
│  │  ├─ style.css               # Orquestra imports de CSS
│  │  ├─ primitives/             # Primitivos (ex.: grid)
│  │  ├─ components/             # Componentes reutilizáveis
│  │  ├─ sections/               # Blocos de seção (ex.: hero)
│  │  ├─ pages/                  # Estilos específicos por página
│  │  ├─ animations.css
│  │  └─ responsive.css
│  ├─ js/
│  │  ├─ hero.js
│  │  ├─ form.js
│  │  ├─ cookie-consent.js
│  │  └─ spotlight.js
│  └─ img/                       # Assets estáticos
├─ *.html                        # Páginas principais do site
├─ package.json
└─ README.md
```

## Organização do CSS

Entrada principal: `site/css/style.css`.

Ordem de camadas:

1. Tokens (`tokens.css`)
2. Base/reset (`base.css`)
3. Primitivos (`primitives/*`)
4. Componentes (`components/*`)
5. Seções (`sections/*`)
6. Animações e responsivo (`animations.css`, `responsive.css`)
7. Overrides por página (`site/css/pages/*`, importados diretamente na página)

### Regras para evoluir CSS sem regressão

- Reutilize tokens existentes antes de criar novos.
- Prefira componentes genéricos em `components/`.
- Use `pages/*.css` apenas para necessidade realmente específica.
- Evite alterar seletores globais sem validar todas as páginas.

## Organização do JavaScript

- JS é modular por responsabilidade e carregado por página via `<script src="...">`.
- `cookie-consent.js` é injetado somente na home (`index.html`).
- Evite lógica compartilhada acoplada a páginas específicas.

## Fluxo de trabalho local

### 1) Instalar dependências

```bash
npm install
```

### 2) Rodar build de produção

```bash
npm run build
```

Saída em `dist/` (minificado):

- HTML minificado
- CSS minificado
- JS minificado
- Assets copiados preservando estrutura

### 3) Preview local simples

No diretório raiz:

```bash
python -m http.server 4173
```

Abra `http://localh
ost:4173/`.

## Deploy automático (GitHub Pages)

Workflow: `.github/workflows/deploy.yml`

No push para `main`, ele:

1. Faz checkout
2. Configura Node 20
3. Instala dependências
4. Executa `npm run build`
5. Publica `dist/` no GitHub Pages

### Configuração necessária no repositório GitHub

- **Settings → Pages → Source: GitHub Actions**

## Observação importante sobre lockfile

O workflow usa `npm ci`, que requer lockfile versionado (`package-lock.json`).

Se o lockfile estiver ignorado, ajuste para versionar e rode:

```bash
npm install
git add package-lock.json
git commit -m "chore: adiciona lockfile para CI"
```

## Convenções para contribuir

- Faça mudanças pequenas e isoladas por tema (ex.: `components/card.css`).
- Preserve compatibilidade visual (spacing, tipografia, estados, responsivo).
- Não adicione dependências sem necessidade real.
- Evite editar HTML estrutural sem validar página completa.
- Quando adicionar componente:
  - CSS em `site/css/components/`
  - Import em `site/css/style.css`
  - JS (se necessário) em `site/js/`

## Checklist de PR

- Build local concluído (`npm run build`)
- Páginas críticas abertas e verificadas (`index`, `pitch-*`, `terms`, `links`)
- Sem regressão visual percebida
- Sem `dist/` no commit

## Comandos úteis

```bash
npm run build
git status
git diff
```
