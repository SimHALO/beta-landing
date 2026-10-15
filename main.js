/* SimHALO beta landing — wires config.js links + highlights the visitor's platform. */
(function () {
  "use strict";
  var cfg = window.SIMHALO_CONFIG || {};

  function ready(v) {
    return typeof v === "string" && v.trim() !== "" && !/^TODO/i.test(v.trim());
  }

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    // iPadOS 13+ reports itself as a Mac; touch support gives it away.
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
    return "other";
  }

  function wireButton(btn, url, label) {
    if (ready(url)) {
      btn.href = url;
      btn.removeAttribute("aria-disabled");
      btn.rel = "noopener";
    } else {
      btn.removeAttribute("href");
      btn.setAttribute("role", "link");
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("tabindex", "0");
      btn.querySelector(".btn__sub").textContent = "link coming soon";
      btn.addEventListener("click", function (e) { e.preventDefault(); });
    }
    btn.setAttribute("aria-label", label + (ready(url) ? "" : " (link coming soon)"));
  }

  var ios = document.getElementById("btn-ios");
  var android = document.getElementById("btn-android");
  var isPlay = cfg.androidBetaKind === "play";
  document.getElementById("android-sub").textContent = isPlay ? "via Google Play testing" : "direct download (APK)";

  wireButton(ios, cfg.iosBetaUrl, "Join the iPhone beta via TestFlight");
  wireButton(android, cfg.androidBetaUrl, "Get the Android beta");

  var platform = detectPlatform();
  document.documentElement.setAttribute("data-platform", platform);
  var note = document.getElementById("install-note");

  var notes = {
    ios:
      "<strong>On iPhone:</strong><ol><li>Tap <em>Join the iPhone beta</em>.</li>" +
      "<li>If asked, install Apple's free <strong>TestFlight</strong> app from the App Store.</li>" +
      "<li>Back in TestFlight, tap <em>Accept</em> then <em>Install</em>.</li></ol>",
    android: isPlay
      ? "<strong>On Android:</strong><ol><li>Tap <em>Get the Android beta</em> and choose <em>Become a tester</em>.</li>" +
        "<li>Follow the link to Google Play and install SimHALO.</li></ol>"
      : "<strong>On Android:</strong><ol><li>Tap <em>Get the Android beta</em> to download the app.</li>" +
        "<li>Open the download. If Android asks, allow your browser to install apps.</li>" +
        "<li>Tap <em>Install</em>, then open SimHALO.</li></ol>",
  };

  if (platform === "ios" || platform === "android") {
    var mine = platform === "ios" ? ios : android;
    var other = platform === "ios" ? android : ios;
    mine.classList.add("is-recommended");
    other.classList.add("is-secondary");
    mine.setAttribute("aria-label", mine.getAttribute("aria-label") + ". Recommended for your phone");
    note.innerHTML = notes[platform];
  } else if (ready(cfg.shortUrl)) {
    document.getElementById("short-url").textContent = cfg.shortUrl;
    document.getElementById("install-desktop").hidden = false;
  }

  // Feedback: TestFlight note only matters to iPhone users (hide on Android).
  if (platform === "android") document.getElementById("feedback-ios").hidden = true;

  // Contact + privacy links.
  if (ready(cfg.contactEmail)) {
    var mail = "mailto:" + cfg.contactEmail;
    document.querySelectorAll("[data-email]").forEach(function (a) {
      a.href = mail;
      a.textContent = cfg.contactEmail;
    });
    document.getElementById("feedback-email").hidden = false;
    var link = document.createElement("a");
    link.href = mail;
    link.textContent = cfg.contactEmail;
    document.getElementById("footer-contact").replaceChildren(link);
  }
  if (ready(cfg.privacyUrl)) {
    document.querySelectorAll("[data-privacy]").forEach(function (a) { a.href = cfg.privacyUrl; });
  }

  document.getElementById("year").textContent = String(new Date().getFullYear());

  // ---------------------------------------------------------------------------
  // Beta sign-up (waitlist) -> POST {supabaseUrl}/rest/v1/rpc/beta_signup
  // ---------------------------------------------------------------------------
  var SIGNED_KEY = "simhalo-beta-signed-up";
  var installSection = document.getElementById("install-section");
  var form = document.getElementById("signup-form");
  var done = document.getElementById("signup-done");
  var errBox = document.getElementById("signup-error");
  var submit = document.getElementById("signup-submit");

  function store(get, val) {
    try {
      if (get) return window.localStorage.getItem(SIGNED_KEY);
      window.localStorage.setItem(SIGNED_KEY, val);
    } catch (e) { /* private mode: fine */ }
    return null;
  }
  function revealInstall() { if (installSection) installSection.hidden = false; }
  if (cfg.showInstallBeforeSignup === true || store(true)) revealInstall();

  // Preselect the phone we detected.
  if (platform === "ios" || platform === "android") {
    var radio = form && form.querySelector('input[name="platform"][value="' + platform + '"]');
    if (radio) radio.checked = true;
  }

  if (!ready(cfg.supabaseUrl) || !ready(cfg.supabaseAnonKey)) {
    if (form) form.hidden = true;
    document.getElementById("signup-closed").hidden = false;
    revealInstall();
    return;
  }

  var MESSAGES = {
    invalid_email: "Please check your email address.",
    invalid_name: "Please add your name.",
    invalid_role: "Please choose your role.",
    invalid_platform: "Please choose iPhone or Android.",
    consent_required: "Please tick the box so we can email you when the beta opens.",
    invalid_length: "One of the answers is too long. Please shorten it.",
    rate_limited: "Lots of sign-ups right now. Please try again in a few minutes."
  };

  function showError(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  function sourceTag() {
    var m = /[?&]src=([A-Za-z0-9_-]{1,40})/.exec(window.location.search || "");
    return m ? m[1] : null;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errBox.hidden = true;
    var f = form.elements;
    var plat = form.querySelector('input[name="platform"]:checked');
    var payload = {
      p_email: (f.email.value || "").trim(),
      p_name: (f.name.value || "").trim(),
      p_role: f.role.value || "",
      p_platform: plat ? plat.value : "",
      p_consent: !!f.consent.checked,
      p_workplace: (f.workplace.value || "").trim() || null,
      p_heard_from: (f.heard_from.value || "").trim() || null,
      p_source: sourceTag(),
      p_website: f.website.value || null
    };
    // Same checks as the server, so most mistakes never leave the phone.
    if (!payload.p_name) return showError(MESSAGES.invalid_name);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.p_email)) return showError(MESSAGES.invalid_email);
    if (!payload.p_role) return showError(MESSAGES.invalid_role);
    if (!payload.p_platform) return showError(MESSAGES.invalid_platform);
    if (!payload.p_consent) return showError(MESSAGES.consent_required);

    submit.disabled = true;
    submit.textContent = "Sending…";
    fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/beta_signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg.supabaseAnonKey,
        "Authorization": "Bearer " + cfg.supabaseAnonKey
      },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (res.ok) return null;
      return res.json().then(function (body) {
        var code = body && body.message;
        throw new Error(MESSAGES[code] || "Something went wrong. Please try again.");
      }, function () { throw new Error("Something went wrong. Please try again."); });
    }).then(function () {
      store(false, "1");
      form.hidden = true;
      done.hidden = false;
      revealInstall();
      done.focus();
    }).catch(function (err) {
      var offline = err && /Failed to fetch|NetworkError|Load failed/i.test(err.message);
      showError(offline ? "No connection. Please check your signal and try again." : err.message);
    }).then(function () {
      submit.disabled = false;
      submit.textContent = "Join the waiting list";
    });
  });
})();
