(function () {
  'use strict';
  window.portfolioReady = true; // see the safety net in index.html <head>

  var root = document.documentElement;
  var EMAIL = 'sakibraihan9191@gmail.com';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  if (isMac) $$('.kbd-mod').forEach(function (k) { k.textContent = '⌘'; });

  // ---- Name: letter-by-letter entrance ----
  var nameLink = $('.name a');
  if (nameLink) {
    var name = nameLink.textContent;
    nameLink.textContent = '';
    nameLink.setAttribute('aria-label', name);
    for (var i = 0; i < name.length; i++) {
      if (name[i] === ' ') { nameLink.appendChild(document.createTextNode(' ')); continue; }
      var ch = document.createElement('span');
      ch.className = 'ch';
      ch.textContent = name[i];
      ch.setAttribute('aria-hidden', 'true');
      ch.style.setProperty('--i', i);
      nameLink.appendChild(ch);
    }
  }

  // ---- Rotating words in the tagline ----
  var rotator = $('.rotator');
  if (rotator && !reduceMotion) {
    var words = $$('span', rotator), w = 0;
    setInterval(function () {
      if (document.hidden) return;
      var cur = words[w];
      w = (w + 1) % words.length;
      var next = words[w];
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      setTimeout(function () { cur.classList.remove('is-leaving'); }, 750);
    }, 2800);
  }

  // ---- Scroll reveal (soft blur + rise, staggered within each batch) ----
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', n++);
        e.target.classList.add('in');
        revealer.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealer.observe(el); });
    document.addEventListener('animationend', function (e) {
      if (e.animationName === 'enter' && e.target.classList.contains('reveal')) e.target.classList.add('done');
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in', 'done'); });
  }

  // ---- Count-up numbers when the stats come into view ----
  function countUp(el) {
    var to = +el.getAttribute('data-count-to');
    var from = el.hasAttribute('data-count-from') ? +el.getAttribute('data-count-from') : 0;
    var start = null, dur = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var counter = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        counter.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    $$('[data-count-to]').forEach(function (el) { counter.observe(el); });
  }

  // ---- Pipeline diagram: hover/tap a step, otherwise it gently auto-advances ----
  var flow = $('.flow');
  if (flow) {
    var steps = $$('li', flow);
    var flowCard = flow.closest('.flow-card');
    var flowDesc = $('.flow-desc', flowCard);
    var activeStep = 0, hovering = false, lastTouch = 0, flowVisible = false;

    var setStep = function (i) {
      activeStep = i;
      steps.forEach(function (li, j) {
        li.classList.toggle('is-active', j === i);
        li.classList.toggle('is-past', j < i);
      });
      var text = $('.flow-node', steps[i]).getAttribute('data-desc');
      if (flowDesc.textContent !== text) {
        flowDesc.textContent = text;
        flowDesc.classList.remove('swap');
        void flowDesc.offsetWidth; // restart the fade
        flowDesc.classList.add('swap');
      }
    };

    steps.forEach(function (li, i) {
      var btn = $('.flow-node', li);
      // Screen readers get the description as part of the button name
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = ': ' + btn.getAttribute('data-desc');
      btn.appendChild(sr);
      btn.addEventListener('mouseenter', function () { setStep(i); });
      btn.addEventListener('focus', function () { lastTouch = Date.now(); setStep(i); });
      btn.addEventListener('click', function () { lastTouch = Date.now(); setStep(i); });
    });
    flowCard.addEventListener('mouseenter', function () { hovering = true; });
    flowCard.addEventListener('mouseleave', function () { hovering = false; });

    if (!reduceMotion) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { flowVisible = es[0].isIntersecting; }).observe(flowCard);
      }
      setInterval(function () {
        if (!flowVisible || hovering || document.hidden || Date.now() - lastTouch < 6000) return;
        setStep((activeStep + 1) % steps.length);
      }, 2600);
    }
  }

  // ---- Cards: soft glow that follows the cursor ----
  if (finePointer) {
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ---- Cards: expandable "How it works" ----
  $$('.more-btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    panel.inert = true;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      panel.inert = !open;
    });
  });

  // ---- Project filters with a sliding pill ----
  var filters = $('.filters');
  if (filters) {
    var chips = $$('.chip', filters);
    var indicator = $('.chip-indicator', filters);
    var projects = $('#projects');
    var items = $$('[data-cat]', projects);
    var archive = $('.archive', projects);
    var moreLabel = $('.sub-label', projects);
    var activeChip = chips[0];
    var matches = function (item, f) { return f === 'all' || item.getAttribute('data-cat').split(' ').indexOf(f) > -1; };

    chips.forEach(function (chip) {
      var f = chip.getAttribute('data-filter');
      $('.count', chip).textContent = items.filter(function (it) { return matches(it, f); }).length;
    });

    var moveIndicator = function (instant) {
      if (instant) indicator.style.transition = 'none';
      indicator.style.width = activeChip.offsetWidth + 'px';
      indicator.style.height = activeChip.offsetHeight + 'px';
      indicator.style.transform = 'translate(' + activeChip.offsetLeft + 'px,' + activeChip.offsetTop + 'px)';
      if (instant) { void indicator.offsetWidth; indicator.style.transition = ''; }
    };
    var showEl = function (el) {
      if (!el.hasAttribute('data-hidden')) return;
      el.removeAttribute('data-hidden');
      el.classList.add('in', 'done');
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        activeChip = chip;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        items.forEach(function (it) {
          if (matches(it, f)) showEl(it); else it.setAttribute('data-hidden', '');
        });
        var anyArchived = $$('li', archive).some(function (li) { return !li.hasAttribute('data-hidden'); });
        [archive, moreLabel].forEach(function (el) {
          if (anyArchived) showEl(el); else el.setAttribute('data-hidden', '');
        });
        moveIndicator(false);
        chip.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    moveIndicator(true);
    window.addEventListener('resize', function () { moveIndicator(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveIndicator(true); });
  }

  // ---- Theme toggle with a circular reveal (View Transitions API) ----
  function applyTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  }
  function flipTheme() {
    // Read the theme at switch time so rapid repeat clicks each flip it once
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }
  function toggleTheme(x, y) {
    if (!document.startViewTransition || reduceMotion) { flipTheme(); return; }
    if (x == null) { x = window.innerWidth / 2; y = window.innerHeight / 2; }
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty('--vt-x', x + 'px');
    root.style.setProperty('--vt-y', y + 'px');
    root.style.setProperty('--vt-r', radius + 'px');
    var vt = document.startViewTransition(flipTheme);
    // A rapid second click skips the first transition; that rejection is expected, not an error
    vt.ready.catch(function () {});
    vt.finished.catch(function () {});
  }
  $$('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var r = btn.getBoundingClientRect();
      toggleTheme(r.left + r.width / 2, r.top + r.height / 2);
    });
  });

  // ---- Toast + copy email ----
  var toastEl = $('.toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  function copyEmail() {
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      toast(ok ? 'Email copied to clipboard' : EMAIL);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(EMAIL).then(function () { toast('Email copied to clipboard'); }, fallback);
    } else {
      fallback();
    }
  }
  $$('.copy-email').forEach(function (b) { b.addEventListener('click', copyEmail); });

  // ---- Magnetic buttons (mouse only) ----
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.32).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // ---- Scroll-linked: progress bar, active nav, mobile bar, timeline rails ----
  var links = $$('.nav a');
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var progress = $('.progress');
  var sidebar = $('.sidebar');
  var mobilebar = $('.mobilebar');
  var mbSection = $('.mb-section');
  var rails = $$('.rail').map(function (rail) { return { el: rail, entries: $$('.entry', rail) }; });
  var currentSection = -1, ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var sy = window.scrollY;
    var docH = root.scrollHeight;

    progress.style.setProperty('--p', Math.min(sy / Math.max(docH - vh, 1), 1).toFixed(4));

    // Active section: last one whose top passed 40% of the viewport; the last wins at the very bottom
    var idx = 0;
    if (vh + sy >= docH - 2) idx = sections.length - 1;
    else sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= vh * 0.4) idx = i; });
    if (idx !== currentSection) {
      currentSection = idx;
      links.forEach(function (a, i) {
        a.classList.toggle('active', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (mbSection && links[idx]) mbSection.textContent = links[idx].textContent;
    }

    if (mobilebar) {
      var showBar = window.innerWidth < 1024 && sidebar.getBoundingClientRect().bottom < 0;
      if (showBar !== mobilebar.classList.contains('show')) {
        mobilebar.classList.toggle('show', showBar);
        mobilebar.inert = !showBar;
      }
    }

    rails.forEach(function (rail) {
      var r = rail.el.getBoundingClientRect();
      var fill = Math.max(0, Math.min(1, (vh * 0.65 - r.top) / r.height));
      rail.el.style.setProperty('--fill', fill.toFixed(4));
      var lineEnd = r.top + 8 + (r.height - 16) * fill;
      rail.entries.forEach(function (en) {
        en.classList.toggle('lit', en.getBoundingClientRect().top + 12 <= lineEnd + 1);
      });
    });
  }
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', update);
  update();

  // ---- Command menu (Ctrl/⌘ K or "/") ----
  var dialog = $('.cmdk');
  if (dialog && typeof dialog.showModal === 'function') {
    var input = $('input', dialog);
    var list = $('.cmdk-list', dialog);
    var empty = $('.cmdk-empty', dialog);
    var ICONS = {
      hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>',
      link: '<path d="M7 17 17 7M8 7h9v9"/>',
      file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
      copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
      theme: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'
    };
    var go = function (hash) {
      return function () {
        var el = document.querySelector(hash);
        if (!el) return;
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', hash);
      };
    };
    var openUrl = function (url) { return function () { window.open(url, '_blank', 'noopener'); }; };
    var commands = [
      { group: 'Navigate', label: 'About', icon: 'hash', run: go('#about') },
      { group: 'Navigate', label: 'Experience', icon: 'hash', run: go('#experience') },
      { group: 'Navigate', label: 'Projects', icon: 'hash', run: go('#projects') },
      { group: 'Navigate', label: 'Skills', icon: 'hash', run: go('#skills') },
      { group: 'Navigate', label: 'Awards & recognition', icon: 'hash', run: go('#awards') },
      { group: 'Navigate', label: 'Education', icon: 'hash', run: go('#education') },
      { group: 'Navigate', label: 'Contact', icon: 'hash', run: go('#contact') },
      { group: 'Links', label: 'GitHub', hint: 'Sakib9797', icon: 'link', run: openUrl('https://github.com/Sakib9797') },
      { group: 'Links', label: 'LinkedIn', hint: 'sakibraihan91', icon: 'link', run: openUrl('https://www.linkedin.com/in/sakibraihan91/') },
      { group: 'Links', label: 'Résumé (PDF)', icon: 'file', run: openUrl('assets/Sakib-Raihan-Resume.pdf') },
      { group: 'Actions', label: 'Copy email address', icon: 'copy', run: copyEmail },
      { group: 'Actions', label: 'Send an email', icon: 'mail', run: function () { window.location.href = 'mailto:' + EMAIL; } },
      { group: 'Actions', label: 'Toggle light / dark theme', icon: 'theme', run: function () { toggleTheme(); } }
    ];
    var shown = [], sel = 0;

    var select = function (i) {
      sel = i;
      $$('.cmdk-item', list).forEach(function (li, j) { li.setAttribute('aria-selected', String(j === i)); });
      var cur = document.getElementById('cmdk-opt-' + i);
      if (cur) { input.setAttribute('aria-activedescendant', cur.id); cur.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    };
    var run = function (i) {
      var cmd = shown[i];
      if (!cmd) return;
      dialog.close();
      cmd.run();
    };
    var render = function () {
      var q = input.value.trim().toLowerCase();
      shown = commands.filter(function (c) {
        return !q || (c.label + ' ' + c.group + ' ' + (c.hint || '')).toLowerCase().indexOf(q) > -1;
      });
      list.innerHTML = '';
      var lastGroup = null;
      shown.forEach(function (c, i) {
        if (c.group !== lastGroup) {
          lastGroup = c.group;
          var g = document.createElement('li');
          g.className = 'cmdk-group';
          g.setAttribute('role', 'presentation');
          g.textContent = c.group;
          list.appendChild(g);
        }
        var li = document.createElement('li');
        li.className = 'cmdk-item';
        li.id = 'cmdk-opt-' + i;
        li.setAttribute('role', 'option');
        li.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[c.icon] + '</svg><span></span>' + (c.hint ? '<span class="hint"></span>' : '');
        li.children[1].textContent = c.label;
        if (c.hint) li.children[2].textContent = c.hint;
        li.addEventListener('mousemove', function () { if (sel !== i) select(i); });
        li.addEventListener('click', function () { run(i); });
        list.appendChild(li);
      });
      empty.hidden = shown.length > 0;
      select(0);
    };
    var openMenu = function () {
      if (dialog.open) return;
      input.value = '';
      render();
      dialog.showModal();
      input.focus();
    };

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && shown.length) { e.preventDefault(); select((sel + 1) % shown.length); }
      else if (e.key === 'ArrowUp' && shown.length) { e.preventDefault(); select((sel - 1 + shown.length) % shown.length); }
      else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); }); // backdrop
    $$('.cmdk-open').forEach(function (b) { b.addEventListener('click', openMenu); });

    document.addEventListener('keydown', function (e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dialog.open) dialog.close(); else openMenu();
      } else if (e.key === '/' && !dialog.open && !/INPUT|TEXTAREA|SELECT/.test(tag) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        openMenu();
      }
    });
  }

  // ---- Footer year ----
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
