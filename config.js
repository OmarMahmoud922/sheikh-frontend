// ============================================================================
// إعداد ربط الواجهة (GitHub Pages) بالخادم الخلفي (Vercel FastAPI)
// غيّر رابط vercelBackendUrl إلى رابط مشروعك على Vercel بعد رفعه.
// ============================================================================
(function () {
  var vercelBackendUrl = "https://sheikh-backend.vercel.app";

  var host = window.location.hostname;
  var isLocalOrPreview =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".run.app") ||
    host.endsWith(".vercel.app");

  var savedOverride = "";
  try {
    savedOverride = window.localStorage.getItem("platform_api_base_override") || "";
  } catch (e) {}

  var apiBase = isLocalOrPreview
    ? ""
    : (savedOverride || vercelBackendUrl).replace(/\/+$/, "");

  window.PLATFORM_CONFIG = {
    API_BASE_URL: apiBase,
    VERCEL_PLACEHOLDER: "https://YOUR-BACKEND-NAME.vercel.app"
  };
})();
