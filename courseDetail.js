window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.courseDetail = async function (root, ctx, slug) {
  var U = window.Platform.Utils;
  var I = window.Platform.Icons;
  var C = window.Platform.Components;
  var Api = window.Platform.Api;

  var data = await Api.get("/api/courses/" + encodeURIComponent(slug));
  var c = data.course;
  var st = U.statusLabel(c.status);
  var completedSet = new Set(data.completedLessonIds || []);
  var cover = U.resolveAssetUrl(c.coverImage);
  var introLinkSafe = U.safeUrl(c.introLink);

  var actionArea = "";
  if (!ctx.user) {
    actionArea =
      '<a href="#/register" class="btn btn-gold">سجّل للاشتراك والمتابعة اليومية</a> ' +
      '<a href="#/login" class="btn btn-outline">لدي حساب بالفعل</a>';
  } else if (ctx.user.role === "admin") {
    actionArea = '<a href="#/admin" class="btn btn-outline">تعديل الدورة من لوحة الإدارة</a>';
  } else if (data.isEnrolled) {
    actionArea =
      '<a href="#/dashboard" class="btn btn-primary">' +
      I.check +
      " أنت مشترك — افتح جدولك اليومي</a>";
  } else {
    actionArea =
      '<button type="button" id="enroll-course-btn" class="btn btn-gold">اشترك في الدورة وابدأ الجدول اليومي</button>';
  }

  var lessonsHtml = (data.lessons || [])
    .map(function (l, idx) {
      var done = completedSet.has(l.id);
      return (
        '<div class="lesson-list-row">' +
        '<div style="display:flex;align-items:center;gap:12px;min-width:0;">' +
        '<span class="step-num" style="margin:0;width:34px;height:34px;font-size:0.9rem;flex-shrink:0;">' +
        (done ? I.check : idx + 1) +
        "</span>" +
        '<div style="min-width:0;">' +
        '<a href="#/lesson/' +
        l.id +
        '" style="font-weight:700;color:var(--emerald-900);display:block;">' +
        U.escapeHtml(l.title) +
        "</a>" +
        '<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.82rem;color:var(--ink-muted);margin-top:2px;">' +
        (l.audioUrl ? "<span>صوت</span>" : "") +
        (l.videoUrl ? "<span>فيديو</span>" : "") +
        (l.quizUrl ? "<span>اختبار</span>" : "") +
        (done ? '<span style="color:var(--emerald-700);font-weight:700;">مكتمل</span>' : "") +
        "</div></div></div>" +
        '<a href="#/lesson/' +
        l.id +
        '" class="btn btn-outline btn-sm">فتح الدرس</a>' +
        "</div>"
      );
    })
    .join("");

  root.innerHTML =
    '<div class="container section page-enter">' +
    '<div style="margin-bottom:16px;font-size:0.9rem;color:var(--ink-muted);">' +
    '<a href="#/">الرئيسية</a> / <a href="#/courses">الدورات</a> / <span>' +
    U.escapeHtml(c.title) +
    "</span></div>" +
    '<div class="card" style="overflow:hidden;margin-bottom:26px;">' +
    '<div class="hero-grid" style="padding:26px;gap:28px;align-items:start;">' +
    "<div>" +
    '<span class="badge ' +
    st.cls +
    '" style="margin-bottom:10px;">' +
    U.escapeHtml(st.text) +
    "</span>" +
    '<h1 style="font-size:clamp(1.6rem,2.8vw,2.2rem);color:var(--emerald-900);margin-bottom:10px;">' +
    U.escapeHtml(c.title) +
    "</h1>" +
    '<p style="color:var(--ink-muted);margin-bottom:16px;">' +
    U.escapeHtml(c.shortDescription || "") +
    "</p>" +
    '<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.9rem;color:var(--ink-muted);margin-bottom:20px;">' +
    "<span>" +
    I.book +
    " عدد الدروس: " +
    (data.lessons || []).length +
    "</span>" +
    (c.startDate ? "<span>" + I.calendar + " البداية: " + U.escapeHtml(U.formatArabicDate(c.startDate)) + "</span>" : "") +
    (c.endDate ? "<span>النهاية: " + U.escapeHtml(U.formatArabicDate(c.endDate)) + "</span>" : "") +
    "</div>" +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;">' +
    actionArea +
    (introLinkSafe
      ? '<a class="btn btn-ghost" target="_blank" rel="noopener noreferrer" href="' +
        U.escapeHtml(introLinkSafe) +
        '">مقدمة الدورة ' +
        I.external +
        "</a>"
      : "") +
    "</div></div>" +
    '<div style="border-radius:16px;overflow:hidden;border:1px solid var(--border);">' +
    '<img src="' +
    U.escapeHtml(cover) +
    '" alt="' +
    U.escapeHtml(c.title) +
    '" style="width:100%;aspect-ratio:16/10;object-fit:cover;" />' +
    "</div></div></div>" +
    (data.announcement
      ? '<div style="margin-bottom:26px;">' + C.renderAnnouncementCard(data.announcement) + "</div>"
      : "") +
    (c.introArticle
      ? '<div class="card" style="padding:24px;margin-bottom:26px;"><h2 style="font-size:1.3rem;margin-bottom:10px;color:var(--emerald-900);">المقال التعريفي بالدورة</h2><p style="white-space:pre-line;margin:0;color:var(--ink-muted);">' +
        U.escapeHtml(c.introArticle) +
        "</p></div>"
      : "") +
    '<div class="card" style="overflow:hidden;">' +
    '<div style="padding:18px 20px;border-bottom:1px solid var(--border);background:var(--ivory);">' +
    '<h2 style="font-size:1.25rem;margin:0;color:var(--emerald-900);">منهج الدروس بالترتيب</h2></div>' +
    (lessonsHtml || '<div style="padding:24px;color:var(--ink-muted);">لم يتم إضافة دروس لهذه الدورة بعد.</div>') +
    "</div></div>";

  var enrollBtn = document.getElementById("enroll-course-btn");
  if (enrollBtn) {
    enrollBtn.addEventListener("click", async function () {
      enrollBtn.disabled = true;
      try {
        await Api.post("/api/student/enroll", { courseId: c.id });
        U.toast("تم اشتراكك في الدورة وتجهيز جدولك اليومي بنجاح.");
        window.location.hash = "#/dashboard";
      } catch (err) {
        U.toast(err.message, "error");
        enrollBtn.disabled = false;
      }
    });
  }

  return C.bindCountdowns(root);
};
