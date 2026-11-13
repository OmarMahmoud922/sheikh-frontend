window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.courses = async function (root) {
  var U = window.Platform.Utils;
  var C = window.Platform.Components;
  var Api = window.Platform.Api;

  var state = { status: "", q: "" };

  root.innerHTML =
    '<div class="container section page-enter">' +
    '<div class="section-header"><div>' +
    '<h1 class="section-title">جميع الدورات العلمية</h1>' +
    '<p class="section-subtitle">ابحث في الدورات الشرعية أو صفّها حسب الحالة.</p>' +
    "</div></div>" +
    '<div class="card filter-bar">' +
    '<div class="filter-tabs" id="course-status-tabs">' +
    '<button type="button" class="filter-tab active" data-status="">الكل</button>' +
    '<button type="button" class="filter-tab" data-status="active">نشطة الآن</button>' +
    '<button type="button" class="filter-tab" data-status="upcoming">قريباً</button>' +
    '<button type="button" class="filter-tab" data-status="completed">مكتملة</button>' +
    "</div>" +
    '<div style="min-width:260px;flex:1;max-width:360px;">' +
    '<input id="courses-search-input" class="input" type="search" placeholder="ابحث بعنوان الدورة أو وصفها..." />' +
    "</div></div>" +
    '<div id="courses-results-grid" class="courses-grid"></div>' +
    "</div>";

  var grid = document.getElementById("courses-results-grid");
  var tabs = document.getElementById("course-status-tabs");
  var input = document.getElementById("courses-search-input");

  async function loadCourses() {
    grid.innerHTML =
      '<div class="skeleton" style="height:290px;"></div>' +
      '<div class="skeleton" style="height:290px;"></div>' +
      '<div class="skeleton" style="height:290px;"></div>';
    try {
      var params = [];
      if (state.status) params.push("status=" + encodeURIComponent(state.status));
      if (state.q) params.push("q=" + encodeURIComponent(state.q));
      var res = await Api.get("/api/courses" + (params.length ? "?" + params.join("&") : ""));
      if (!res.courses || !res.courses.length) {
        grid.innerHTML =
          '<div class="card" style="padding:32px;grid-column:1/-1;text-align:center;color:var(--ink-muted);">لا توجد دورات مطابقة لبحثك حالياً.</div>';
        return;
      }
      grid.innerHTML = res.courses.map(C.renderCourseCard).join("");
    } catch (err) {
      grid.innerHTML = '<div class="alert alert-error">' + U.escapeHtml(err.message) + "</div>";
    }
  }

  tabs.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-status]");
    if (!btn) return;
    tabs.querySelectorAll("button").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    state.status = btn.getAttribute("data-status") || "";
    loadCourses();
  });

  var timer = null;
  input.addEventListener("input", function () {
    state.q = input.value.trim();
    clearTimeout(timer);
    timer = setTimeout(loadCourses, 220);
  });

  await loadCourses();
};
