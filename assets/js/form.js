/*
 * Kapcsolati űrlap: validáció, beküldés külső szolgáltatónak (Web3Forms vagy Formspree),
 * betöltés-, siker- és hibaállapot oldalújratöltés nélkül.
 */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var config = (window.SITE_CONFIG && window.SITE_CONFIG.form) || {};
  var formId = form.getAttribute('data-form-id') || 'contact';
  var status = document.getElementById('form-status');
  var statusText = status.querySelector('p');
  var statusIcon = status.querySelector('use');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit.textContent;
  var started = false;
  var sending = false;

  var MESSAGES = {
    required: 'Kötelező mező.',
    email: 'Ellenőrizd az e-mail-címet, például: nev@pelda.hu.',
    consent: 'A küldéshez fogadd el az adatkezelési tájékoztatót.',
    success: 'Köszönöm, megkaptam az üzeneted. Igyekszem minél hamarabb válaszolni.',
    error: 'Az üzenetet most nem sikerült elküldeni. Próbáld újra, vagy írj közvetlenül: elemencoach@gmail.com.',
    sending: 'Küldés…'
  };

  // form_start: az első mező első fókusza
  form.addEventListener('focusin', function () {
    if (started) return;
    started = true;
    if (window.elemenTrack) window.elemenTrack('form_start', { form_id: formId });
  });

  function errorFor(field) {
    if (field.type === 'checkbox') return field.checked ? '' : MESSAGES.consent;
    var value = field.value.trim();
    if (field.required && !value) return MESSAGES.required;
    if (field.type === 'email' && value && !field.validity.valid) return MESSAGES.email;
    return '';
  }

  function showError(field, message) {
    var box = document.getElementById(field.id + '-error');
    if (box) box.textContent = message;
    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
  }

  function validate() {
    var firstInvalid = null;
    form.querySelectorAll('input[required], textarea[required], input[type="email"]').forEach(function (field) {
      var message = errorFor(field);
      showError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    return firstInvalid;
  }

  // Hibás mező javítás közben azonnal visszajelez.
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') showError(e.target, errorFor(e.target));
  });
  form.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') showError(e.target, errorFor(e.target));
  });

  function setStatus(kind, message) {
    status.hidden = false;
    statusIcon.setAttribute('href', kind === 'success' ? '#i-check' : '#i-alert');
    statusText.textContent = message;
    status.focus();
  }

  // Letiltott gomb a design systemben nincs: küldés közben csak a felirat és az aria-busy változik.
  function setBusy(busy) {
    sending = busy;
    submit.setAttribute('aria-busy', String(busy));
    submit.textContent = busy ? MESSAGES.sending : submitLabel;
  }

  function isConfigured() {
    if (!config.endpoint) return false;
    if (config.provider === 'web3forms') return !!config.accessKey && config.accessKey !== 'TODO';
    return config.endpoint.indexOf('TODO') === -1;
  }

  function payload(data) {
    var body = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      message: data.get('message'),
      consent: 'igen'
    };
    if (config.provider === 'web3forms') {
      body.access_key = config.accessKey;
      body.subject = config.subject;
      body.from_name = 'elemen.hu';
      body.botcheck = '';
    } else {
      body._subject = config.subject;
    }
    return body;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    status.hidden = true;

    var invalid = validate();
    if (invalid) {
      invalid.focus();
      return;
    }

    var data = new FormData(form);

    // Honeypot: ha egy bot kitöltötte, csendben „sikeresnek” mutatjuk, de nem küldjük el.
    if (data.get('website')) {
      form.reset();
      setStatus('success', MESSAGES.success);
      return;
    }

    if (!isConfigured()) {
      setStatus('error', MESSAGES.error);
      console.warn('Az űrlap-szolgáltató nincs beállítva: config/site.config.js → form.');
      return;
    }

    setBusy(true);
    fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload(data))
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || json.success === false) throw new Error(json.message || res.statusText);
        });
      })
      .then(function () {
        form.reset();
        setStatus('success', MESSAGES.success);
        if (window.elemenTrack) window.elemenTrack('generate_lead', { form_id: formId, lead_source: 'form' });
      })
      .catch(function () {
        setStatus('error', MESSAGES.error);
      })
      .then(function () {
        setBusy(false);
      });
  });
})();
