# elemen.hu

Kelemen Gyöngyvér coach leadgyűjtő oldala. Statikus HTML, CSS és vanilla JS, build-lépés és framework nélkül, GitHub Pages-en, saját domainnel.

- Vizuális forrás: Elemen design system v1 (navy, slate, sand és cream; Playfair Display és Open Sans).
- Hangnem és tartalom: a brand guide és a jelenlegi elemen.hu szövegei.
- Megbízás: [BRIEF.md](BRIEF.md).

## Futtatás helyben

```bash
python3 scripts/dev-server.py
```

Ez a `python3 -m http.server` gyorsítótár nélküli változata (`Cache-Control: no-store`), így a CSS- és JS-módosítások újratöltés után azonnal látszanak.

Ezután nyisd meg: http://localhost:8080. Az oldalak relatív útvonalakat használnak (`assets/...`, az aloldalakon `../assets/...`), így a github.io alatti `/elemen-hu/` almappában és a saját domain gyökerében is működnek. Kivétel a `404.html`: azt a GitHub Pages bármilyen mélységű hibás címen kiszolgálja, ezért abszolút, `/elemen-hu/` előtagú útvonalakat használ.

## Szerkezet

```
index.html               főoldal (egyoldalas landing)
adatkezeles/index.html   adatkezelési tájékoztató (helyőrző, noindex)
sutik/index.html         süti-tájékoztató (helyőrző, noindex)
404.html                 GitHub Pages hibaoldal
config/site.config.js    űrlap-, Calendly- és GTM-beállítások
assets/css/
  tokens.css             a design system összes tokenje: szín, betű, térköz, sarok, árnyék
  base.css               @font-face, alapstílusok, szekciók
  components.css         Button, Header, Wordmark, Portrait, ServiceCard, Testimonial,
                         GYIK, ContactForm, checkbox, consent banner, lábléc
  pages.css              hero, Rólam, jogi oldalak, 404 elrendezése
assets/js/
  analytics.js           dataLayer-események (cta_click, scroll_depth) és az elemenTrack()
  consent.js             Consent Mode v2, banner, GTM betöltése csak hozzájárulás után
  form.js                űrlap: validáció, beküldés, állapotok, form_start és generate_lead
  calendly.js            Calendly popup lusta betöltéssel, calendly_opened és calendly_booked
  i18n.js                nyelvválasztó a hreflang-linkekből
  main.js                mobilmenü
assets/fonts/            önállóan hostolt woff2 (latin és latin-ext)
assets/img/              portrék AVIF és JPEG formátumban, OG-kép, nap motívum
docs/gtm-setup.md        GTM- és GA4-beállítás lépésről lépésre
docs/gtm-container.json  importálható GTM-konténer
scripts/portrait-images.sh  portrék újragenerálása (ffmpeg)
scripts/dev-server.py    helyi szerver gyorsítótár nélkül
```

## Tartalom szerkesztése

A szöveg közvetlenül a HTML-ben van. Szekciók az `index.html`-ben, sorrendben:

1. Hero
2. `#kinek`
3. `#szolgaltatasok`
4. `#modszer`
5. `#amit-hozok`
6. `#keretek` (folyamatábra)
7. `#rolam`
8. `#velemenyek`
9. `#gyik`
10. `#kapcsolat` (lead blokk)

Szabályok:

- **Vélemény:** csak valódi, hozzájárulással közölt idézet. A név formája „K. Szilvi” (pont, utána szóköz).
- **Új GYIK-kérdés:** másold le egy meglévő `<details class="faq__item">` blokkot.
- **Új CTA gomb:** adj neki `data-cta-id` és `data-cta-location` attribútumot, így a `cta_click` esemény automatikusan mér.
- **Szín vagy méret:** csak a `tokens.css`-ben vegyél fel újat. Komponens nyers hex vagy px értéket nem kap.
- **Új kép:** AVIF és JPEG, több szélességben, `width` és `height` megadva, a hajtás alatt `loading="lazy"`. Új portréhoz: `scripts/portrait-images.sh`.

A fejléc és a lábléc a három aloldalon (`adatkezeles/`, `sutik/`, `404.html`) a főoldal másolata. Ha a menü vagy a lábléc változik, mind a négy fájlban frissíteni kell.

## Konfiguráció

Minden környezetfüggő érték a `config/site.config.js`-ben van. Ide csak publikus kulcs kerülhet, mert a böngésző látja.

| Kulcs | Mi ez | Ha `TODO` |
|---|---|---|
| `form.provider` | `web3forms` vagy `formspree` | |
| `form.endpoint` | Web3Forms: `https://api.web3forms.com/submit`, Formspree: `https://formspree.io/f/<id>` | |
| `form.accessKey` | Web3Forms access key (publikus) | az űrlap hibaüzenetet ad, és megadja az e-mail-címet |
| `calendly.url` | a Calendly esemény teljes URL-je | a „Foglalj időpontot” blokk nem jelenik meg |
| `analytics.gtmId` | `GTM-XXXXXXX` | a GTM nem töltődik be, de a dataLayer-események működnek |
| `analytics.consentDays` | a hozzájárulás érvényessége napokban | |

Az űrlap honeypot mezővel (`website`) védekezik a spam ellen. A Web3Forms saját szerveroldali szűrést is végez. Ha mégis sok a spam, a Cloudflare Turnstile a következő lépés, látható CAPTCHA nélkül.

A Calendly a widget színeit futás közben a tokenekből kapja (`--action`, `--text-primary`, `--bg-page`). Az űrlapba már beírt nevet és e-mailt előtölti, az UTM-paramétereket pedig az oldal URL-jéből adja át.

## Deploy (GitHub Pages)

Nincs build-lépés, ezért az oldal közvetlenül a `main` branch gyökeréből megy ki, GitHub Actions nem kell. A `.nojekyll` kikapcsolja a Jekyll-feldolgozást. Minden push a `main`-re pár percen belül élesedik.

**Jelenleg:** https://elemen-hu.github.io/elemen-hu/ (publikus repó, Pages: `main` / `(root)`, saját domain nélkül). A repó minden fájlja (README, BRIEF.md, docs/) is elérhető ezen a címen.

### Átállás az elemen.hu-ra

Amikor az új oldal leváltja a régit:

1. Hozz létre a repó gyökerében egy `CNAME` fájlt, egyetlen sorral: `elemen.hu`. (Vagy Settings → Pages → Custom domain: `elemen.hu`, ez létrehozza.)
2. A `404.html`-ben cseréld az összes `/elemen-hu/` előtagot `/`-re.
3. Állítsd be a lenti DNS-rekordokat, és a DNS átállása után kapcsold be az **Enforce HTTPS** opciót.
4. Ajánlott: **Settings → Pages → Verified domains**, hogy más ne foglalhassa le a domaint.
5. Cseréld vissza a teljes URL-eket: minden `https://elemen-hu.github.io/elemen-hu/` legyen `https://elemen.hu/`, a `config/site.config.js` `siteUrl` értéke pedig `https://elemen.hu`. Érintett fájlok: `index.html`, `adatkezeles/index.html`, `sutik/index.html` (canonical, hreflang, `og:url`, `og:image`, JSON-LD), `sitemap.xml`, `robots.txt`. Egy paranccsal:

   ```bash
   sed -i '' 's#https://elemen-hu.github.io/elemen-hu/#https://elemen.hu/#g' index.html adatkezeles/index.html sutik/index.html sitemap.xml robots.txt
   ```

   Ezek most azért mutatnak a github.io-s címre, mert a Messenger és a Facebook az `og:url` címre visz, és az `og:image` képet mutatja. Amíg az elemen.hu a régi oldal, ezeknek a github.io-s címre kell mutatniuk.
6. A Facebook Sharing Debuggerben (developers.facebook.com/tools/debug) kérd le újra az elemen.hu-t (**Scrape Again**), hogy a Messenger az új előnézetet mutassa.

### DNS (a domain szolgáltatójánál, nem én állítom be)

Apex domain (`elemen.hu`):

| Típus | Név | Érték |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | elemen-hu.github.io. |

A régi WordPress-tárhelyre mutató A- és CNAME-rekordokat törölni kell. Az MX-rekordokhoz (levelezés) nem kell hozzányúlni. A régi URL-ek (`/life-coaching/`, `/uzleti-coaching/`, `/kapcsolat/`, `/blog/`) az új oldalon 404-et adnak. Ha számít a keresőbeli helyezésük, ezekre átirányító oldal kell (lásd a nyitott pontokat).

## Mérés és hozzájárulás

Részletesen: [docs/gtm-setup.md](docs/gtm-setup.md). Röviden:

- A Consent Mode v2 alapból mindent tilt.
- A GTM csak az „Elfogadom” után töltődik be. Elutasításkor egyetlen Google-kérés sem megy ki.
- A dataLayer-be személyes adat nem kerül.
- A `<noscript>` GTM-iframe szándékosan hiányzik, mert JavaScript nélkül nincs hozzájárulás.

## Többnyelvűség

Most csak magyar nyelv van. Ha jön az angol:

1. `en/index.html` a magyar oldal fordított másolataként, `lang="en"` attribútummal.
2. Mindkét oldal `<head>`-jébe kerüljön be a másik nyelv `hreflang`-linkje (a helye `TODO` megjegyzéssel jelölve az `index.html`-ben).
3. A fejlécben a nyelvválasztó automatikusan megjelenik, és az adott oldal párjára visz.
4. A `sitemap.xml`-be kerüljön be az `en` alternatíva.

Ha két vagy több további nyelv lesz, érdemes Eleventyre és fordítási JSON-ra váltani (lásd a brief 3. pontját).

## Ellenőrzés

A legutóbbi helyi ellenőrzés (2026. október 27.) eredménye:

- **Reszponzív nézet:** 375, 768 és 1280 px szélességen nincs vízszintes görgetés.
- **Lighthouse, mobil, helyi `http.server`:**
  - teljesítmény 97;
  - hozzáférhetőség 100;
  - bevált gyakorlatok 100;
  - SEO 100.

  A helyi szerver nem tömörít és nem cache-el, élesben a teljesítmény jobb lehet.
- **HTML-validáció:** `html-validate` (document preset) hibátlan. Az SRI-szabályt kikapcsoltam, mert csak saját domainről töltött fájlokra vonatkozott volna.

## Döntések a design system és a brief között

- **Consent banner:** az „Elutasítom” és az „Elfogadom” egyformán másodlagos gomb. A brief egyenlő hangsúlyt kér, a design system szekciónként egy elsődleges gombot enged.
- **Lead blokk:** az űrlap „Küldés” gombja az elsődleges. A Calendly gomb másodlagos, mert a két út egy szekcióban van.
- **Záró kérdés:** a design system CtaBand-komponensét nem használtam külön sávként, mert a lead blokk az utolsó tartalmi szekció. Ehelyett a CtaBand kérdése („Készen állsz…?”) lett a lead blokk címe.
- **Display cím mobilon:** a design system nem adja meg, 44 px-re állítottam.
- **Betűk:** a design system Google Fonts-linket ír, a brief saját hostolást. Önállóan hostolt woff2 lett (OFL-licenc), latin-ext vágással az „ő” és „ű” miatt.
- **Új elemek:** a GYIK, a checkbox, a consent banner és a nyelvválasztó nem szerepel a design systemben. A meglévő tokenekből és szabályokból építettem őket, új szín nélkül.
- **Világos homok háttér:** a homok szekciók háttere `#EADBC8` (`--sand-light`). Ez a design system négy színén kívüli, megrendelői kérésre (2026. október 27.) került be. A navy sáv (vélemények, lábléc) nem változott.
- **Kisebb sarkok:** a gombok, a mezők és az állapotüzenet 4 px-es, a kapcsolati kártyák 8 px-es sarkot kaptak a design system 8 px-e és 20 px-e helyett, megrendelői kérésre.
- **Vélemények:** az idézetek Open Sans normál vastagságúak, mert a Playfairből csak a 600-as és a 700-as vastagság van feltöltve, és a félkövér idézet túl nehéz volt.
- **Letiltott gomb:** küldés közben sincs letiltott gomb (design system 6.1). A dupla küldést egy belső jelző akadályozza meg.

## Nyitott pontok (TODO)

A HTML-ben `<!-- TODO -->` megjegyzések jelölik a helyüket.

- [ ] Űrlap-szolgáltató és access key / endpoint (`site.config.js`)
- [ ] Calendly esemény URL, és mi a foglalható esemény (első beszélgetés? díjas alkalom?)
- [ ] GTM konténer-ID, GA4 mérési azonosító
- [ ] Impresszum: név vagy cégnév, székhely, adószám (lábléc, `adatkezeles/#impresszum`)
- [ ] Jogi szövegek: adatkezelési és süti-tájékoztató. Ezek után a `noindex` levehető, és az oldalak bekerülhetnek a sitemapbe.
- [ ] A GDPR-checkbox szövegének jogászi ellenőrzése
- [ ] GYIK: online vagy személyes alkalmak, helyszín, ár vagy ártájékoztatás
- [ ] Rólam: végzettségek, további minősítések (pl. ICF/EMCC)
- [ ] Végleges logó (a szómárka javaslat, a design system 6.8 szerint Gyöngyvér dönt)
- [ ] Elementa Novanta: külön brand-e, kell-e a Facebook-link
- [ ] További nyelvek
- [ ] Átirányítás a régi WordPress-URL-ekről, ha számít a keresőbeli helyezésük
- [ ] A blog sorsa: a régi cikkek most nem kerülnek át
