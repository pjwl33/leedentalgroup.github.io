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

  // Hero background: each photo fades in over the previous one and slowly
  // zooms out while it's showing. Reduced-motion visitors keep the first photo.
  var heroPhotos = $('.hero-track img');
  if (heroPhotos.length && !reduceMotion) {
    var current = 0;
    // First photo: keep it visible (no flash), start it zoomed in, then let
    // it ease out like the rest.
    var first = heroPhotos[0];
    first.style.transition = 'none';
    first.style.opacity = '1';
    first.style.transform = 'scale(var(--hero-zoom-from))';
    $('.hero').addClass('js-hero');
    void first.offsetWidth; // apply the starting zoom before animating
    first.classList.add('is-active');
    first.style.transition = first.style.opacity = first.style.transform = '';
    if (heroPhotos.length > 1) {
      setInterval(function() {
        if (document.hidden) return;
        var next = (current + 1) % heroPhotos.length;
        heroPhotos.eq(next).addClass('is-active');
        heroPhotos.eq(current).removeClass('is-active');
        current = next;
      }, 6500);
    }
  }

  // Fade cards in the first time their section scrolls into view (also when
  // jumping there from the top menu). Cards in the same row are staggered.
  if ('IntersectionObserver' in window && !reduceMotion) {
    var groups = [
      $('#services .service-card'),
      $('#team .doctor-card'),
      $('#team .team-card')
    ];
    document.documentElement.classList.add('js-reveal');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);   // only animate the first time
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    groups.forEach(function($group) {
      $group.each(function(i) {
        this.classList.add('reveal');
        this.style.setProperty('--reveal-index', i);
        observer.observe(this);
      });
    });
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
