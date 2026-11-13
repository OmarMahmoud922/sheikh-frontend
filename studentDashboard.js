window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.studentDashboard = async function (root, ctx) {
  var U = window.Platform.Utils;
  var I = window.Platform.Icons;
  var Api = window.Platform.Api;

  if (!ctx.user) {
    window.location.hash = "#/login";
    return;
  }
  if (ctx.user.role === "admin") {
    window.location.hash = "#/admin";
    return;
  }

  async function renderDashboard() {
    var data = await Api.get("/api/student/dashboard");
    var sum = data.summary || {};

    var coursesHtml = (data.enrolledCourses || [])
      .map(function (item) {
        var today = item.todayLesson;
        var next = item.nextScheduledLesson;

        var todayBlock = "";
        if (today) {
          var audioBtn = U.safeUrl(today.audioUrl)
            ? '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer" href="' +
              U.escapeHtml(U.safeUrl(today.audioUrl)) +
              '">' +
              I.audio +
              " استماع</a>"
            : "";
          var videoBtn = U.safeUrl(today.videoUrl)
            ? '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer" href="' +
              U.escapeHtml(U.safeUrl(today.videoUrl)) +
              '">' +
              I.video +
              " فيديو</a>"
            : "";

          todayBlock =
            '<div class="today-spotlight" style="background:var(--emerald-50);border-radius:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' +
            '<span class="badge badge-emerald">استمع اليوم — الدرس رقم ' +
            today.lessonSortOrder +
            "</span>" +
            '<span style="font-size:0.84rem;color:var(--ink-muted);">مجدول ليوم: ' +
            U.escapeHtml(U.formatArabicDate(today.scheduledDate)) +
            "</span></div>" +
            '<h3 style="font-size:1.18rem;color:var(--emerald-900);margin-bottom:12px;">' +
            '<a href="#/lesson/' +
            today.lessonId +
            '">' +
            U.escapeHtml(today.lessonTitle) +
            "</a></h3>" +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
            '<a href="#/lesson/' +
            today.lessonId +
            '" class="btn btn-outline btn-sm">فتح الدرس والمرفقات</a>' +
            audioBtn +
            videoBtn +
            '<button type="button" class="btn btn-primary btn-sm" data-complete-eid="' +
            item.enrollmentId +
            '" data-lesson-id="' +
            today.lessonId +
            '">' +
            I.check +
            " تم الاستماع</button>" +
            '<button type="button" class="btn btn-gold btn-sm" data-postpone-eid="' +
            item.enrollmentId +
            '" data-lesson-id="' +
            today.lessonId +
            '">' +
            I.clock +
            " تأجيل للغد</button>" +
            "</div></div>";
        } else if (next) {
          todayBlock =
            '<div class="today-spotlight" style="background:var(--gold-100);border-right-color:var(--gold-600);border-radius:14px;">' +
            '<strong style="display:block;color:var(--gold-700);margin-bottom:4px;">' +
            (item.wasPostponedToday ? "تم تأجيل درس اليوم إلى الغد بنجاح" : "أحسنت! أتممت ورد اليوم") +
            "</strong>" +
            '<p style="margin:0;color:var(--ink-muted);">الدرس القادم في جدولك: <strong>' +
            U.escapeHtml(next.lessonTitle) +
            "</strong> — بتاريخ " +
            U.escapeHtml(U.formatArabicDate(next.scheduledDate)) +
            "</p></div>";
        } else {
          todayBlock =
            '<div class="today-spotlight" style="background:var(--success-bg);border-radius:14px;">' +
            '<strong style="color:var(--emerald-800);">أتممت جميع دروس هذه الدورة بحمد الله!</strong></div>';
        }

        var timelineRows = (item.schedule || [])
          .map(function (row) {
            var isDone = row.status === "completed";
            return (
              '<div class="lesson-list-row">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span class="badge ' +
              (isDone ? "badge-emerald" : "badge-neutral") +
              '">' +
              (isDone ? I.check + " مكتمل" : "الدرس " + row.lessonSortOrder) +
              "</span>" +
              '<a href="#/lesson/' +
              row.lessonId +
              '" style="font-weight:600;">' +
              U.escapeHtml(row.lessonTitle) +
              "</a></div>" +
              '<span style="font-size:0.84rem;color:var(--ink-muted);">' +
              U.escapeHtml(U.formatArabicDate(row.scheduledDate)) +
              "</span></div>"
            );
          })
          .join("");

        return (
          '<section class="card" style="padding:24px;margin-bottom:24px;">' +
          '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px;">' +
          '<div><h2 style="font-size:1.38rem;color:var(--emerald-900);margin-bottom:4px;">' +
          '<a href="#/course/' +
          encodeURIComponent(item.course.slug) +
          '">' +
          U.escapeHtml(item.course.title) +
          "</a></h2>" +
          '<span style="font-size:0.9rem;color:var(--ink-muted);">أتممت ' +
          item.completedLessons +
          " من " +
          item.totalLessons +
          " دروس (" +
          item.progressPercent +
          "%)</span></div>" +
          '<div style="display:flex;gap:8px;align-items:center;">' +
          '<a href="#/course/' +
          encodeURIComponent(item.course.slug) +
          '" class="btn btn-outline btn-sm">صفحة الدورة</a>' +
          '<button type="button" class="btn btn-danger btn-sm" data-unenroll-cid="' +
          item.course.id +
          '">إلغاء الاشتراك</button>' +
          "</div></div>" +
          '<div class="progress-track" style="margin-bottom:18px;"><div class="progress-fill" style="width:' +
          item.progressPercent +
          '%;"></div></div>' +
          todayBlock +
          '<details style="margin-top:12px;">' +
          '<summary style="cursor:pointer;font-weight:700;color:var(--emerald-800);padding:6px 0;">عرض الخطة الكاملة لدروس الدورة (' +
          item.totalLessons +
          " دروس)</summary>" +
          '<div class="card" style="margin-top:10px;overflow:hidden;">' +
          timelineRows +
          "</div></details></section>"
        );
      })
      .join("");

    root.innerHTML =
      '<div class="container section page-enter">' +
      '<div class="section-header"><div>' +
      '<h1 class="section-title">مرحباً، ' +
      U.escapeHtml(ctx.user.name) +
      "</h1>" +
      '<p class="section-subtitle">لوحة متابعة دروسك اليومية وخطة الاستماع المجدولة.</p></div>' +
      '<a href="#/courses" class="btn btn-outline">تصفح دورات أخرى</a></div>' +
      '<div class="stats-grid">' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(sum.enrolledCount || 0) +
      '</span><span class="stat-label">الدورات المشترك بها</span></div>' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(sum.completedLessons || 0) +
      '</span><span class="stat-label">دروس أتممتها</span></div>' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(sum.remainingLessons || 0) +
      '</span><span class="stat-label">دروس متبقية</span></div>' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(sum.overallProgressPercent || 0) +
      '%</span><span class="stat-label">نسبة الإنجاز الكلية</span></div>' +
      "</div>" +
      (coursesHtml ||
        '<div class="card" style="padding:36px;text-align:center;">' +
          '<h2 style="color:var(--emerald-900);margin-bottom:8px;">لم تشترك في أي دورة بعد</h2>' +
          '<p style="color:var(--ink-muted);margin-bottom:18px;">اختر دورة علمية لتبدأ جدولك اليومي المنظم تلقائياً.</p>' +
          '<a href="#/courses" class="btn btn-gold">استكشف الدورات الآن</a></div>') +
      "</div>";
  }

  root.onclick = async function (e) {
    var compBtn = e.target.closest("button[data-complete-eid]");
    if (compBtn) {
      compBtn.disabled = true;
      try {
        await Api.post("/api/student/schedule/complete", {
          enrollmentId: Number(compBtn.getAttribute("data-complete-eid")),
          lessonId: Number(compBtn.getAttribute("data-lesson-id"))
        });
        U.toast("بارك الله فيك! تم تسجيل إتمام الدرس وحفظ تقدمك.");
        await renderDashboard();
      } catch (err) {
        U.toast(err.message, "error");
        compBtn.disabled = false;
      }
      return;
    }

    var postBtn = e.target.closest("button[data-postpone-eid]");
    if (postBtn) {
      postBtn.disabled = true;
      try {
        await Api.post("/api/student/schedule/postpone", {
          enrollmentId: Number(postBtn.getAttribute("data-postpone-eid")),
          lessonId: Number(postBtn.getAttribute("data-lesson-id"))
        });
        U.toast("تم تأجيل الدرس إلى الغد مع الحفاظ على الترتيب.");
        await renderDashboard();
      } catch (err) {
        U.toast(err.message, "error");
        postBtn.disabled = false;
      }
      return;
    }

    var unBtn = e.target.closest("button[data-unenroll-cid]");
    if (unBtn) {
      unBtn.disabled = true;
      try {
        await Api.del("/api/student/enroll/" + unBtn.getAttribute("data-unenroll-cid"));
        U.toast("تم إلغاء الاشتراك من الدورة.");
        await renderDashboard();
      } catch (err) {
        U.toast(err.message, "error");
        unBtn.disabled = false;
      }
    }
  };

  await renderDashboard();
};
