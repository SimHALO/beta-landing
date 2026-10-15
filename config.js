/*
 * SimHALO beta landing page — the ONLY file you need to edit before the talk.
 *
 * Any value still starting with "TODO" is treated as "not ready": the matching
 * button renders as a disabled "link coming soon" state instead of a dead link.
 */
window.SIMHALO_CONFIG = {
  // iPhone / iPad: the TestFlight PUBLIC link for the external beta group.
  // App Store Connect -> TestFlight -> External group -> enable Public Link.
  // Looks like: https://testflight.apple.com/join/AbCdEfGh
  iosBetaUrl: "https://testflight.apple.com/join/JNUEubpf",

  // Android: EITHER a direct APK / EAS internal-distribution install page
  // (eas build -p android --profile android-apk -> the build's install URL),
  // OR a Google Play testing opt-in URL
  // (https://play.google.com/apps/testing/com.simhalo.app).
  androidBetaUrl: "https://expo.dev/artifacts/eas/iuacsDS--NZ_deKZxdVFsMXCMpjClLVQUMvzuA9JbYA.apk",

  // "apk"  -> shows sideload instructions ("allow installs from your browser")
  // "play" -> shows Play Store opt-in instructions
  androidBetaKind: "apk",

  // THE site address. Shown to desktop visitors, and the QR code points at
  // https://<shortUrl>/?src=talk (scripts: apps/landing/qr/make-qr.sh).
  // e.g. "beta.simhalo.app" (no https://)
  shortUrl: "beta.simhalo.com",

  // Public contact address for the footer + feedback fallback. Leave "TODO..."
  // to hide the email link entirely.
  contactEmail: "luke@simhalo.com",

  // Already live (docs/beta/BETA-LAUNCH.md section 2).
  privacyUrl: "https://simhalo.github.io/privacy/",

  // Sign-up form -> public.beta_signup() via the Supabase REST endpoint.
  // The ANON key is public by design (it ships inside the app too) and can
  // only call beta_signup(); it cannot read the list. NEVER put the
  // service-role key here. Same values as apps/mobile/eas.json.
  supabaseUrl: "https://ktcaporrbbafqhdykcur.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2Fwb3JyYmJhZnFoZHlrY3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTk0NzAsImV4cCI6MjA4ODkzNTQ3MH0.SBs1nL7Pc6tdg9RLkVgny_5PLx4cAC6kFaJWRimn5_4",

  // false = install buttons appear only after someone signs up (or has
  // signed up before on this device). true = always visible.
  showInstallBeforeSignup: false,
};
