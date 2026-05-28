/**
 * Настройки сайта — меняйте только этот файл для RSVP.
 *
 * Как подключить Google Form:
 * 1. Создайте форму на https://forms.google.com
 * 2. Поля: имя и фамилия, присутствие (да/нет), комментарий (необязательно)
 * 3. Настройки → Ответы → Создать таблицу в Google Sheets
 * 4. Нажмите «Отправить» → значок <> → скопируйте ссылку embed (iframe)
 * 5. Вставьте URL ниже в GOOGLE_FORM_EMBED_URL
 * 6. Для кнопки «Открыть в новой вкладке» — обычная ссылка на форму в GOOGLE_FORM_VIEW_URL
 */

// window — чтобы main.js видел настройки (const на window не попадает)
window.WEDDING_CONFIG = {
  // Дата свадьбы (полночь по локальному времени браузера гостя)
  weddingDate: "2026-08-14T00:00:00",

  /** Главный экран: подставьте общее фото пары (PNG с прозрачностью — идеально) */
  hero: {
    photoUrl: "images/troitskoe-minsk.webp",
    photoAlt: "Максим и Полина",
  },

  googleFormEmbedUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScSqKTDiWSnRtZjcSEevJY8731NXH8faW_P1k2H0wdivg3MDg/viewform?embedded=true",
  googleFormViewUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScSqKTDiWSnRtZjcSEevJY8731NXH8faW_P1k2H0wdivg3MDg/viewform",

  /**
   * Цветочная подписка:
   * linkUrl — рабочая ссылка (сейчас заглушка example.com)
   * qrImageUrl — свой QR-картинкой; если пусто — QR строится по linkUrl автоматически
   */
  flowerSubscription: {
    linkUrl: "https://example.com",
    linkText: "Перейти к подписке",
    qrImageUrl: "",
  },

  // Telegram-чат гостей
  telegramChat: {
    inviteUrl: "https://t.me/+4lZjbHZuIIQxN2U6",
    linkText: "Вступить в чат",
  },
};
