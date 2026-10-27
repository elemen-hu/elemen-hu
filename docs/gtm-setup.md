# GTM és GA4 beállítása

Az oldal csak a `dataLayer`-be ír eseményeket. Minden címke (GA4 is) a Google Tag Managerből fut. A GTM felületén a beállítást a tulajdonos végzi, vagy külön megbízás alapján valaki más.

## Hogyan működik a hozzájárulás

1. Minden oldal `<head>`-jében egy inline script a Consent Mode v2 négy jelzőjét `denied` értékre állítja (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`).
2. A GTM-et a `consent.js` csak akkor tölti be, amikor a látogató az „Elfogadom” gombra kattint, vagy korábban már elfogadta, és a döntése még nem járt le. Előtte a jelzőket `granted` értékre állítja.
3. Elutasításkor a GTM egyáltalán nem töltődik be, így semmilyen kérés nem megy a Google felé. Ez a Consent Mode „basic” változata.
4. A `<noscript>` GTM-iframe szándékosan hiányzik. JavaScript nélkül nincs hozzájárulás, ezért mérés sincs.
5. A döntés `localStorage`-ban (`elemen_consent`) tárolódik, 180 napig (`site.config.js` → `analytics.consentDays`). A láblécben a „Süti-beállítások” gomb újranyitja a sávot.

Az oldal betöltése óta keletkezett események (például `scroll_depth`) a `dataLayer`-ben várakoznak. Ha a látogató később elfogadja a mérést, a GTM betöltéskor ezeket is feldolgozza. Ezekben sincs személyes adat.

## Eseménylista

| Esemény | Mikor | Paraméterek |
|---|---|---|
| `cta_click` | Kattintás egy `data-cta-id` attribútumú elemre | `cta_id`, `cta_location` |
| `form_start` | Az űrlap első fókusza (oldalbetöltésenként egyszer) | `form_id` |
| `generate_lead` | Sikeres űrlapbeküldés | `form_id`, `lead_source` = `form` |
| `calendly_opened` | A Calendly popup megnyílik | `placement` |
| `calendly_booked` | A Calendly `calendly.event_scheduled` üzenete | `lead_source` = `calendly` |
| `language_switch` | Nyelvváltás a fejlécben (csak 2+ nyelv esetén) | `from`, `to` |
| `scroll_depth` | 25, 50, 75, 90%, mindegyik egyszer | `percent` |

Jelenlegi `cta_id` értékek: `header_contact`, `hero_primary`.

Név, e-mail vagy telefonszám soha nem kerül a `dataLayer`-be.

## A. Gyors út: konténer importálása

A [`gtm-container.json`](gtm-container.json) importálható konténer, a következő tartalommal:

- **Változók:** `GA4 – Measurement ID` (konstans, `G-XXXXXXXXXX` helyőrzővel) és nyolc Data Layer Variable (`DLV – cta_id`, `DLV – form_id` stb.).
- **Trigger:** `CE – Elemen események`, Custom Event, regex: `^(cta_click|form_start|generate_lead|calendly_opened|calendly_booked|language_switch|scroll_depth)$`.
- **Címkék:**
  - `GA4 – Google tag`, Initialization – All Pages triggerrel.
  - `GA4 – Elemen esemény`: az eseménynév a `{{Event}}`, a paraméterek a DLV-kből jönnek.

Lépések:

1. GTM → Admin → **Import Container** → válaszd ki a `docs/gtm-container.json` fájlt.
2. Workspace: **Existing** (vagy új), mód: **Merge** → **Rename conflicting tags, triggers, and variables**.
3. Változók → `GA4 – Measurement ID` → írd be a valódi GA4 mérési azonosítót (`G-…`).
4. **Preview** módban ellenőrizd (lásd lent), majd **Submit** → **Publish**.

> A JSON-t kézzel állítottam össze a GTM exportformátuma alapján, valódi konténerbe importálva még nem próbáltam ki. Ha az import hibát jelez, kövesd a B. pontot, abban ugyanez a beállítás szerepel kézzel.

## B. Kézi beállítás

1. **Változók → Beépített változók:** kapcsold be az `Event` változót.
2. **Változók → Új → Konstans:** a neve `GA4 – Measurement ID`, az értéke a GA4 mérési azonosító.
3. **Változók → Új → Data Layer Variable**, mindegyik 2-es verzióval: `cta_id`, `cta_location`, `form_id`, `lead_source`, `placement`, `from`, `to`, `percent`. Elnevezés: `DLV – <név>`.
4. **Triggerek → Új → Custom Event:**
   - Név: `CE – Elemen események`.
   - Event name: `^(cta_click|form_start|generate_lead|calendly_opened|calendly_booked|language_switch|scroll_depth)$`.
   - Kapcsold be a **Use regex matching** opciót.
5. **Címkék → Új → Google tag:**
   - Tag ID: `{{GA4 – Measurement ID}}`.
   - Trigger: Initialization – All Pages.
6. **Címkék → Új → Google Analytics: GA4 Event:**
   - Measurement ID: `{{GA4 – Measurement ID}}`.
   - Event Name: `{{Event}}`.
   - Event Parameters: mind a nyolc paraméter, értéknek a hozzá tartozó `{{DLV – …}}`.
   - Trigger: `CE – Elemen események`.
7. Mindkét címkénél: **Advanced Settings → Consent Settings → Require additional consent → `analytics_storage`**. A GTM amúgy is csak hozzájárulás után töltődik be, ez egy második biztosíték.

## GA4: kulcsesemények (konverziók)

GA4 → Admin → **Events** (vagy Key events): jelöld kulcseseménynek a `generate_lead` és a `calendly_booked` eseményt. Ezek csak az első beérkezés után jelennek meg a listában, ezért előbb tesztelj.

Ajánlott egyéni dimenziók (Admin → Custom definitions, Event scope): `cta_id`, `cta_location`, `form_id`, `lead_source`, `placement`, `percent`.

## Ellenőrzés

1. Írd be a GTM-ID-t a `config/site.config.js`-be (`analytics.gtmId`), és telepítsd az oldalt.
2. GTM **Preview** → add meg az oldal címét.
3. A Tag Assistantben a GTM addig nem jelenik meg, amíg el nem fogadod a sütiket. Ez a várt működés.
4. Fogadd el, majd ellenőrizd:
   - görgetés: 4 × `scroll_depth`;
   - kattintás a hero gombjára: `cta_click`;
   - kattintás az űrlapba: `form_start`;
   - beküldés: `generate_lead`;
   - Calendly: `calendly_opened`, majd egy tesztfoglalás után `calendly_booked`.
5. GA4 → **DebugView**: az események megérkeznek.
6. Elutasítás után (vagy a `localStorage` törlése után, az „Elutasítom” gombbal) a Network fülön nem lehet `googletagmanager.com` kérés.
