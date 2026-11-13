window.Platform = window.Platform || {};

(function () {
  var U = window.Platform.Utils;
  var I = window.Platform.Icons;

  window.Platform.Components = {
    renderSkeletonPage: function () {
      return (
        '<div class="container section">' +
        '<div class="skeleton" style="height:240px;margin-bottom:24px;"></div>' +
        '<div class="courses-grid">' +
        '<div class="skeleton" style="height:310px;"></div>' +
        '<div class="skeleton" style="height:310px;"></div>' +
        '<div class="skeleton" style="height:310px;"></div>' +
        "</div></div>"
      );
    },

    renderCourseCard: function (course) {
      var st = U.statusLabel(course.status);
      var cover = U.resolveAssetUrl(course.coverImage);
      var lessonCount = Number(course.lessonCount || 0);
      return (
        '<article class="card card-hover course-card">' +
        '<a href="#/course/' +
        encodeURIComponent(course.slug) +
        '" class="course-cover-wrap">' +
        '<img src="' +
        U.escapeHtml(cover) +
        '" alt="' +
        U.escapeHtml(course.title) +
        '" loading="lazy" />' +
        '<span class="badge ' +
        st.cls +
        ' course-status-tag">' +
        U.escapeHtml(st.text) +
        "</span>" +
        "</a>" +
        '<div class="course-body">' +
        '<h3 class="course-title"><a href="#/course/' +
        encodeURIComponent(course.slug) +
        '">' +
        U.escapeHtml(course.title) +
        "</a></h3>" +
        '<p class="course-desc">' +
        U.escapeHtml(course.shortDescription || "") +
        "</p>" +
        '<div class="course-meta">' +
        "<span>" +
        I.book +
        " " +
        lessonCount +
        " دروس</span>" +
        '<a class="btn btn-outline btn-sm" href="#/course/' +
        encodeURIComponent(course.slug) +
        '">تصفح الدورة</a>' +
        "</div></div></article>"
      );
    },

    renderAnnouncementCard: function (ann) {
      if (!ann) return "";
      var linksHtml = (ann.broadcastLinks || [])
        .map(function (lnk) {
          var safe = U.safeUrl(lnk.url);
          if (!safe) return "";
          return (
            '<a class="btn btn-gold btn-sm" target="_blank" rel="noopener noreferrer" href="' +
            U.escapeHtml(safe) +
            '">' +
            U.escapeHtml(lnk.label) +
            " " +
            I.external +
            "</a>"
          );
        })
        .join("");

      var courseBtn = ann.courseSlug
        ? '<a class="btn btn-outline btn-sm" href="#/course/' +
          encodeURIComponent(ann.courseSlug) +
          '">الذهاب للدورة: ' +
          U.escapeHtml(ann.courseTitle || "") +
          "</a>"
        : "";

      return (
        '<div class="announcement-card" data-countdown-target="' +
        U.escapeHtml(ann.eventDatetime) +
        '">' +
        "<div>" +
        '<span class="badge badge-gold" style="margin-bottom:10px;">' +
        I.calendar +
        " الدرس القادم المباشر</span>" +
        '<h2 style="font-size:1.55rem;margin-bottom:8px;color:var(--emerald-900);">' +
        U.escapeHtml(ann.title) +
        "</h2>" +
        (ann.description
          ? '<p style="color:var(--ink-muted);margin:0 0 12px;">' +
            U.escapeHtml(ann.description) +
            "</p>"
          : "") +
        '<p style="font-weight:700;color:var(--emerald-800);margin:0 0 16px;">' +
        I.clock +
        " الموعد: " +
        U.escapeHtml(U.formatArabicDateTime(ann.eventDatetime)) +
        "</p>" +
        '<div style="display:flex;flex-wrap:wrap;gap:10px;">' +
        linksHtml +
        courseBtn +
        "</div>" +
        "</div>" +
        '<div>' +
        '<div style="font-size:0.86rem;font-weight:700;color:var(--ink-muted);margin-bottom:8px;text-align:center;">الوقت المتبقي على البث</div>' +
        '<div class="countdown-grid">' +
        '<div class="countdown-box"><span class="countdown-num" data-cd="days">0</span><span class="countdown-lbl">يوم</span></div>' +
        '<div class="countdown-box"><span class="countdown-num" data-cd="hours">0</span><span class="countdown-lbl">ساعة</span></div>' +
        '<div class="countdown-box"><span class="countdown-num" data-cd="minutes">0</span><span class="countdown-lbl">دقيقة</span></div>' +
        '<div class="countdown-box"><span class="countdown-num" data-cd="seconds">0</span><span class="countdown-lbl">ثانية</span></div>' +
        "</div></div></div>"
      );
    },

    bindCountdowns: function (container) {
      var cards = container.querySelectorAll("[data-countdown-target]");
      if (!cards.length) return null;
      function update() {
        var now = Date.now();
        cards.forEach(function (card) {
          var targetMs = new Date(card.getAttribute("data-countdown-target")).getTime();
          var diff = Math.max(0, targetMs - now);
          var days = Math.floor(diff / 86400000);
          var hours = Math.floor((diff % 86400000) / 3600000);
          var minutes = Math.floor((diff % 3600000) / 60000);
          var seconds = Math.floor((diff % 60000) / 1000);
          card.querySelector('[data-cd="days"]').textContent = String(days);
          card.querySelector('[data-cd="hours"]').textContent = String(hours);
          card.querySelector('[data-cd="minutes"]').textContent = String(minutes);
          card.querySelector('[data-cd="seconds"]').textContent = String(seconds);
        });
      }
      update();
      return window.setInterval(update, 1000);
    }
  };
})();
