/*
 * Környezetfüggő beállítások. Minden külső szolgáltatás innen kapja az azonosítóját.
 * Ide CSAK publikus kulcs kerülhet (a böngésző látja). Titkos kulcsot soha ne írj ide.
 * A "TODO" értékű elem kikapcsolja a hozzá tartozó funkciót, az oldal ettől még működik.
 */
window.SITE_CONFIG = {
  siteUrl: 'https://elemen.hu',

  form: {
    // 'web3forms' vagy 'formspree'
    provider: 'web3forms',
    // Web3Forms: https://api.web3forms.com/submit
    // Formspree: https://formspree.io/f/<űrlap-azonosító>
    endpoint: 'https://api.web3forms.com/submit',
    // Web3Forms access key (publikus). Formspree esetén üresen hagyható.
    accessKey: 'TODO',
    // Az értesítő e-mail tárgya
    subject: 'Új érdeklődés az elemen.hu oldalról'
  },

  calendly: {
    // Pl. https://calendly.com/<felhasználó>/<esemény>
    url: 'TODO'
  },

  analytics: {
    // Google Tag Manager konténer, pl. GTM-XXXXXXX. A GA4 a GTM-ben van beállítva.
    gtmId: 'TODO',
    // A hozzájárulás érvényessége napokban
    consentDays: 180
  }
};
