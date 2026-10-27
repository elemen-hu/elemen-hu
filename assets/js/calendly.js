/*
 * Calendly popup, lusta betöltéssel: a widget scriptje csak az első kattintáskor töltődik be.
 * A gomb valódi link a Calendly-oldalra, így ha a script nem tölt be, a link új lapon nyílik meg.
 * A widget színeit a tokenekből vesszük, az előtöltött név/e-mail az űrlapból, az UTM az URL-ből jön.
 */
(function () {
  var config = (window.SITE_CONFIG && window.SITE_CONFIG.calendly) || {};
  if (!config.url || config.url === 'TODO') return;

  var WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
  var WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';
  var loading = null;

  function token(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace('#', '');
  }

  function pageUrl() {
    var url = new URL(config.url);
    url.searchParams.set('primary_color', token('--action'));
    url.searchParams.set('text_color', token('--text-primary'));
    url.searchParams.set('background_color', token('--bg-page'));
    return url.toString();
  }

  function utm() {
    var params = new URLSearchParams(window.location.search);
    var map = {
      utm_source: 'utmSource',
      utm_medium: 'utmMedium',
      utm_campaign: 'utmCampaign',
      utm_content: 'utmContent',
      utm_term: 'utmTerm'
    };
    var out = {};
    Object.keys(map).forEach(function (key) {
      if (params.get(key)) out[map[key]] = params.get(key);
    });
    return out;
  }

  function prefill() {
    var name = document.getElementById('f-name');
    var email = document.getElementById('f-email');
    var out = {};
    if (name && name.value.trim()) out.name = name.value.trim();
    if (email && email.value.trim() && email.validity.valid) out.email = email.value.trim();
    return out;
  }

  function loadWidget() {
    if (window.Calendly) return Promise.resolve();
    if (loading) return loading;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = WIDGET_CSS;
    document.head.appendChild(css);
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = WIDGET_JS;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return loading;
  }

  document.querySelectorAll('[data-calendly], [data-calendly-link]').forEach(function (a) {
    a.href = pageUrl();
  });
  document.querySelectorAll('[data-calendly-block]').forEach(function (el) {
    el.hidden = false;
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-calendly]');
    if (!btn) return;
    e.preventDefault();
    loadWidget()
      .then(function () {
        window.Calendly.initPopupWidget({ url: pageUrl(), prefill: prefill(), utm: utm() });
        if (window.elemenTrack) {
          window.elemenTrack('calendly_opened', { placement: btn.getAttribute('data-calendly-placement') || '' });
        }
      })
      .catch(function () {
        window.open(btn.href, '_blank', 'noopener');
      });
  });

  // Foglalás: a Calendly postMessage-eseménye
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://calendly.com') return;
    if (e.data && e.data.event === 'calendly.event_scheduled' && window.elemenTrack) {
      window.elemenTrack('calendly_booked', { lead_source: 'calendly' });
    }
  });
})();
