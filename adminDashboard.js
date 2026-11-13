window.Platform = window.Platform || {};
window.Platform.Pages = window.Platform.Pages || {};

window.Platform.Pages.adminDashboard = async function (root, ctx) {
  var U = window.Platform.Utils;
  var Api = window.Platform.Api;

  if (!ctx.user || ctx.user.role !== "admin") {
    window.location.hash = "#/admin/login";
    return;
  }

  var state = {
    tab: "courses",
    overview: null,
    selectedCourseId: null,
    courseLessons: [],
    editingCourseId: null,
    editingLessonId: null,
    editingAnnouncementId: null
  };

  async function loadOverview() {
    state.overview = await Api.get("/api/admin/overview");
    if (!state.selectedCourseId && state.overview.courses.length) {
      state.selectedCourseId = state.overview.courses[0].id;
    }
    if (state.selectedCourseId) {
      var res = await Api.get("/api/admin/courses/" + state.selectedCourseId + "/lessons");
      state.courseLessons = res.lessons || [];
    }
  }

  function renderCoursesTab() {
    var courses = state.overview.courses || [];
    var editing = courses.find(function (c) {
      return c.id === state.editingCourseId;
    });

    var listHtml = courses
      .map(function (c, idx) {
        return (
          '<div class="lesson-list-row">' +
          '<div><strong style="color:var(--emerald-900);">' +
          U.escapeHtml(c.title) +
          '</strong><div style="font-size:0.84rem;color:var(--ink-muted);">' +
          Number(c.lessonCount || 0) +
          " دروس • " +
          (c.isPublished ? "منشورة" : "مسودة") +
          " • " +
          U.escapeHtml(U.statusLabel(c.status).text) +
          "</div></div>" +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
          (idx > 0
            ? '<button type="button" class="btn btn-ghost btn-sm" data-move-course="' + idx + '" data-dir="-1">أعلى</button>'
            : "") +
          (idx < courses.length - 1
            ? '<button type="button" class="btn btn-ghost btn-sm" data-move-course="' + idx + '" data-dir="1">أسفل</button>'
            : "") +
          '<button type="button" class="btn btn-outline btn-sm" data-toggle-pub="' +
          c.id +
          '" data-val="' +
          (c.isPublished ? "0" : "1") +
          '">' +
          (c.isPublished ? "إلغاء النشر" : "نشر") +
          "</button>" +
          '<button type="button" class="btn btn-outline btn-sm" data-edit-course="' +
          c.id +
          '">تعديل</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-del-course="' +
          c.id +
          '">حذف</button>' +
          "</div></div>"
        );
      })
      .join("");

    return (
      '<div class="card" style="padding:22px;margin-bottom:20px;">' +
      '<h2 style="font-size:1.25rem;color:var(--emerald-900);margin-bottom:14px;">' +
      (editing ? "تعديل الدورة: " + U.escapeHtml(editing.title) : "إضافة دورة جديدة") +
      "</h2>" +
      '<form id="admin-course-form">' +
      '<div class="form-grid-2">' +
      '<div class="field"><label>عنوان الدورة *</label><input class="input" name="title" required value="' +
      U.escapeHtml(editing ? editing.title : "") +
      '" /></div>' +
      '<div class="field"><label>الحالة</label><select class="select" name="status">' +
      '<option value="active"' +
      (!editing || editing.status === "active" ? " selected" : "") +
      '>نشطة</option>' +
      '<option value="upcoming"' +
      (editing && editing.status === "upcoming" ? " selected" : "") +
      '>قريباً</option>' +
      '<option value="completed"' +
      (editing && editing.status === "completed" ? " selected" : "") +
      '>مكتملة</option>' +
      "</select></div></div>" +
      '<div class="field"><label>وصف مختصر</label><textarea class="textarea" name="shortDescription" style="min-height:70px;">' +
      U.escapeHtml(editing ? editing.shortDescription : "") +
      "</textarea></div>" +
      '<div class="field"><label>المقال التعريفي بالدورة</label><textarea class="textarea" name="introArticle">' +
      U.escapeHtml(editing ? editing.introArticle : "") +
      "</textarea></div>" +
      '<div class="form-grid-2">' +
      '<div class="field"><label>صورة الغلاف (رابط أو اختر صورة جاهزة)</label><input class="input" name="coverImage" value="' +
      U.escapeHtml(editing ? editing.coverImage : "./assets/images/course-sunnah.jpg") +
      '" /></div>' +
      '<div class="field"><label>رابط المقدمة (اختياري)</label><input class="input" name="introLink" value="' +
      U.escapeHtml(editing && editing.introLink ? editing.introLink : "") +
      '" /></div></div>' +
      '<div class="form-grid-2">' +
      '<div class="field"><label>تاريخ البداية</label><input class="input" type="date" name="startDate" value="' +
      U.escapeHtml(editing && editing.startDate ? editing.startDate : "") +
      '" /></div>' +
      '<div class="field"><label>تاريخ النهاية</label><input class="input" type="date" name="endDate" value="' +
      U.escapeHtml(editing && editing.endDate ? editing.endDate : "") +
      '" /></div></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<button type="submit" class="btn btn-primary">' +
      (editing ? "حفظ التعديلات" : "إضافة الدورة") +
      "</button>" +
      (editing ? '<button type="button" id="cancel-edit-course" class="btn btn-outline">إلغاء التعديل</button>' : "") +
      "</div></form></div>" +
      '<div class="card" style="overflow:hidden;">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--ivory);"><h3 style="margin:0;font-size:1.1rem;color:var(--emerald-900);">قائمة الدورات (' +
      courses.length +
      ")</h3></div>" +
      (listHtml || '<div style="padding:20px;">لا توجد دورات.</div>') +
      "</div>"
    );
  }

  function renderLessonsTab() {
    var courses = state.overview.courses || [];
    var courseOpts = courses
      .map(function (c) {
        return (
          '<option value="' +
          c.id +
          '"' +
          (c.id === state.selectedCourseId ? " selected" : "") +
          ">" +
          U.escapeHtml(c.title) +
          "</option>"
        );
      })
      .join("");

    var editing = state.courseLessons.find(function (l) {
      return l.id === state.editingLessonId;
    });

    var lessonsList = state.courseLessons
      .map(function (l, idx) {
        var atts = (l.attachments || [])
          .map(function (a) {
            return (
              '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;background:var(--ivory);border-radius:8px;margin-top:6px;font-size:0.84rem;">' +
              "<span>" +
              U.escapeHtml(a.title) +
              "</span>" +
              '<button type="button" class="btn btn-danger btn-sm" data-del-att="' +
              a.id +
              '">حذف المرفق</button></div>'
            );
          })
          .join("");

        return (
          '<div class="lesson-list-row" style="flex-direction:column;align-items:stretch;">' +
          '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center;">' +
          '<div><strong>' +
          (idx + 1) +
          ". " +
          U.escapeHtml(l.title) +
          "</strong></div>" +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
          (idx > 0
            ? '<button type="button" class="btn btn-ghost btn-sm" data-move-lesson="' + idx + '" data-dir="-1">أعلى</button>'
            : "") +
          (idx < state.courseLessons.length - 1
            ? '<button type="button" class="btn btn-ghost btn-sm" data-move-lesson="' + idx + '" data-dir="1">أسفل</button>'
            : "") +
          '<button type="button" class="btn btn-outline btn-sm" data-edit-lesson="' +
          l.id +
          '">تعديل</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-del-lesson="' +
          l.id +
          '">حذف</button>' +
          "</div></div>" +
          atts +
          '<form class="att-inline-form" data-att-lesson="' +
          l.id +
          '" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">' +
          '<input class="input" name="title" placeholder="اسم المرفق (مثال: ملخص PDF)" style="flex:1;min-width:160px;" required />' +
          '<input class="input" name="fileUrl" placeholder="رابط الملف الخارجي" style="flex:1;min-width:200px;" required />' +
          '<button type="submit" class="btn btn-outline btn-sm">إضافة مرفق</button>' +
          "</form></div>"
        );
      })
      .join("");

    return (
      '<div class="card" style="padding:20px;margin-bottom:20px;">' +
      '<div class="field" style="margin:0;"><label>اختر الدورة لإدارة دروسها</label>' +
      '<select id="admin-lesson-course-select" class="select">' +
      courseOpts +
      "</select></div></div>" +
      '<div class="card" style="padding:22px;margin-bottom:20px;">' +
      '<h2 style="font-size:1.25rem;color:var(--emerald-900);margin-bottom:14px;">' +
      (editing ? "تعديل الدرس" : "إضافة درس جديد") +
      "</h2>" +
      '<form id="admin-lesson-form">' +
      '<div class="field"><label>عنوان الدرس *</label><input class="input" name="title" required value="' +
      U.escapeHtml(editing ? editing.title : "") +
      '" /></div>' +
      '<div class="field"><label>ملخص الدرس</label><textarea class="textarea" name="summary">' +
      U.escapeHtml(editing ? editing.summary : "") +
      "</textarea></div>" +
      '<div class="form-grid-2">' +
      '<div class="field"><label>رابط الصوت (اختياري)</label><input class="input" name="audioUrl" value="' +
      U.escapeHtml(editing && editing.audioUrl ? editing.audioUrl : "") +
      '" /></div>' +
      '<div class="field"><label>رابط الفيديو (اختياري)</label><input class="input" name="videoUrl" value="' +
      U.escapeHtml(editing && editing.videoUrl ? editing.videoUrl : "") +
      '" /></div></div>' +
      '<div class="field"><label>رابط الاختبار (اختياري)</label><input class="input" name="quizUrl" value="' +
      U.escapeHtml(editing && editing.quizUrl ? editing.quizUrl : "") +
      '" /></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<button type="submit" class="btn btn-primary">' +
      (editing ? "حفظ الدرس" : "إضافة الدرس") +
      "</button>" +
      (editing ? '<button type="button" id="cancel-edit-lesson" class="btn btn-outline">إلغاء</button>' : "") +
      "</div></form></div>" +
      '<div class="card" style="overflow:hidden;">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--ivory);"><h3 style="margin:0;font-size:1.1rem;color:var(--emerald-900);">دروس الدورة بالترتيب (' +
      state.courseLessons.length +
      ")</h3></div>" +
      (lessonsList || '<div style="padding:20px;">لا توجد دروس لهذه الدورة.</div>') +
      "</div>"
    );
  }

  function renderAnnouncementsTab() {
    var list = state.overview.announcements || [];
    var courses = state.overview.courses || [];
    var editing = list.find(function (a) {
      return a.id === state.editingAnnouncementId;
    });

    var courseOpts =
      '<option value="">-- بدون دورة محددة --</option>' +
      courses
        .map(function (c) {
          return (
            '<option value="' +
            c.id +
            '"' +
            (editing && editing.courseId === c.id ? " selected" : "") +
            ">" +
            U.escapeHtml(c.title) +
            "</option>"
          );
        })
        .join("");

    var defaultFrom = new Date().toISOString().slice(0, 16);
    var defaultEvent = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16);
    var defaultUntil = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16);

    var linksText = editing
      ? (editing.broadcastLinks || [])
          .map(function (l) {
            return l.label + " | " + l.url;
          })
          .join("\n")
      : "البث عبر يوتيوب | https://www.youtube.com";

    var itemsHtml = list
      .map(function (a) {
        return (
          '<div class="lesson-list-row">' +
          '<div><strong>' +
          U.escapeHtml(a.title) +
          '</strong><div style="font-size:0.84rem;color:var(--ink-muted);">' +
          U.escapeHtml(U.formatArabicDateTime(a.eventDatetime)) +
          " • " +
          (a.isActive ? "مفعّل" : "معطّل") +
          "</div></div>" +
          '<div style="display:flex;gap:6px;">' +
          '<button type="button" class="btn btn-outline btn-sm" data-toggle-ann="' +
          a.id +
          '" data-val="' +
          (a.isActive ? "0" : "1") +
          '">' +
          (a.isActive ? "إيقاف" : "تفعيل") +
          "</button>" +
          '<button type="button" class="btn btn-outline btn-sm" data-edit-ann="' +
          a.id +
          '">تعديل</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-del-ann="' +
          a.id +
          '">حذف</button>' +
          "</div></div>"
        );
      })
      .join("");

    return (
      '<div class="card" style="padding:22px;margin-bottom:20px;">' +
      '<h2 style="font-size:1.25rem;color:var(--emerald-900);margin-bottom:14px;">' +
      (editing ? "تعديل الإعلان" : "إضافة إعلان درس قادم") +
      "</h2>" +
      '<form id="admin-ann-form">' +
      '<div class="form-grid-2">' +
      '<div class="field"><label>عنوان الدرس / البث *</label><input class="input" name="title" required value="' +
      U.escapeHtml(editing ? editing.title : "") +
      '" /></div>' +
      '<div class="field"><label>الدورة المرتبطة</label><select class="select" name="courseId">' +
      courseOpts +
      "</select></div></div>" +
      '<div class="field"><label>وصف مختصر</label><textarea class="textarea" name="description" style="min-height:70px;">' +
      U.escapeHtml(editing ? editing.description : "") +
      "</textarea></div>" +
      '<div class="form-grid-2">' +
      '<div class="field"><label>توقيت الدرس القادم *</label><input class="input" type="datetime-local" name="eventDatetime" required value="' +
      U.escapeHtml(editing ? String(editing.eventDatetime).slice(0, 16) : defaultEvent) +
      '" /></div>' +
      '<div class="field"><label>يظهر من *</label><input class="input" type="datetime-local" name="visibleFrom" required value="' +
      U.escapeHtml(editing ? String(editing.visibleFrom).slice(0, 16) : defaultFrom) +
      '" /></div></div>' +
      '<div class="field"><label>يختفي تلقائياً في *</label><input class="input" type="datetime-local" name="visibleUntil" required value="' +
      U.escapeHtml(editing ? String(editing.visibleUntil).slice(0, 16) : defaultUntil) +
      '" /></div>' +
      '<div class="field"><label>روابط البث (سطر لكل رابط بصيغة: الاسم | الرابط)</label><textarea class="textarea" name="broadcastLinksText" style="min-height:80px;">' +
      U.escapeHtml(linksText) +
      "</textarea></div>" +
      '<button type="submit" class="btn btn-primary">' +
      (editing ? "حفظ الإعلان" : "نشر الإعلان") +
      "</button></form></div>" +
      '<div class="card" style="overflow:hidden;">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--ivory);"><h3 style="margin:0;font-size:1.1rem;">الإعلانات المسجلة</h3></div>' +
      (itemsHtml || '<div style="padding:20px;">لا توجد إعلانات.</div>') +
      "</div>"
    );
  }

  function renderSocialTab() {
    var links = state.overview.socialLinks || [];
    var rows = links
      .map(function (s) {
        return (
          '<div class="lesson-list-row">' +
          '<div><strong>' +
          U.escapeHtml(s.platformName) +
          '</strong> <span style="font-size:0.85rem;color:var(--ink-muted);">(' +
          U.escapeHtml(s.url) +
          ")</span></div>" +
          '<button type="button" class="btn btn-danger btn-sm" data-del-social="' +
          s.id +
          '">حذف</button></div>'
        );
      })
      .join("");

    return (
      '<div class="card" style="padding:22px;margin-bottom:20px;">' +
      '<h2 style="font-size:1.25rem;color:var(--emerald-900);margin-bottom:14px;">إضافة رابط تواصل</h2>' +
      '<form id="admin-social-form" class="form-grid-2">' +
      '<div class="field"><label>اسم المنصة</label><input class="input" name="platformName" required placeholder="مثال: قناة التليجرام" /></div>' +
      '<div class="field"><label>الرابط</label><input class="input" name="url" required placeholder="https://t.me/..." /></div>' +
      '<div><button type="submit" class="btn btn-primary">إضافة الرابط</button></div>' +
      "</form></div>" +
      '<div class="card" style="overflow:hidden;">' +
      (rows || '<div style="padding:20px;">لا توجد روابط تواصل.</div>') +
      "</div>"
    );
  }

  function renderSettingsTab() {
    var s = state.overview.settings || {};
    return (
      '<div class="card" style="padding:24px;">' +
      '<h2 style="font-size:1.25rem;color:var(--emerald-900);margin-bottom:14px;">إعدادات المنصة العامة</h2>' +
      '<form id="admin-settings-form">' +
      '<div class="form-grid-2">' +
      '<div class="field"><label>اسم المنصة</label><input class="input" name="siteName" value="' +
      U.escapeHtml(s.siteName || "") +
      '" /></div>' +
      '<div class="field"><label>اسم الشيخ</label><input class="input" name="sheikhName" value="' +
      U.escapeHtml(s.sheikhName || "") +
      '" /></div></div>' +
      '<div class="field"><label>العنوان الرئيسي (Hero)</label><input class="input" name="heroTitle" value="' +
      U.escapeHtml(s.heroTitle || "") +
      '" /></div>' +
      '<div class="field"><label>الوصف التعريفي (Hero)</label><textarea class="textarea" name="heroSubtitle">' +
      U.escapeHtml(s.heroSubtitle || "") +
      "</textarea></div>" +
      '<div class="form-grid-2">' +
      '<div class="field"><label>بريد التواصل</label><input class="input" name="contactEmail" value="' +
      U.escapeHtml(s.contactEmail || "") +
      '" /></div>' +
      '<div class="field"><label>رقم الهاتف</label><input class="input" name="contactPhone" value="' +
      U.escapeHtml(s.contactPhone || "") +
      '" /></div></div>' +
      '<div class="field"><label>نبذة التذييل (Footer)</label><textarea class="textarea" name="footerAbout" style="min-height:80px;">' +
      U.escapeHtml(s.footerAbout || "") +
      "</textarea></div>" +
      '<button type="submit" class="btn btn-primary">حفظ الإعدادات</button>' +
      "</form></div>"
    );
  }

  function render() {
    var st = state.overview.stats || {};
    var body = "";
    if (state.tab === "courses") body = renderCoursesTab();
    else if (state.tab === "lessons") body = renderLessonsTab();
    else if (state.tab === "announcements") body = renderAnnouncementsTab();
    else if (state.tab === "social") body = renderSocialTab();
    else body = renderSettingsTab();

    root.innerHTML =
      '<div class="container section page-enter">' +
      '<div class="section-header"><div>' +
      '<h1 class="section-title">لوحة تحكم الإدارة</h1>' +
      '<p class="section-subtitle">إدارة كاملة للدورات والدروس والمرفقات والإعلانات وإعدادات المنصة.</p>' +
      "</div></div>" +
      '<div class="stats-grid">' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(st.coursesCount || 0) +
      '</span><span class="stat-label">الدورات</span></div>' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(st.lessonsCount || 0) +
      '</span><span class="stat-label">الدروس</span></div>' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(st.studentsCount || 0) +
      '</span><span class="stat-label">الطلاب المسجلون</span></div>' +
      '<div class="card stat-card"><span class="stat-val">' +
      Number(st.enrollmentsCount || 0) +
      '</span><span class="stat-label">الاشتراكات</span></div>' +
      "</div>" +
      '<div class="admin-tabs">' +
      '<button type="button" class="admin-tab' +
      (state.tab === "courses" ? " active" : "") +
      '" data-tab="courses">الدورات</button>' +
      '<button type="button" class="admin-tab' +
      (state.tab === "lessons" ? " active" : "") +
      '" data-tab="lessons">الدروس والمرفقات</button>' +
      '<button type="button" class="admin-tab' +
      (state.tab === "announcements" ? " active" : "") +
      '" data-tab="announcements">الإعلان القادم</button>' +
      '<button type="button" class="admin-tab' +
      (state.tab === "social" ? " active" : "") +
      '" data-tab="social">روابط التواصل</button>' +
      '<button type="button" class="admin-tab' +
      (state.tab === "settings" ? " active" : "") +
      '" data-tab="settings">إعدادات الموقع</button>' +
      "</div>" +
      body +
      "</div>";
  }

  root.onclick = async function (e) {
    var tabBtn = e.target.closest("button[data-tab]");
    if (tabBtn) {
      state.tab = tabBtn.getAttribute("data-tab");
      render();
      return;
    }

    if (e.target.id === "cancel-edit-course") {
      state.editingCourseId = null;
      render();
      return;
    }
    if (e.target.id === "cancel-edit-lesson") {
      state.editingLessonId = null;
      render();
      return;
    }

    var editCourse = e.target.closest("button[data-edit-course]");
    if (editCourse) {
      state.editingCourseId = Number(editCourse.getAttribute("data-edit-course"));
      render();
      return;
    }

    var togglePub = e.target.closest("button[data-toggle-pub]");
    if (togglePub) {
      await Api.patch("/api/admin/courses/" + togglePub.getAttribute("data-toggle-pub") + "/publish", {
        isPublished: togglePub.getAttribute("data-val") === "1"
      });
      await loadOverview();
      render();
      U.toast("تم تحديث حالة النشر.");
      return;
    }

    var delCourse = e.target.closest("button[data-del-course]");
    if (delCourse) {
      await Api.del("/api/admin/courses/" + delCourse.getAttribute("data-del-course"));
      await loadOverview();
      render();
      U.toast("تم حذف الدورة.");
      return;
    }

    var moveCourse = e.target.closest("button[data-move-course]");
    if (moveCourse) {
      var idx = Number(moveCourse.getAttribute("data-move-course"));
      var dir = Number(moveCourse.getAttribute("data-dir"));
      var arr = state.overview.courses.slice();
      var tmp = arr[idx];
      arr[idx] = arr[idx + dir];
      arr[idx + dir] = tmp;
      await Api.post("/api/admin/courses/reorder", {
        orderedIds: arr.map(function (c) {
          return c.id;
        })
      });
      await loadOverview();
      render();
      return;
    }

    var editLesson = e.target.closest("button[data-edit-lesson]");
    if (editLesson) {
      state.editingLessonId = Number(editLesson.getAttribute("data-edit-lesson"));
      render();
      return;
    }

    var delLesson = e.target.closest("button[data-del-lesson]");
    if (delLesson) {
      await Api.del("/api/admin/lessons/" + delLesson.getAttribute("data-del-lesson"));
      await loadOverview();
      render();
      U.toast("تم حذف الدرس.");
      return;
    }

    var moveLesson = e.target.closest("button[data-move-lesson]");
    if (moveLesson) {
      var lIdx = Number(moveLesson.getAttribute("data-move-lesson"));
      var lDir = Number(moveLesson.getAttribute("data-dir"));
      var lArr = state.courseLessons.slice();
      var lTmp = lArr[lIdx];
      lArr[lIdx] = lArr[lIdx + lDir];
      lArr[lIdx + lDir] = lTmp;
      await Api.post("/api/admin/lessons/reorder", {
        orderedIds: lArr.map(function (l) {
          return l.id;
        })
      });
      await loadOverview();
      render();
      return;
    }

    var delAtt = e.target.closest("button[data-del-att]");
    if (delAtt) {
      await Api.del("/api/admin/attachments/" + delAtt.getAttribute("data-del-att"));
      await loadOverview();
      render();
      U.toast("تم حذف المرفق.");
      return;
    }

    var editAnn = e.target.closest("button[data-edit-ann]");
    if (editAnn) {
      state.editingAnnouncementId = Number(editAnn.getAttribute("data-edit-ann"));
      render();
      return;
    }

    var toggleAnn = e.target.closest("button[data-toggle-ann]");
    if (toggleAnn) {
      await Api.patch("/api/admin/announcements/" + toggleAnn.getAttribute("data-toggle-ann") + "/toggle", {
        isActive: toggleAnn.getAttribute("data-val") === "1"
      });
      await loadOverview();
      render();
      return;
    }

    var delAnn = e.target.closest("button[data-del-ann]");
    if (delAnn) {
      await Api.del("/api/admin/announcements/" + delAnn.getAttribute("data-del-ann"));
      await loadOverview();
      render();
      return;
    }

    var delSoc = e.target.closest("button[data-del-social]");
    if (delSoc) {
      await Api.del("/api/admin/social-links/" + delSoc.getAttribute("data-del-social"));
      await loadOverview();
      await ctx.refreshBootstrap();
      render();
    }
  };

  root.onchange = async function (e) {
    if (e.target.id === "admin-lesson-course-select") {
      state.selectedCourseId = Number(e.target.value);
      state.editingLessonId = null;
      await loadOverview();
      render();
    }
  };

  root.onsubmit = async function (e) {
    e.preventDefault();
    var form = e.target;
    try {
      if (form.id === "admin-course-form") {
        var payload = {
          title: form.title.value,
          status: form.status.value,
          shortDescription: form.shortDescription.value,
          introArticle: form.introArticle.value,
          coverImage: form.coverImage.value,
          introLink: form.introLink.value || null,
          startDate: form.startDate.value || null,
          endDate: form.endDate.value || null
        };
        if (state.editingCourseId) {
          await Api.put("/api/admin/courses/" + state.editingCourseId, payload);
          state.editingCourseId = null;
          U.toast("تم تحديث الدورة.");
        } else {
          await Api.post("/api/admin/courses", payload);
          U.toast("تمت إضافة الدورة بنجاح.");
        }
        await loadOverview();
        await ctx.refreshBootstrap();
        render();
        return;
      }

      if (form.id === "admin-lesson-form") {
        var lPayload = {
          courseId: state.selectedCourseId,
          title: form.title.value,
          summary: form.summary.value,
          audioUrl: form.audioUrl.value || null,
          videoUrl: form.videoUrl.value || null,
          quizUrl: form.quizUrl.value || null
        };
        if (state.editingLessonId) {
          await Api.put("/api/admin/lessons/" + state.editingLessonId, lPayload);
          state.editingLessonId = null;
          U.toast("تم تحديث الدرس.");
        } else {
          await Api.post("/api/admin/lessons", lPayload);
          U.toast("تمت إضافة الدرس.");
        }
        await loadOverview();
        render();
        return;
      }

      if (form.hasAttribute("data-att-lesson")) {
        var lid = form.getAttribute("data-att-lesson");
        await Api.post("/api/admin/lessons/" + lid + "/attachments", {
          title: form.title.value,
          fileUrl: form.fileUrl.value,
          fileType: "file"
        });
        await loadOverview();
        render();
        U.toast("تمت إضافة المرفق.");
        return;
      }

      if (form.id === "admin-ann-form") {
        var links = form.broadcastLinksText.value
          .split("\n")
          .map(function (line) {
            var parts = line.split("|");
            return {
              label: (parts[0] || "").trim(),
              url: (parts[1] || "").trim()
            };
          })
          .filter(function (x) {
            return x.label && x.url;
          });
        var aPayload = {
          title: form.title.value,
          courseId: form.courseId.value ? Number(form.courseId.value) : null,
          description: form.description.value,
          eventDatetime: new Date(form.eventDatetime.value).toISOString(),
          visibleFrom: new Date(form.visibleFrom.value).toISOString(),
          visibleUntil: new Date(form.visibleUntil.value).toISOString(),
          broadcastLinks: links,
          isActive: true
        };
        if (state.editingAnnouncementId) {
          await Api.put("/api/admin/announcements/" + state.editingAnnouncementId, aPayload);
          state.editingAnnouncementId = null;
        } else {
          await Api.post("/api/admin/announcements", aPayload);
        }
        await loadOverview();
        await ctx.refreshBootstrap();
        render();
        U.toast("تم حفظ الإعلان.");
        return;
      }

      if (form.id === "admin-social-form") {
        await Api.post("/api/admin/social-links", {
          platformName: form.platformName.value,
          url: form.url.value,
          iconKey: "globe"
        });
        await loadOverview();
        await ctx.refreshBootstrap();
        render();
        U.toast("تمت إضافة الرابط.");
        return;
      }

      if (form.id === "admin-settings-form") {
        await Api.put("/api/admin/settings", {
          siteName: form.siteName.value,
          sheikhName: form.sheikhName.value,
          heroTitle: form.heroTitle.value,
          heroSubtitle: form.heroSubtitle.value,
          contactEmail: form.contactEmail.value,
          contactPhone: form.contactPhone.value,
          footerAbout: form.footerAbout.value
        });
        await loadOverview();
        await ctx.refreshBootstrap();
        render();
        U.toast("تم حفظ إعدادات المنصة.");
      }
    } catch (err) {
      U.toast(err.message, "error");
    }
  };

  await loadOverview();
  render();
};
