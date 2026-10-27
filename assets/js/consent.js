/*
 * Hozzájárulás-kezelés, Google Consent Mode v2 szerint.
 * Az alapértelmezett 'denied' állapotot a <head> inline scriptje állítja be.
 * A GTM-et csak 'granted' döntés után töltjük be, ezért elutasításkor semmilyen mérési kérés nem megy ki.
 * A döntés localStorage-ban tárolódik, lejárattal (site.config.js: analytics.consentDays).
 */
(function () {
  var STORAGE_KEY = 'elemen_consent';
  var config = (window.SITE_CONFIG && window.SITE_CONFIG.analytics) || {};
  var banner = document.getElementById('consent');
  var gtmLoaded = false;

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || Date.now() > data.expires) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data.value;
    } catch (e) {
      return null;
    }
  }

  function saveChoice(value) {
    var days = config.consentDays || 180;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        value: value,
        expires: Date.now() + days * 24 * 60 * 60 * 1000
      }));
    } catch (e) {
      // Privát módban a tárolás hibázhat: a döntés ilyenkor csak erre az oldalbetöltésre él.
    }
  }

  function applyChoice(value) {
    var state = value === 'granted' ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state
    });
    if (state === 'granted') loadGtm();
  }

  function loadGtm() {
    var id = config.gtmId;
    if (gtmLoaded || !id || id === 'TODO') return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  function showBanner(moveFocus) {
    if (!banner) return;
    banner.hidden = false;
    // Csak újranyitáskor visszük oda a fókuszt, oldalbetöltéskor nem vesszük el a látogatótól.
    if (moveFocus) {
      var first = banner.querySelector('button');
      if (first) first.focus();
    }
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  if (banner) {
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      var value = btn.getAttribute('data-consent');
      saveChoice(value);
      applyChoice(value);
      hideBanner();
    });

    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        // Az Esc nem dönt helyetted: a sáv a következő oldalbetöltéskor újra megjelenik.
        hideBanner();
      }
    });
  }

  // Lábléc: „Süti-beállítások” újranyitás
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-open]')) showBanner(true);
  });

  var stored = readChoice();
  if (stored) {
    applyChoice(stored);
  } else {
    showBanner(false);
  }
})();
