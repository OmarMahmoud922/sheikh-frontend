window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.lessonDetail = async function (root, ctx, lessonId) {
  var U = window.Platform.Utils;
  var I = window.Platform.Icons;
  var Api = window.Platform.Api;

  var data = await Api.get("/api/lessons/" + encodeURIComponent(lessonId));
  var l = data.lesson;
  var course = data.course;

  var audioSafe = U.safeUrl(l.audioUrl);
  var videoSafe = U.safeUrl(l.videoUrl);
  var quizSafe = U.safeUrl(l.quizUrl);

  var actionLinks = "";
  if (audioSafe) {
    actionLinks +=
      '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' +
      U.escapeHtml(audioSafe) +
      '">' +
      I.audio +
      " الاستماع للصوت " +
      I.external +
      "</a>";
  }
  if (videoSafe) {
    actionLinks +=
      '<a class="btn btn-gold" target="_blank" rel="noopener noreferrer" href="' +
      U.escapeHtml(videoSafe) +
      '">' +
      I.video +
      " مشاهدة الفيديو " +
      I.external +
      "</a>";
  }
  if (quizSafe) {
    actionLinks +=
      '<a class="btn btn-outline" target="_blank" rel="noopener noreferrer" href="' +
      U.escapeHtml(quizSafe) +
      '">' +
      I.quiz +
      " رابط الاختبار " +
      I.external +
      "</a>";
  }

  var attachmentsHtml = (l.attachments || [])
    .map(function (att) {
      var safe = U.resolveAssetUrl(att.fileUrl);
      if (!safe) return "";
      return (
        '<a class="lesson-list-row" target="_blank" rel="noopener noreferrer" href="' +
        U.escapeHtml(safe) +
        '">' +
        '<span style="display:flex;align-items:center;gap:10px;font-weight:700;color:var(--emerald-900);">' +
        I.file +
        " " +
        U.escapeHtml(att.title) +
        "</span>" +
        '<span class="btn btn-outline btn-sm">تحميل / فتح ' +
        I.external +
        "</span></a>"
      );
    })
    .join("");

  root.innerHTML =
    '<div class="container section page-enter">' +
    '<div style="margin-bottom:16px;font-size:0.9rem;color:var(--ink-muted);">' +
    '<a href="#/">الرئيسية</a> / <a href="#/course/' +
    encodeURIComponent(course.slug) +
    '">' +
    U.escapeHtml(course.title) +
    "</a> / <span>الدرس " +
    data.lessonNumber +
    " من " +
    data.totalLessons +
    "</span></div>" +
    '<div class="card" style="padding:28px;margin-bottom:22px;">' +
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px;">' +
    '<span class="badge badge-emerald">الدرس ' +
    data.lessonNumber +
    " من " +
    data.totalLessons +
    "</span>" +
    (data.isCompleted ? '<span class="badge badge-gold">' + I.check + " تم الاستماع</span>" : "") +
    "</div>" +
    '<h1 style="font-size:clamp(1.45rem,2.5vw,2rem);color:var(--emerald-900);margin-bottom:18px;">' +
    U.escapeHtml(l.title) +
    "</h1>" +
    (actionLinks
      ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:22px;">' + actionLinks + "</div>"
      : '<p style="color:var(--ink-muted);">لا توجد روابط وسائط خارجية مضافة لهذا الدرس بعد.</p>') +
    (l.summary
      ? '<div style="padding-top:18px;border-top:1px solid var(--border);"><h2 style="font-size:1.18rem;color:var(--emerald-900);margin-bottom:8px;">ملخص الدرس</h2><p style="white-space:pre-line;color:var(--ink-muted);margin:0;">' +
        U.escapeHtml(l.summary) +
        "</p></div>"
      : "") +
    "</div>" +
    (attachmentsHtml
      ? '<div class="card" style="overflow:hidden;margin-bottom:22px;">' +
        '<div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--ivory);"><h2 style="font-size:1.15rem;margin:0;color:var(--emerald-900);">المرفقات والملفات</h2></div>' +
        attachmentsHtml +
        "</div>"
      : "") +
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;">' +
    (data.prevLesson
      ? '<a href="#/lesson/' +
        data.prevLesson.id +
        '" class="btn btn-outline">الدرس السابق: ' +
        U.escapeHtml(data.prevLesson.title) +
        "</a>"
      : "<span></span>") +
    (data.nextLesson
      ? '<a href="#/lesson/' +
        data.nextLesson.id +
        '" class="btn btn-primary">الدرس التالي: ' +
        U.escapeHtml(data.nextLesson.title) +
        "</a>"
      : '<a href="#/course/' + encodeURIComponent(course.slug) + '" class="btn btn-outline">العودة للدورة</a>') +
    "</div></div>";
};
