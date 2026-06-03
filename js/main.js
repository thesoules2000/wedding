/**
 * Основная логика сайта: обратный отсчёт, RSVP.
 */

(function () {
  "use strict";

  const config = window.WEDDING_CONFIG || {};

  initHero(config.hero);
  initMap(config.map);
  initCountdown(config.weddingDate);
  initRsvp(config.googleFormEmbedUrl, config.googleFormViewUrl);
  initFlowerSubscription(config.flowerSubscription);
  initTelegramChat(config.telegramChat);
  initCoordinator(config.coordinator);

  /** Виджет и ссылка Яндекс.Карт с двумя метками */
  function initMap(map) {
    const embed = document.getElementById("map-embed");
    const link = document.getElementById("map-open");
    if (!embed || !map?.points?.length) return;

    const zoom = map.zoom ?? 16;
    const center = map.center ?? {
      lon:
        map.points.reduce((sum, p) => sum + p.lon, 0) / map.points.length,
      lat:
        map.points.reduce((sum, p) => sum + p.lat, 0) / map.points.length,
    };
    const ll = `${center.lon},${center.lat}`;
    const pt = map.points
      .map((p) => `${p.lon},${p.lat},${p.style || "pm2rdm"}`)
      .join("~");
    const query = `ll=${ll}&z=${zoom}&pt=${pt}&lang=ru_RU`;

    embed.src = `https://yandex.ru/map-widget/v1/?${query}`;
    if (link) {
      link.href = `https://yandex.by/maps/?${query}`;
    }
  }

  /** Скетч и подпись на главном экране */
  function initHero(hero) {
    const img = document.getElementById("hero-illustration");
    if (!img || !hero) return;
    if (hero.illustrationUrl) img.src = hero.illustrationUrl;
    if (hero.illustrationAlt) img.alt = hero.illustrationAlt;
  }

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

  /** Контакты координатора в FAQ */
  function initCoordinator(coordinator) {
    const root = document.getElementById("coordinator-contact");
    if (!root || !coordinator) return;

    const name = (coordinator.name || "").trim();
    const phone = (coordinator.phone || "").trim();
    const telegramUrl = (coordinator.telegramUrl || "").trim();
    const telegramLabel = (coordinator.telegramLabel || "").trim();

    const parts = [];

    if (name) {
      parts.push(document.createTextNode(name));
    }

    if (phone) {
      if (parts.length) parts.push(document.createTextNode(" · "));
      const phoneLink = document.createElement("a");
      phoneLink.href = "tel:" + phone.replace(/\s/g, "");
      phoneLink.textContent = phone;
      parts.push(phoneLink);
    }

    if (telegramUrl) {
      if (parts.length) parts.push(document.createTextNode(" · "));
      const tgLink = document.createElement("a");
      tgLink.href = telegramUrl;
      tgLink.target = "_blank";
      tgLink.rel = "noopener noreferrer";
      tgLink.textContent = telegramLabel || "Telegram";
      parts.push(tgLink);
    }

    if (!parts.length) {
      root.textContent = "Контакты координатора появятся здесь чуть позже.";
      return;
    }

    root.replaceChildren(...parts);
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
