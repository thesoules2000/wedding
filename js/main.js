/**
 * Основная логика сайта: обратный отсчёт, RSVP.
 */

(function () {
  "use strict";

  const config = window.WEDDING_CONFIG || {};

  initCountdown(config.weddingDate);
  initRsvp(config.googleFormEmbedUrl, config.googleFormViewUrl);
  initFlowerSubscription(config.flowerSubscription);
  initTelegramChat(config.telegramChat);

  /** Дни / часы / минуты до свадьбы */
  function initCountdown(dateString) {
    const root = document.getElementById("countdown");
    if (!root || !dateString) return;

    const target = new Date(dateString).getTime();
    const units = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
    };

    function update() {
      const now = Date.now();
      let diff = target - now;

      if (diff <= 0) {
        setValues(0, 0, 0);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diff / (1000 * 60));

      setValues(days, hours, minutes);
    }

    function setValues(days, hours, minutes) {
      if (units.days) units.days.textContent = String(days);
      if (units.hours) units.hours.textContent = String(hours);
      if (units.minutes) units.minutes.textContent = String(minutes);
    }

    update();
    setInterval(update, 60000);
  }

  /** RSVP: встроенная форма или предупреждение */
  function initRsvp(embedUrl, viewUrl) {
    const openBtn = document.getElementById("rsvp-open");
    const closeBtn = document.getElementById("rsvp-close");
    const panel = document.getElementById("rsvp-panel");
    const iframe = document.getElementById("rsvp-iframe");
    const link = document.getElementById("rsvp-link");

    const hasForm = Boolean(embedUrl && embedUrl.trim());
    const hasViewLink = Boolean(viewUrl && viewUrl.trim());

    if (link) {
      if (hasViewLink) {
        link.href = viewUrl;
      } else {
        link.hidden = true;
      }
    }

    if (iframe && hasForm) {
      iframe.src = toEmbedUrl(embedUrl);
    }

    if (openBtn) {
      openBtn.addEventListener("click", function () {
        if (hasForm && panel && iframe) {
          panel.hidden = false;
          if (!iframe.src) iframe.src = toEmbedUrl(embedUrl);
          panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else if (hasViewLink) {
          window.open(viewUrl, "_blank", "noopener,noreferrer");
        } else {
          alert(
            "Ссылка на анкету ещё не настроена.\n\n" +
              "Откройте файл js/config.js и укажите googleFormEmbedUrl и googleFormViewUrl."
          );
        }
      });
    }

    if (closeBtn && panel) {
      closeBtn.addEventListener("click", function () {
        panel.hidden = true;
      });
    }
  }

  /** Telegram-чат гостей */
  function initTelegramChat(chat) {
    const linkEl = document.getElementById("telegram-link");
    const noteEl = document.getElementById("telegram-note");
    if (!chat || !linkEl) return;

    const url = (chat.inviteUrl || "").trim();
    const isPlaceholder =
      !url ||
      url === "#" ||
      url === "https://t.me/" ||
      url === "https://t.me";

    linkEl.href = url || "#";
    if (chat.linkText) linkEl.textContent = chat.linkText;

    if (isPlaceholder) {
      linkEl.setAttribute("aria-disabled", "true");
      linkEl.classList.add("btn--disabled");
      linkEl.addEventListener("click", function (e) {
        e.preventDefault();
      });
      if (noteEl) noteEl.hidden = false;
    } else if (noteEl) {
      noteEl.hidden = true;
    }
  }

  /** Цветочная подписка — ссылка и QR */
  function initFlowerSubscription(flower) {
    const linkEl = document.getElementById("flowers-link");
    const qrEl = document.getElementById("flowers-qr");
    const noteEl = document.querySelector(".flowers-note");
    if (!flower) return;

    const url = (flower.linkUrl || "").trim();
    const isPlaceholder = !url || url === "#" || url.includes("example.com");

    if (linkEl) {
      linkEl.href = url || "#";
      if (flower.linkText) linkEl.textContent = flower.linkText;
      if (isPlaceholder) {
        linkEl.setAttribute("aria-disabled", "true");
        linkEl.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }
    }

    if (qrEl) {
      if (flower.qrImageUrl) {
        qrEl.src = flower.qrImageUrl;
      } else if (url && !isPlaceholder) {
        qrEl.src =
          "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" +
          encodeURIComponent(url);
      }
    }

    if (noteEl && !isPlaceholder) {
      noteEl.hidden = true;
    }
  }

  /** Google Form view URL → embed URL */
  function toEmbedUrl(url) {
    if (url.includes("embed")) return url;
    return url.replace(/\/viewform.*/, "/viewform?embedded=true");
  }
})();
