window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.adminLogin = async function (root, ctx) {
  var U = window.Platform.Utils;
  var Api = window.Platform.Api;

  if (ctx.user && ctx.user.role === "admin") {
    window.location.hash = "#/admin";
    return;
  }

  var status = await Api.get("/api/auth/admin-status");
  var needsSetup = Boolean(status.needsInitialSetup);

  root.innerHTML =
    '<div class="container section page-enter" style="max-width:480px;">' +
    '<div class="card" style="padding:30px;">' +
    '<span class="badge badge-gold" style="margin-bottom:10px;">بوابة الإدارة</span>' +
    '<h1 style="font-size:1.55rem;color:var(--emerald-900);margin-bottom:6px;">' +
    (needsSetup ? "إعداد كلمة مرور المشرف لأول مرة" : "تسجيل دخول المشرف") +
    "</h1>" +
    '<p style="color:var(--ink-muted);margin-bottom:20px;">' +
    (needsSetup
      ? "أنشئ كلمة مرور قوية لحساب المشرف (" + U.escapeHtml(status.username) + ") لبدء إدارة المنصة."
      : "سجّل الدخول لإدارة الدورات والدروس والإعلانات وإعدادات الموقع.") +
    "</p>" +
    '<div id="admin-auth-alert"></div>' +
    '<form id="admin-auth-form">' +
    (!needsSetup
      ? '<div class="field"><label>اسم المستخدم</label><input class="input" type="text" name="username" required value="' +
        U.escapeHtml(status.username || "OmarAlamin") +
        '" /></div>'
      : '<div class="field"><label>اسم المشرف</label><input class="input" type="text" disabled value="' +
        U.escapeHtml(status.username || "OmarAlamin") +
        '" /></div>') +
    '<div class="field"><label>كلمة المرور' +
    (needsSetup ? " (8 أحرف على الأقل)" : "") +
    '</label><input class="input" type="password" name="password" required minlength="' +
    (needsSetup ? 8 : 4) +
    '" /></div>' +
    '<button type="submit" class="btn btn-primary" style="width:100%;">' +
    (needsSetup ? "حفظ كلمة المرور والدخول" : "دخول لوحة الإدارة") +
    "</button></form></div></div>";

  var form = document.getElementById("admin-auth-form");
  var alertBox = document.getElementById("admin-auth-alert");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    alertBox.innerHTML = "";
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      var res = needsSetup
        ? await Api.post("/api/auth/admin-setup", { password: form.password.value })
        : await Api.post("/api/auth/admin-login", {
            username: form.username.value,
            password: form.password.value
          });
      Api.setToken(res.token || "");
      await ctx.refreshUser();
      U.toast("تم تسجيل دخول المشرف بنجاح.");
      window.location.hash = "#/admin";
    } catch (err) {
      alertBox.innerHTML = '<div class="alert alert-error">' + U.escapeHtml(err.message) + "</div>";
      btn.disabled = false;
    }
  });
};
