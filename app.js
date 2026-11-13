window.Platform = window.Platform || {};

(function () {
  var U = window.Platform.Utils;
  var I = window.Platform.Icons;
  var Api = window.Platform.Api;
  var C = window.Platform.Components;
  var Pages = window.Platform.Pages;

  var ctx = {
    user: null,
    bootstrap: null,
    activeTimer: null,
    refreshUser: async function () {
      try {
        var res = await Api.get("/api/auth/me");
        ctx.user = res.user || null;
      } catch (e) {
        ctx.user = null;
      }
      renderChrome();
    },
    refreshBootstrap: async function () {
      try {
        ctx.bootstrap = await Api.get("/api/bootstrap");
        var s = ctx.bootstrap.settings || {};
        if (s.siteName) document.title = s.siteName;
      } catch (e) {}
      renderChrome();
    }
  };

  function renderChrome() {
    var s = (ctx.bootstrap && ctx.bootstrap.settings) || {};
    var links = (ctx.bootstrap && ctx.bootstrap.socialLinks) || [];
    var currentHash = window.location.hash || "#/";

    var navLinks =
      '<a class="nav-link' +
      (currentHash === "#/" ? " active" : "") +
      '" href="#/">الرئيسية</a>' +
      '<a class="nav-link' +
      (currentHash.indexOf("#/courses") === 0 ? " active" : "") +
      '" href="#/courses">الدورات</a>' +
      (ctx.user && ctx.user.role === "student"
        ? '<a class="nav-link' +
          (currentHash.indexOf("#/dashboard") === 0 ? " active" : "") +
          '" href="#/dashboard">جدولي اليومي</a>'
        : "") +
      (ctx.user && ctx.user.role === "admin"
        ? '<a class="nav-link' +
          (currentHash.indexOf("#/admin") === 0 ? " active" : "") +
          '" href="#/admin">لوحة الإدارة</a>'
        : "");

    var navActions = ctx.user
      ? '<span style="font-size:0.88rem;color:var(--ink-muted);font-weight:700;">' +
        U.escapeHtml(ctx.user.name) +
        "</span>" +
        '<button type="button" class="btn btn-outline btn-sm" id="logout-btn">خروج</button>'
      : '<a class="btn btn-outline btn-sm" href="#/login">دخول</a>' +
        '<a class="btn btn-primary btn-sm" href="#/register">حساب جديد</a>';

    document.getElementById("navbar-root").innerHTML =
      '<div class="container navbar-inner">' +
      '<a href="#/" class="brand">' +
      '<span class="brand-mark">' +
      I.book +
      "</span>" +
      '<span class="brand-text">' +
      '<span class="brand-title">' +
      U.escapeHtml(s.siteName || "منصة الشيخ إبراهيم الشربيني") +
      "</span>" +
      '<span class="brand-sub">' +
      U.escapeHtml(s.sheikhName || "التعليمية للعلوم الشرعية") +
      "</span></span></a>" +
      '<nav class="nav-links" aria-label="التنقل الرئيسي">' +
      navLinks +
      "</nav>" +
      '<div class="nav-actions">' +
      navActions +
      "</div>" +
      '<button type="button" id="mobile-menu-toggle" class="mobile-menu-btn" aria-label="القائمة">' +
      I.menu +
      "</button></div>" +
      '<div id="mobile-drawer" class="mobile-drawer">' +
      '<nav class="nav-links">' +
      navLinks +
      '</nav><div class="nav-actions">' +
      navActions +
      "</div></div>";

    var toggle = document.getElementById("mobile-menu-toggle");
    var drawer = document.getElementById("mobile-drawer");
    if (toggle && drawer) {
      toggle.onclick = function () {
        drawer.classList.toggle("open");
      };
    }

    document.querySelectorAll("#logout-btn").forEach(function (btn) {
      btn.onclick = async function () {
        await Api.post("/api/auth/logout", {}).catch(function () {});
        Api.setToken("");
        ctx.user = null;
        renderChrome();
        U.toast("تم تسجيل الخروج.");
        window.location.hash = "#/";
      };
    });

    var socialFooter = links
      .map(function (l) {
        var safe = U.safeUrl(l.url);
        if (!safe) return "";
        return (
          '<li><a target="_blank" rel="noopener noreferrer" href="' +
          U.escapeHtml(safe) +
          '">' +
          U.escapeHtml(l.platformName) +
          "</a></li>"
        );
      })
      .join("");

    document.getElementById("footer-root").innerHTML =
      '<div class="container">' +
      '<div class="footer-grid">' +
      '<div><div class="footer-title">' +
      U.escapeHtml(s.siteName || "منصة الشيخ إبراهيم الشربيني التعليمية") +
      '</div><p style="margin:0;line-height:1.8;">' +
      U.escapeHtml(s.footerAbout || "") +
      "</p></div>" +
      '<div><div class="footer-title">روابط سريعة</div><ul class="footer-links">' +
      '<li><a href="#/">الرئيسية</a></li>' +
      '<li><a href="#/courses">جميع الدورات</a></li>' +
      '<li><a href="#/register">إنشاء حساب طالب</a></li>' +
      '<li><a href="#/admin/login">بوابة الإدارة</a></li>' +
      "</ul></div>" +
      '<div><div class="footer-title">التواصل والقنوات</div><ul class="footer-links">' +
      (s.contactEmail ? "<li>" + U.escapeHtml(s.contactEmail) + "</li>" : "") +
      (s.contactPhone ? "<li>" + U.escapeHtml(s.contactPhone) + "</li>" : "") +
      socialFooter +
      "</ul></div></div>" +
      '<div class="footer-bottom"><span>جميع الحقوق محفوظة © ' +
      new Date().getFullYear() +
      " — " +
      U.escapeHtml(s.sheikhName || "الشيخ إبراهيم الشربيني") +
      "</span><span>منهج علمي مؤصل</span></div></div>";
  }

  async function navigate() {
    if (ctx.activeTimer) {
      clearInterval(ctx.activeTimer);
      ctx.activeTimer = null;
    }

    var rawHash = window.location.hash || "#/";
    var parts = rawHash.slice(1).split("?");
    var path = parts[0] || "/";
    var query = new URLSearchParams(parts[1] || "");

    var root = document.getElementById("page-root");
    root.onclick = null;
    root.onsubmit = null;
    root.onchange = null;
    root.innerHTML = C.renderSkeletonPage();
    renderChrome();

    try {
      if (path === "/" || path === "") {
        ctx.activeTimer = await Pages.home(root, ctx);
      } else if (path === "/courses") {
        await Pages.courses(root, ctx);
      } else if (path.indexOf("/course/") === 0) {
        var slug = decodeURIComponent(path.slice("/course/".length));
        ctx.activeTimer = await Pages.courseDetail(root, ctx, slug);
      } else if (path.indexOf("/lesson/") === 0) {
        var lessonId = path.slice("/lesson/".length);
        await Pages.lessonDetail(root, ctx, lessonId);
      } else if (path === "/login") {
        Pages.auth(root, ctx, "login", query);
      } else if (path === "/register") {
        Pages.auth(root, ctx, "register", query);
      } else if (path === "/forgot-password") {
        Pages.auth(root, ctx, "forgot", query);
      } else if (path === "/reset-password") {
        Pages.auth(root, ctx, "reset", query);
      } else if (path === "/dashboard") {
        await Pages.studentDashboard(root, ctx);
      } else if (path === "/admin/login") {
        await Pages.adminLogin(root, ctx);
      } else if (path === "/admin") {
        await Pages.adminDashboard(root, ctx);
      } else {
        root.innerHTML =
          '<div class="container section"><div class="card" style="padding:36px;text-align:center;"><h1>الصفحة غير موجودة</h1><a href="#/" class="btn btn-primary">العودة للرئيسية</a></div></div>';
      }
      window.scrollTo(0, 0);
    } catch (err) {
      root.innerHTML =
        '<div class="container section"><div class="alert alert-error">' +
        U.escapeHtml(err.message || "تعذر تحميل الصفحة.") +
        '</div><a href="#/" class="btn btn-outline">العودة للرئيسية</a></div>';
    }
  }

  async function init() {
    await Promise.all([ctx.refreshBootstrap(), ctx.refreshUser()]);
    window.addEventListener("hashchange", navigate);
    await navigate();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
