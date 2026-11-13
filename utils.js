window.Platform = window.Platform || {};

window.Platform.Utils = {
  escapeHtml: function (str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  safeUrl: function (url) {
    if (!url) return "";
    var s = String(url).trim();
    if (
      s.startsWith("https://") ||
      s.startsWith("http://") ||
      s.startsWith("./") ||
      s.startsWith("/")
    ) {
      return s;
    }
    return "";
  },

  resolveAssetUrl: function (url) {
    if (!url) return "./assets/images/course-sunnah.jpg";
    var s = String(url).trim();
    if (s.startsWith("/images/")) {
      return "./assets" + s;
    }
    if (s.startsWith("/uploads/")) {
      var base = (window.PLATFORM_CONFIG && window.PLATFORM_CONFIG.API_BASE_URL) || "";
      return base + s;
    }
    return window.Platform.Utils.safeUrl(s) || "./assets/images/course-sunnah.jpg";
  },

  formatArabicDate: function (dateStr) {
    if (!dateStr) return "غير محدد";
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return String(dateStr);
    }
  },

  formatArabicDateTime: function (dateStr) {
    if (!dateStr) return "";
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return String(dateStr);
    }
  },

  statusLabel: function (status) {
    if (status === "upcoming") return { text: "قريباً", cls: "badge-gold" };
    if (status === "completed") return { text: "مكتملة", cls: "badge-neutral" };
    return { text: "نشطة الآن", cls: "badge-emerald" };
  },

  toast: function (message, type) {
    var root = document.getElementById("toast-root");
    if (!root) return;
    var el = document.createElement("div");
    el.className = "toast-item" + (type === "error" ? " error" : "");
    el.textContent = message;
    root.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 3600);
  }
};
