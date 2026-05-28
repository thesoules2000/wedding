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
