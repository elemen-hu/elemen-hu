/*
 * Nyelvválasztó. A <head> hreflang-linkjeiből épül, így mindig az adott oldal nyelvi párjára visz,
 * nem a főoldalra. Ha az oldalnak nincs más nyelvű párja, a választó rejtve marad.
 * A választás localStorage-ba kerül, de átirányítás nincs (brief 6. pont).
 */
(function () {
  var list = document.querySelector('[data-lang-switch]');
  if (!list) return;

  var current = document.documentElement.lang;
  var links = Array.prototype.filter.call(
    document.querySelectorAll('link[rel="alternate"][hreflang]'),
    function (l) { return l.hreflang !== 'x-default'; }
  );
  if (links.length < 2) return;

  links.forEach(function (l) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = new URL(l.href).pathname;
    a.hreflang = l.hreflang;
    a.lang = l.hreflang;
    a.textContent = l.hreflang.toUpperCase();
    if (l.hreflang === current) a.setAttribute('aria-current', 'true');
    li.appendChild(a);
    list.appendChild(li);
  });
  list.hidden = false;

  list.addEventListener('click', function (e) {
    var a = e.target.closest('a[hreflang]');
    if (!a || a.hreflang === current) return;
    try {
      window.localStorage.setItem('elemen_lang', a.hreflang);
    } catch (err) {
      // nem kritikus
    }
    if (window.elemenTrack) window.elemenTrack('language_switch', { from: current, to: a.hreflang });
  });
})();
