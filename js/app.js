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

  // Hero background carousel: slide left to the next photo every few
  // seconds. A copy of the first photo sits at the end so the loop wraps
  // around seamlessly.
  var track = document.querySelector('.hero-track');
  if (track && track.children.length > 1 && !reduceMotion) {
    var total = track.children.length;
    var first = track.children[0].cloneNode(true);
    first.removeAttribute('loading');
    track.appendChild(first);

    var index = 0;
    var goTo = function(i, animate) {
      track.classList.toggle('is-sliding', animate);
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
    };
    track.addEventListener('transitionend', function(e) {
      if (e.target !== track) return;
      if (index === total) {           // landed on the copy: jump back to the real first photo
        index = 0;
        goTo(0, false);
      }
    });
    setInterval(function() {
      if (document.hidden) return;
      index += 1;
      goTo(index, true);
    }, 6000);
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
