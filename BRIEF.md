# Brief: elemen.hu új weboldal (leadgyűjtő coach-oldal)

> Ez a dokumentum a Claude Code számára készült. Olvasd végig, mielőtt kódot írsz. Ahol `TODO` szerepel, az nyitott adat: ne találj ki értéket, hanem kérdezz rá, vagy használj egyértelmű placeholdert egy központi konfigurációs fájlban.

## 1. Kontextus és cél

- **Ügyfél:** Kelemen Gyöngyvér, coach (elemen.hu).
- **Az oldal egyetlen fő célja:** leadek gyűjtése. A látogató vagy **kitölt egy érdeklődő űrlapot**, vagy **időpontot foglal Calendlyn keresztül**.
- **Kontextus:** teljesen új arculat és új weboldal készül. A tartalom (szövegek) a jelenlegi elemen.hu oldal szövegeire épül, a vizuális megjelenés viszont az új brand guide és design system szerint készül, nem a jelenlegi betűtípusok és elrendezés szerint.
- **Elsődleges nyelv:** magyar. További nyelvek: `TODO` (pl. angol). Az architektúra legyen többnyelvűségre előkészítve akkor is, ha elsőre csak magyar készül.

## 2. Bemenetek (amit kapsz)

1. **Brand guide** és **design system** (elemen.hu). Ezek a vizuális megjelenés egyetlen forrásai.
2. A jelenlegi elemen.hu szöveges tartalma (kapott szövegek vagy a futó oldal).
3. Ez a brief.

### Szabályok a design systemhez
- Minden szín, betűtípus, térköz, lekerekítés, árnyék **CSS custom property (token)** legyen egy `tokens.css` fájlban. Komponensek csak tokeneket használnak, nyers hex/px értékeket nem.
- A paletta szándékosan **minimális** (kevés szín). A design system a jelenlegi oldal színeire épül, egységes rendszerré rendezve. Ne adj hozzá új színeket a design systemen kívül. Ha hiányzik egy árnyalat, jelezd, ne találj ki.
- Ha a brand guide és a design system ellentmond egymásnak, állj meg, és kérdezz.
- Nem szabad a régi oldal betűtípusait vagy elrendezését átvenni, hacsak a design system nem írja elő.

## 3. Technikai keretek

- **Statikus oldal**, framework nélkül: tiszta HTML, CSS, minimális vanilla JS.
- **Kivétel:** ha 2 vagy több nyelv készül a magyaron kívül, használhatsz **Eleventy (11ty)**-t fordítási JSON-nal, hogy ne duplikálódjon a tartalom. Ezt a döntést indokold röviden, mielőtt belevágsz.
- **Hosting:** GitHub Pages, saját domainnel (`elemen.hu`). Készíts `CNAME` fájlt és GitHub Actions deploy workflow-t (ha build-lépés van), különben közvetlenül a branch-ből szolgálható ki. A DNS-beállítást dokumentáld (A/AAAA vagy CNAME rekordok), de a DNS-t nem te állítod.
- **Böngészőtámogatás:** a mai evergreen böngészők. Mobile-first.
- **Nincs backend.** Minden dinamikus funkció külső szolgáltatáson fut (űrlap, Calendly, mérés).

### Javasolt repo-szerkezet
```
/
├── index.html              # HU főoldal
├── en/index.html           # további nyelv (ha lesz)
├── adatkezeles/index.html  # adatkezelési tájékoztató
├── sutik/index.html        # süti-tájékoztató (ha szükséges)
├── 404.html
├── assets/
│   ├── css/ tokens.css, base.css, components.css, pages.css
│   ├── js/  main.js, consent.js, analytics.js, form.js, i18n.js
│   ├── img/ (optimalizált, WebP/AVIF + fallback)
│   └── fonts/ (önállóan hostolt, woff2)
├── config/site.config.js   # form endpoint, Calendly URL, GTM ID, stb.
├── sitemap.xml, robots.txt, CNAME
├── BRIEF.md
└── README.md
```

## 4. Oldalstruktúra és szekciók

Egyoldalas (landing jellegű) főoldal, fókuszban a konverzióval. A szekciók sorrendje és pontos tartalma a meglévő elemen.hu szövegeiből és a design system komponenseiből adódik. Kiindulási váz:

1. **Fejléc:** logó, horgony-navigáció, nyelvválasztó, elsődleges CTA gomb.
2. **Hero:** ígéret / pozicionálás, rövid alszöveg, elsődleges CTA (időpontfoglalás vagy űrlap-horgony).
3. **Kinek szól / milyen problémára ad választ.**
4. **A módszer / hogyan zajlik a közös munka.**
5. **Rólam (Gyöngyvér):** bemutatkozás, fotó.
6. **Referenciák / vélemények:** *csak valódi, a coach által megadott vélemények kerülhetnek ki.* Ha nincs, a szekció maradjon ki, ne készíts kitalált idézeteket.
7. **GYIK.**
8. **Lead blokk:** űrlap és Calendly egymás mellett vagy egymás után, világosan két úton (lásd 5. pont).
9. **Lábléc:** elérhetőség, adatkezelés, süti-beállítások újranyitása.

### Tartalmi szabályok
- A meglévő szövegeket használd és finomítsd, de **ne találj ki** tényállításokat, eredményeket, számokat, végzettségeket vagy véleményeket.
- Hiányzó tartalomnál jelöld `TODO` megjegyzéssel a HTML-ben és a README nyitott listájában.
- Hangnem: a brand guide szerint.

## 5. Lead-folyamat

### 5.1 Űrlap
- Mezők (minimum): **név**, **e-mail**, **rövid üzenet** (opcionális: telefon). Minél kevesebb mező, annál jobb a konverzió.
- **GDPR hozzájárulás checkbox** kötelező, link az adatkezelési tájékoztatóra. Előre kipipálni tilos.
- **Spam-védelem:** honeypot mező, és/vagy szolgáltatói védelem (pl. Turnstile). Látható CAPTCHA csak végső esetben.
- **Beküldés:** külső szolgáltatás. Alapértelmezés: **Web3Forms vagy Formspree** (e-mail értesítés a coachnak). Ha a coach e-mail-listát/automatát szeretne, **MailerLite vagy Brevo** űrlap/API. `TODO`: melyik szolgáltatás, API-kulcs/endpoint a `site.config.js`-ben. (Publikus kulcs mehet a kliensoldalra, titkos kulcs soha nem kerülhet a repóba.)
- **Állapotok:** validáció (HTML + JS), betöltés, siker, hiba. Siker után ne oldalújratöltés legyen, hanem érthető visszajelzés a helyszínen, és adatréteg-esemény (lásd 7. pont).
- Hozzáférhető hibaüzenetek (`aria-live`, mezőhöz kötött üzenetek).

### 5.2 Calendly
- Calendly esemény URL a konfigban: `TODO`.
- Megoldás: **popup widget** vagy **inline beágyazás** a design systemhez illeszkedően. A Calendly scriptet csak akkor töltsd be, amikor szükséges (lusta betöltés), hogy ne rontsa a sebességet.
- Ha lehetséges, **előtöltött név/e-mail** és **UTM paraméterek** átadása.
- Figyeld a Calendly `postMessage` eseményeit: a `calendly.event_scheduled` esemény váltson ki mérési eseményt (7. pont).
- Fallback: ha a widget nem tölt be, látható sima link a Calendly oldalra.

## 6. Többnyelvűség

- Magyar az alapértelmezett nyelv, a gyökéren (`/`). További nyelvek alkönyvtárban (`/en/`).
- **Nyelvválasztó** a fejlécben: mindig az **adott oldal megfelelő nyelvi párjára** visz, nem a főoldalra.
- Minden oldalon: `<html lang="...">`, `hreflang` alternatívák (és `x-default`), nyelvenként külön `<title>`, meta description, Open Graph adatok, canonical.
- **Nincs automatikus átirányítás** böngészőnyelv alapján. Legfeljebb diszkrét, lezárható ajánlósáv.
- Nyelvválasztás megjegyzése `localStorage`-ban csak kényelmi célra, átirányítás nélkül.
- A szövegek ne legyenek a HTML-be keverve duplikálva: build nélküli megoldásnál rendezett, nyelvenként külön HTML-fájlok, Eleventy esetén fordítási JSON.
- Nyelvek: `TODO`.

## 7. Mérés: GTM, GA4, hozzájárulás

### 7.1 Alapok
- **Google Tag Manager** kódrészlet a `<head>`-ben és a `<body>` elején. Konténer-ID: `TODO` (a `site.config.js`-ből jöjjön).
- A GA4 és minden más címke **GTM-ből** fusson, nem hardkódolva az oldalban.
- Egységes `dataLayer` események, snake_case nevekkel.

### 7.2 Eseménylista
| Esemény | Mikor | Paraméterek |
|---|---|---|
| `cta_click` | elsődleges CTA-kattintás | `cta_id`, `cta_location` |
| `form_start` | az űrlap első mezőjének fókusza | `form_id` |
| `generate_lead` | sikeres űrlapbeküldés | `form_id`, `lead_source` = `form` |
| `calendly_opened` | Calendly widget megnyitása | `placement` |
| `calendly_booked` | `calendly.event_scheduled` | `lead_source` = `calendly` |
| `language_switch` | nyelvváltás | `from`, `to` |
| `scroll_depth` | 25/50/75/90% | `percent` |

**A `dataLayer`-be személyes adat (név, e-mail, telefon) nem kerülhet.**

### 7.3 Hozzájárulás (kötelező EU-ban)
- Saját, egyszerű **cookie/consent banner** (vagy bevált CMP), **Google Consent Mode v2** szerint: alapértelmezésben minden `denied` (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`), és csak a hozzájárulás után állítódik `granted`-re.
- A banner a design systemhez illeszkedik, hozzáférhető (billentyűzet, fókusz), a „Elutasítom" gomb ugyanolyan hangsúlyos, mint az „Elfogadom".
- A lábléc tartalmaz „Süti-beállítások" linket az újranyitáshoz.
- A hozzájárulás-állapot kliensoldalon tárolódik, lejárattal.

### 7.4 GTM-konténer
A GTM felületén beállítandó elemek (eseményindítók, GA4 konfiguráció, események, konverziók) a repóban **dokumentálva** legyenek a `docs/gtm-setup.md` fájlban lépésről lépésre, és ha lehetséges, importálható **konténer-JSON** is készüljön. A felületi beállítást nem te végzed, hanem a tulajdonos vagy külön megbízás alapján.

## 8. SEO, teljesítmény, hozzáférhetőség

- Szemantikus HTML5, egyetlen `<h1>` oldalanként, logikus címsorhierarchia.
- Meta title/description, Open Graph és Twitter kártya, favicon-készlet, `sitemap.xml`, `robots.txt`, canonical.
- **Schema.org** strukturált adat (`Person`/`ProfessionalService` és a kapcsolódó adatok), csak valós adatokkal.
- Képek: reszponzív `srcset`, WebP/AVIF, `width`/`height` megadva, `loading="lazy"` a hajtás alatt, hero kép prioritással.
- Betűtípusok: önállóan hostolt woff2, `font-display: swap`, csak a szükséges vágások.
- **Cél:** Lighthouse mobilon legalább 90 teljesítményben, 95+ hozzáférhetőségben, SEO-ban és bevált gyakorlatokban. CLS minimális.
- **Hozzáférhetőség (WCAG 2.2 AA):** kontraszt, látható fókusz, billentyűzetes kezelhetőség, `alt` szövegek, `prefers-reduced-motion` tiszteletben tartása, megfelelő `label`-ek.
- Külső scriptek (GTM, Calendly) ne blokkolják a megjelenítést.

## 9. Jogi oldalak

- **Adatkezelési tájékoztató** és (szükség esetén) süti-tájékoztató oldal. A jogi szöveg tartalmát a tulajdonos/jogász adja. Te a struktúrát és a helyőrző szöveget készíted el, egyértelmű `TODO` jelöléssel, és **nem állítod, hogy jogilag megfelelő**.
- Impresszum/elérhetőségi adatok: `TODO` (cégnév/név, székhely, e-mail, telefon).

## 10. Munkamód

1. **Először terv:** olvasd el a brand guide-ot és a design systemet, és foglald össze röviden, hogyan fordítod tokenekre és komponensekre. Jelezd az ellentmondásokat és hiányokat.
2. **Iterációk, kisebb commitokkal** (értelmes commit-üzenetek), például: tokenek és alapok → komponensek → főoldal → űrlap → Calendly → többnyelvűség → mérés és consent → SEO és teljesítmény → dokumentáció.
3. Minden iteráció végén helyi ellenőrzés (reszponzív nézetek: 375, 768, 1280 px; Lighthouse; HTML-validáció).
4. **Titkokat nem commitolsz.** Minden környezetfüggő érték a `site.config.js`-ben, és a README-ben dokumentálva.
5. Ha valami hiányzik vagy kétértelmű, **kérdezz**, ne tippelj.

## 11. Elfogadási kritériumok (Definition of Done)

- [ ] Az oldal minden elemében a design system tokenjei érvényesülnek, nincs „elszabadult" szín vagy betűtípus.
- [ ] Mobilon és asztali gépen hibátlan, nincs vízszintes görgetés.
- [ ] Az űrlap működik (siker/hiba/validáció), a GDPR-checkbox kötelező, a spam-védelem aktív.
- [ ] A Calendly működik, és a foglalás mérési eseményt vált ki.
- [ ] A nyelvválasztó a megfelelő oldalpárra visz, a `hreflang` és a nyelvenkénti meta rendben van.
- [ ] A GTM betölt, az események a `dataLayer`-ben megjelennek, és **hozzájárulás nélkül nem indul mérés**.
- [ ] Lighthouse-célok teljesülnek (8. pont).
- [ ] A GitHub Pages deploy működik, a `CNAME` és a DNS-leírás megvan.
- [ ] A README tartalmazza: futtatás, tartalom szerkesztése, konfiguráció, deploy, nyitott `TODO`-k.

## 12. Nyitott adatok (TODO, a tulajdonostól)

- [ ] GitHub repo neve (`owner/repo`) és a deploy módja
- [ ] További nyelvek a magyaron kívül
- [ ] Űrlap-szolgáltató és endpoint/kulcs (Web3Forms / Formspree / MailerLite / Brevo)
- [ ] Calendly esemény URL
- [ ] GTM konténer-ID, GA4 mérési azonosító
- [ ] Elérhetőségi és impresszum-adatok
- [ ] Fotók, logó végleges fájlok, valós referenciák/vélemények
- [ ] Jogi szövegek (adatkezelés, süti)
