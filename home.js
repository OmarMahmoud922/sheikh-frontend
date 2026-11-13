window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.home = async function (root, ctx) {
  var U = window.Platform.Utils;
  var I = window.Platform.Icons;
  var C = window.Platform.Components;

  var data = ctx.bootstrap || (await window.Platform.Api.get("/api/bootstrap"));
  var s = data.settings || {};
  var coursesHtml = (data.featuredCourses || []).map(C.renderCourseCard).join("");
  var annHtml = data.upcomingAnnouncement ? C.renderAnnouncementCard(data.upcomingAnnouncement) : "";

  var socialHtml = (data.socialLinks || [])
    .map(function (lnk) {
      var safe = U.safeUrl(lnk.url);
      if (!safe) return "";
      return (
        '<a class="card card-hover social-card" target="_blank" rel="noopener noreferrer" href="' +
        U.escapeHtml(safe) +
        '">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
        '<span class="social-icon-box">' +
        I.globe +
        "</span>" +
        '<div><strong style="display:block;color:var(--emerald-900);">' +
        U.escapeHtml(lnk.platformName) +
        '</strong><span style="font-size:0.82rem;color:var(--ink-muted);">اضغط للمتابعة</span></div>' +
        "</div>" +
        I.external +
        "</a>"
      );
    })
    .join("");

  var primaryCta = ctx.user
    ? ctx.user.role === "admin"
      ? '<a href="#/admin" class="btn btn-gold">لوحة إدارة المنصة</a>'
      : '<a href="#/dashboard" class="btn btn-gold">استكمل جدولك اليومي</a>'
    : '<a href="#/register" class="btn btn-gold">ابدأ التعلم مجاناً</a>';

  root.innerHTML =
    '<div class="page-enter">' +
    '<section class="hero-section" id="hero-interactive">' +
    '<div class="hero-pattern"></div>' +
    '<div class="container hero-grid">' +
    "<div>" +
    '<div class="hero-kicker">' +
    U.escapeHtml(s.heroBadge || "منهجية علمية مؤصلة") +
    "</div>" +
    '<h1 class="hero-title">' +
    U.escapeHtml(s.heroTitle || "منصة الشيخ إبراهيم الشربيني التعليمية") +
    "</h1>" +
    '<p class="hero-subtitle">' +
    U.escapeHtml(s.heroSubtitle || "") +
    "</p>" +
    '<div class="hero-cta">' +
    primaryCta +
    '<a href="#/courses" class="btn btn-outline">استكشف الدورات الشرعية</a>' +
    "</div></div>" +
    '<div class="hero-visual-card">' +
    '<img src="./assets/images/hero-library.jpg" alt="' +
    U.escapeHtml(s.sheikhName || "الشيخ إبراهيم الشربيني") +
    '" />' +
    '<div class="hero-visual-caption">' +
    "<span>" +
    U.escapeHtml(s.sheikhName || "الشيخ إبراهيم الشربيني") +
    "</span>" +
    "<span>دروس صوتية ومرئية وملخصات</span>" +
    "</div></div></div></section>" +
    (annHtml
      ? '<section class="section" style="padding-bottom:10px;"><div class="container">' +
        annHtml +
        "</div></section>"
      : "") +
    '<section class="section">' +
    '<div class="container">' +
    '<div class="section-header">' +
    '<div><h2 class="section-title">الدورات العلمية المختارة</h2>' +
    '<p class="section-subtitle">تصفح الدورات المتاحة كزائر أو اشترك لمتابعة خطة استماع يومية منظمة.</p></div>' +
    '<a href="#/courses" class="btn btn-outline">عرض جميع الدورات</a>' +
    "</div>" +
    '<div class="courses-grid">' +
    (coursesHtml || '<div class="card" style="padding:28px;">لا توجد دورات منشورة حالياً.</div>') +
    "</div></div></section>" +
    '<section class="section section-alt">' +
    '<div class="container">' +
    '<div class="section-header"><div>' +
    '<h2 class="section-title">' +
    U.escapeHtml(s.howItWorksTitle || "كيف تسير رحلتك العلمية في المنصة؟") +
    "</h2>" +
    '<p class="section-subtitle">' +
    U.escapeHtml(s.howItWorksSubtitle || "") +
    "</p></div></div>" +
    '<div class="steps-grid">' +
    '<div class="card step-card"><span class="step-num">1</span><h3>تصفح واختر دورتك</h3><p style="color:var(--ink-muted);margin:0;">اطّلع على خطة كل دورة ومقالها التمهيدي ومحتوياتها بحرية كاملة.</p></div>' +
    '<div class="card step-card"><span class="step-num">2</span><h3>سجّل حسابك مجاناً</h3><p style="color:var(--ink-muted);margin:0;">أنشئ حساب طالب بخطوات سريعة لحفظ اشتراكاتك وتقدمك الدراسي.</p></div>' +
    '<div class="card step-card"><span class="step-num">3</span><h3>تابع درس اليوم</h3><p style="color:var(--ink-muted);margin:0;">يعرض لك نظام "استمع اليوم" درساً واحداً يومياً بالترتيب دون تشتيت.</p></div>' +
    '<div class="card step-card"><span class="step-num">4</span><h3>أتمم أو أجّل بمرونة</h3><p style="color:var(--ink-muted);margin:0;">اضغط "تم الاستماع" للتقدم للدرس التالي أو "تأجيل للغد" دون فقدان الترتيب.</p></div>' +
    "</div></div></section>" +
    (socialHtml
      ? '<section class="section"><div class="container">' +
        '<div class="section-header"><div><h2 class="section-title">حسابات ومنصات التواصل</h2>' +
        '<p class="section-subtitle">تابع الدروس والبثوث المباشرة عبر القنوات الرسمية.</p></div></div>' +
        '<div class="social-grid">' +
        socialHtml +
        "</div></div></section>"
      : "") +
    "</div>";

  var hero = document.getElementById("hero-interactive");
  if (hero) {
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
      var y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
      hero.style.setProperty("--mx", x);
      hero.style.setProperty("--my", y);
    });
  }

  return C.bindCountdowns(root);
};
