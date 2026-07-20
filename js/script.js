/**
 * Dwarkamai Digital Seva CSC - Main JavaScript
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initStickyHeader();
    initScrollTop();
    initCounters();
    initLightbox();
    initGalleryFilter();
    initServiceFilter();
    initContactForm();
    initActiveNav();
    initAOS();
  });

  function initLoader() {
    var loader = document.getElementById('page-loader');
    if (!loader) return;
    window.addEventListener('load', function () {
      setTimeout(function () { loader.classList.add('hidden'); }, 400);
    });
    setTimeout(function () { loader.classList.add('hidden'); }, 2800);
  }

  function initStickyHeader() {
    var header = document.querySelector('.main-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  function initScrollTop() {
    var btn = document.getElementById('scrollToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 350);
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var start = performance.now();
      var duration = 2000;
      function update(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(update);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(update);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animate(entry.target);
        }
      });
    }, { threshold: 0.45 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  function initLightbox() {
    var items = document.querySelectorAll('[data-lightbox]');
    if (!items.length) return;
    var overlay = document.getElementById('lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML =
        '<div class="lightbox-content">' +
        '<button class="lightbox-close" aria-label="Close">&times;</button>' +
        '<img src="" alt="Preview">' +
        '<p class="lightbox-caption"></p></div>';
      document.body.appendChild(overlay);
    }
    var img = overlay.querySelector('img');
    var caption = overlay.querySelector('.lightbox-caption');
    var closeBtn = overlay.querySelector('.lightbox-close');

    function close() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      img.src = '';
    }

    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        img.src = item.getAttribute('href') || item.querySelector('img').src;
        caption.textContent = item.getAttribute('data-caption') || '';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function initGalleryFilter() {
    var btns = document.querySelectorAll('.gallery-filter button');
    var cols = document.querySelectorAll('.gallery-grid .gallery-col');
    if (!btns.length || !cols.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        cols.forEach(function (col) {
          var cat = col.getAttribute('data-category');
          col.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
        });
      });
    });
  }

  function initServiceFilter() {
    var search = document.getElementById('serviceSearch');
    var filters = document.querySelectorAll('.category-filters button');
    var cards = document.querySelectorAll('.service-filter-card');
    if (!cards.length) return;

    var activeCategory = 'all';

    function applyFilter() {
      var q = search ? search.value.toLowerCase().trim() : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cat = card.getAttribute('data-category') || '';
        var matchCat = activeCategory === 'all' || cat === activeCategory;
        var matchSearch = !q || title.indexOf(q) !== -1;
        card.classList.toggle('service-hidden', !(matchCat && matchSearch));
      });
    }

    if (search) search.addEventListener('input', applyFilter);
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category') || 'all';
        applyFilter();
      });
    });
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var fields = {
      name: { el: form.querySelector('#contactName'), validate: function (v) { return v.trim().length >= 2; }, msg: 'Please enter your full name.' },
      phone: { el: form.querySelector('#contactPhone'), validate: function (v) { return /^[6-9]\d{9}$/.test(v.replace(/\s/g, '')); }, msg: 'Enter a valid 10-digit mobile number.' },
      email: { el: form.querySelector('#contactEmail'), validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, msg: 'Enter a valid email address.' },
      message: { el: form.querySelector('#contactMessage'), validate: function (v) { return v.trim().length >= 10; }, msg: 'Message must be at least 10 characters.' }
    };

    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener('input', function () {
        if (fields[key].validate(fields[key].el.value)) fields[key].el.classList.remove('is-invalid');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (!f.validate(f.el.value)) {
          f.el.classList.add('is-invalid');
          var fb = f.el.parentElement.querySelector('.invalid-feedback');
          if (fb) fb.textContent = f.msg;
          ok = false;
        } else {
          f.el.classList.remove('is-invalid');
        }
      });
      if (ok) {
        var success = document.getElementById('formSuccess');
        if (success) {
          success.classList.remove('d-none');
          form.reset();
          setTimeout(function () { success.classList.add('d-none'); }, 5000);
        }
      }
    });
  }

  function initActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) link.classList.add('active');
    });
  }

  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 750, easing: 'ease-in-out', once: true, offset: 70 });
    }
  }
})();
