window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.auth = function (root, ctx, mode, query) {
  var U = window.Platform.Utils;
  var Api = window.Platform.Api;

  if (mode === "login") {
    root.innerHTML =
      '<div class="container section page-enter" style="max-width:480px;">' +
      '<div class="card" style="padding:30px;">' +
      '<h1 style="font-size:1.6rem;color:var(--emerald-900);margin-bottom:6px;">تسجيل دخول الطالب</h1>' +
      '<p style="color:var(--ink-muted);margin-bottom:20px;">ادخل لمتابعة جدولك اليومي ودروسك المحفوظة.</p>' +
      '<div id="auth-alert"></div>' +
      '<form id="student-login-form">' +
      '<div class="field"><label>البريد الإلكتروني</label><input class="input" type="email" name="email" required placeholder="student@example.com" /></div>' +
      '<div class="field"><label>كلمة المرور</label><input class="input" type="password" name="password" required minlength="6" /></div>' +
      '<button type="submit" class="btn btn-primary" style="width:100%;">دخول</button>' +
      "</form>" +
      '<div style="display:flex;justify-content:space-between;margin-top:16px;font-size:0.9rem;color:var(--ink-muted);">' +
      '<a href="#/forgot-password">نسيت كلمة المرور؟</a>' +
      '<a href="#/register" style="color:var(--emerald-700);font-weight:700;">إنشاء حساب جديد</a>' +
      "</div></div></div>";

    var form = document.getElementById("student-login-form");
    var alertBox = document.getElementById("auth-alert");
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      alertBox.innerHTML = "";
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        var res = await Api.post("/api/auth/login", {
          email: form.email.value,
          password: form.password.value
        });
        Api.setToken(res.token || "");
        await ctx.refreshUser();
        U.toast("مرحباً بك، تم تسجيل الدخول بنجاح.");
        window.location.hash = "#/dashboard";
      } catch (err) {
        alertBox.innerHTML = '<div class="alert alert-error">' + U.escapeHtml(err.message) + "</div>";
        btn.disabled = false;
      }
    });
    return;
  }

  if (mode === "register") {
    root.innerHTML =
      '<div class="container section page-enter" style="max-width:480px;">' +
      '<div class="card" style="padding:30px;">' +
      '<h1 style="font-size:1.6rem;color:var(--emerald-900);margin-bottom:6px;">إنشاء حساب طالب جديد</h1>' +
      '<p style="color:var(--ink-muted);margin-bottom:20px;">سجّل مجاناً لإنشاء جدولك اليومي وحفظ تقدمك في الدورات.</p>' +
      '<div id="auth-alert"></div>' +
      '<form id="student-register-form">' +
      '<div class="field"><label>الاسم الكامل</label><input class="input" type="text" name="name" required minlength="2" placeholder="مثال: أحمد محمد" /></div>' +
      '<div class="field"><label>البريد الإلكتروني</label><input class="input" type="email" name="email" required placeholder="student@example.com" /></div>' +
      '<div class="field"><label>كلمة المرور (6 أحرف على الأقل)</label><input class="input" type="password" name="password" required minlength="6" /></div>' +
      '<button type="submit" class="btn btn-gold" style="width:100%;">إنشاء الحساب والبدء</button>' +
      "</form>" +
      '<div style="text-align:center;margin-top:16px;font-size:0.9rem;color:var(--ink-muted);">لديك حساب بالفعل؟ <a href="#/login" style="color:var(--emerald-700);font-weight:700;">سجّل الدخول</a></div>' +
      "</div></div>";

    var regForm = document.getElementById("student-register-form");
    var regAlert = document.getElementById("auth-alert");
    regForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      regAlert.innerHTML = "";
      var btn = regForm.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        var res = await Api.post("/api/auth/register", {
          name: regForm.name.value,
          email: regForm.email.value,
          password: regForm.password.value
        });
        Api.setToken(res.token || "");
        await ctx.refreshUser();
        U.toast("تم إنشاء حسابك بنجاح!");
        window.location.hash = "#/dashboard";
      } catch (err) {
        regAlert.innerHTML = '<div class="alert alert-error">' + U.escapeHtml(err.message) + "</div>";
        btn.disabled = false;
      }
    });
    return;
  }

  if (mode === "forgot") {
    root.innerHTML =
      '<div class="container section page-enter" style="max-width:480px;">' +
      '<div class="card" style="padding:30px;">' +
      '<h1 style="font-size:1.55rem;color:var(--emerald-900);margin-bottom:8px;">استعادة كلمة المرور</h1>' +
      '<p style="color:var(--ink-muted);margin-bottom:20px;">أدخل بريدك الإلكتروني المسجل لإصدار رابط إعادة التعيين.</p>' +
      '<div id="auth-alert"></div>' +
      '<form id="forgot-form">' +
      '<div class="field"><label>البريد الإلكتروني</label><input class="input" type="email" name="email" required /></div>' +
      '<button type="submit" class="btn btn-primary" style="width:100%;">إرسال رابط الاستعادة</button>' +
      "</form></div></div>";

    var fForm = document.getElementById("forgot-form");
    var fAlert = document.getElementById("auth-alert");
    fForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      try {
        var res = await Api.post("/api/auth/forgot-password", { email: fForm.email.value });
        var extra = res.resetPath
          ? '<div style="margin-top:8px;"><a class="btn btn-gold btn-sm" href="' +
            U.escapeHtml(res.resetPath) +
            '">الانتقال مباشرة لإعادة التعيين</a></div>'
          : "";
        fAlert.innerHTML =
          '<div class="alert alert-success">' + U.escapeHtml(res.message) + extra + "</div>";
      } catch (err) {
        fAlert.innerHTML = '<div class="alert alert-error">' + U.escapeHtml(err.message) + "</div>";
      }
    });
    return;
  }

  var tokenParam = (query && query.get("token")) || "";
  root.innerHTML =
    '<div class="container section page-enter" style="max-width:480px;">' +
    '<div class="card" style="padding:30px;">' +
    '<h1 style="font-size:1.55rem;color:var(--emerald-900);margin-bottom:8px;">تعيين كلمة مرور جديدة</h1>' +
    '<div id="auth-alert"></div>' +
    '<form id="reset-form">' +
    '<div class="field"><label>كلمة المرور الجديدة</label><input class="input" type="password" name="password" required minlength="6" /></div>' +
    '<button type="submit" class="btn btn-primary" style="width:100%;">حفظ كلمة المرور</button>' +
    "</form></div></div>";

  var rForm = document.getElementById("reset-form");
  var rAlert = document.getElementById("auth-alert");
  rForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      var res = await Api.post("/api/auth/reset-password", {
        token: tokenParam,
        password: rForm.password.value
      });
      rAlert.innerHTML =
        '<div class="alert alert-success">' +
        U.escapeHtml(res.message) +
        ' <a href="#/login" style="text-decoration:underline;">دخول</a></div>';
    } catch (err) {
      rAlert.innerHTML = '<div class="alert alert-error">' + U.escapeHtml(err.message) + "</div>";
    }
  });
};
