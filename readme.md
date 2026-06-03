# Свадебный сайт — Максим & Полина

Одностраничное приглашение на свадьбу 14 августа 2026, Минск.

## Структура

```
Wedding/
├── index.html
├── css/styles.css
├── js/config.js    ← настройки (Google Form, дата)
├── js/main.js
└── README.md
```

## Ветки дизайна

| Ветка | Стиль |
|-------|--------|
| `main` | Светлый минимализм — бежевый фон, Cormorant Garamond |
| `design/alternative` | Светлый стиль (как [albertelena.wedding](https://albertelena.wedding/)) — Oswald + Onest, карточки, FAQ |

Переключение:

```powershell
git checkout main
git checkout design/alternative
```

## Локальный запуск

1. Откройте папку `Wedding` в проводнике.
2. Дважды кликните `index.html` — сайт откроется в браузере.

Или из терминала (если установлен Python):

```bash
cd c:\Wedding
python -m http.server 8080
```

Откройте http://localhost:8080

## Google Form (RSVP)

1. [Google Forms](https://forms.google.com) → новая форма.
2. Поля:
   - Имя и фамилия (короткий ответ)
   - Будете на свадьбе? (один из списка: Да / К сожалению, нет)
   - Комментарий (абзац, необязательно)
3. Вкладка **Ответы** → связать с **Google Таблицей**.
4. **Отправить** → иконка `</>` → скопировать `src` из iframe → в `js/config.js` → `googleFormEmbedUrl`.
5. Обычную ссылку «Поделиться» → в `googleFormViewUrl`.

### Без входа в Google (для гостей)

В редакторе формы: **Настройки** (шестерёнка) → вкладка **Ответы**:

| Настройка | Что выбрать |
|-----------|-------------|
| **Ограничить до 1 ответа** | **Выключено** — иначе Google потребует войти в аккаунт |
| **Собирать адреса электронной почты** | **Не собирать** (или «Ответ вводит сам», если нужен email в тексте ответа) |
| **Загрузка файлов** | Не добавляйте такой вопрос — для загрузки нужен вход в Google |

Если вы сами залогинены в Chrome, сверху формы всё равно может показываться ваш email — это нормально. Гость в режиме инкогнито или без аккаунта сможет заполнить форму, если ограничение «1 ответ» выключено.

Проверка: откройте ссылку формы в **режиме инкогнито** и отправьте тестовый ответ.

## Публикация на GitHub Pages

Сайт для гостей: **https://thesoules2000.github.io/wedding/**

После push в ветку `main` GitHub Actions собирает `dist/` и публикует сайт автоматически.

Первый раз в репозитории на GitHub:

1. **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**
2. Дождитесь зелёной галочки у workflow **GitHub Pages** во вкладке **Actions**

Локально перед push:

```powershell
cd c:\wedding
git add .
git commit -m "Обновление приглашения"
git push origin main
```

## Публикация на Cloudflare Pages

Сайт статический — для гостей хватит бесплатного тарифа Cloudflare Pages (без лимита трафика).

### Вариант 1 — через терминал (быстрее всего)

1. Зарегистрируйтесь на [cloudflare.com](https://dash.cloudflare.com/sign-up).
2. В папке проекта:

```powershell
cd c:\wedding
npm install wrangler --save-dev
npx wrangler login
npm run deploy
```

3. Wrangler выдаст ссылку вида `https://polina-maksim-wedding.pages.dev`.

Повторный деплой после правок — снова `npm run deploy`.

### Вариант 2 — через GitHub (автодеплой при push)

1. Закоммитьте и запушьте проект в [github.com/thesoules2000/wedding](https://github.com/thesoules2000/wedding).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Выберите репозиторий `wedding`, ветку `design/alternative-1` (или `main`).
4. Настройки сборки:

| Поле | Значение |
|------|----------|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |

5. **Save and Deploy** — сайт появится на `*.pages.dev`.

### Свой домен (необязательно)

В Cloudflare Pages → **Custom domains** → добавьте домен (например `polina-i-maksim.by`). SSL включится автоматически.

### Что попадает на хост

Скрипт `npm run build` копирует в `dist/` только нужное: HTML, CSS, JS, картинки, favicon.  
`node_modules`, `design/` и черновики на сайт не попадают.

## Публикация на GitHub Pages

1. Создайте репозиторий на GitHub (например `wedding-invite`).
2. В папке проекта:

```bash
git init
git add .
git commit -m "Свадебное приглашение"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/wedding-invite.git
git push -u origin main
```

3. На GitHub: **Settings** → **Pages** → Source: **main** / **/(root)** → Save.
4. Сайт будет по адресу `https://ВАШ_ЛОГИН.github.io/wedding-invite/`

## Что можно менять

- **Фото на главной:** в `js/config.js` → `hero.photoUrl` (лучше общее фото пары в PNG с прозрачным фоном, как на [albertelena.wedding](https://albertelena.wedding/))
- Тексты и время в `index.html`
- Цвета и шрифты в `css/styles.css` (блок `:root`)
- Дедлайн RSVP в секции `#rsvp`
- Карта: ссылка и iframe в секции `#location`
