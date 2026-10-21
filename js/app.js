$(document).ready(function() {
  // Footer copyright year
  var today = new Date();
  $('#current-year').text(today.getFullYear());

  // Highlight today's row in the hours table and mirror it in the hero strip
  var day = today.getDay(); // 0 = Sunday ... 6 = Saturday
  var $row = $('.hours tr[data-day="' + day + '"]');
  if ($row.length) {
    $row.addClass('is-today');
    var isClosed = $row.hasClass('closed');
    var hours = $.trim($row.find('td').last().text());
    $('#today-hours')
      .text(isClosed ? 'Closed today' : hours)
      .toggleClass('is-closed', isClosed);
  }

  // KakaoTalk tile: try to open the app via its URL scheme; if nothing
  // handles it (typically desktop), fall back to the KakaoTalk website.
  $('#kakao-tile').on('click', function() {
    var fallback = this.getAttribute('data-fallback');
    var started = Date.now();
    setTimeout(function() {
      if (!document.hidden && Date.now() - started < 2000) {
        window.location.href = fallback;
      }
    }, 1200);
  });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero background crossfade: load each slide's photo, then rotate.
  var $slides = $('.hero-slide');
  $slides.each(function() {
    var src = this.getAttribute('data-bg');
    if (src) this.style.backgroundImage = "url('" + src + "')";
  });
  if ($slides.length > 1 && !reduceMotion) {
    var current = 0;
    setInterval(function() {
      if (document.hidden) return;
      $slides.eq(current).removeClass('is-active');
      current = (current + 1) % $slides.length;
      $slides.eq(current).addClass('is-active');
    }, 6500);
  }

  // Review feed: repeat the cards until one set is wider than the strip,
  // then duplicate that set so the CSS scroll loops without a gap.
  $('.review-marquee').each(function() {
    var marquee = this;
    var track = marquee.querySelector('.review-track');
    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    function cloneInto(nodes) {
      nodes.forEach(function(node) {
        var copy = node.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('tabindex', '-1');
        copy.setAttribute('data-clone', '');
        track.appendChild(copy);
      });
    }

    var guard = 0;
    while (track.scrollWidth < marquee.clientWidth && guard++ < 10) cloneInto(originals);
    cloneInto(Array.prototype.slice.call(track.children));

    // Keep a steady reading speed (~30px/s) whatever the number of reviews.
    var seconds = Math.max(20, Math.round(track.scrollWidth / 2 / 30));
    track.style.setProperty('--review-duration', seconds + 's');
  });

  // Collapse the mobile menu after tapping a quick-strip link
  $('.hero-strip a.page-scroll').on('click', function() {
    $('.navbar-collapse.in').collapse('hide');
  });
});
