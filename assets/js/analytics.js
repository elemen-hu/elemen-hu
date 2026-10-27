/*
 * dataLayer-események (brief 7.2). Személyes adat (név, e-mail, telefon) soha nem kerül ide.
 * Az események a hozzájárulástól függetlenül a dataLayer-be kerülnek, de a GTM csak
 * hozzájárulás után töltődik be (consent.js), így mérés előtte nem indul.
 */
(function () {
  window.dataLayer = window.dataLayer || [];

  function track(event, params) {
    window.dataLayer.push(Object.assign({ event: event }, params || {}));
  }

  window.elemenTrack = track;

  // cta_click: minden data-cta-id attribútumú elem
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta-id]');
    if (!el) return;
    track('cta_click', {
      cta_id: el.getAttribute('data-cta-id'),
      cta_location: el.getAttribute('data-cta-location') || ''
    });
  });

  // scroll_depth: 25/50/75/90%, mindegyik egyszer
  var marks = [25, 50, 75, 90];
  var ticking = false;

  function checkScroll() {
    ticking = false;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var percent = (window.scrollY / scrollable) * 100;
    while (marks.length && percent >= marks[0]) {
      track('scroll_depth', { percent: marks.shift() });
    }
    if (!marks.length) window.removeEventListener('scroll', onScroll);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(checkScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
