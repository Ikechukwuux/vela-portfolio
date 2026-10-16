// Progressive enhancement gate — CSS scopes custom select styles under html.js
document.documentElement.classList.add('js');

// Persistent Header scroll state
const header = document.querySelector('.header');
const isHomepage = !!document.querySelector('.hero');

if (header) {
  if (isHomepage) {
    const updateHeader = () => {
      if (document.body.classList.contains('menu-open')) return;
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  } else {
    header.classList.add('scrolled');
  }
}

// Mobile Menu Navigation & Focus Management
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

const setMenuState = (open) => {
  if (!mobileMenu || !toggle) return;
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

toggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  setMenuState(!isOpen);
});

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
    setMenuState(false);
    toggle?.focus();
  }
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const reveals=document.querySelectorAll('.reveal,.editorial-photo');if(reduced)reveals.forEach(x=>x.classList.add(x.classList.contains('editorial-photo')?'revealed':'visible'));else{const ro=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add(e.target.classList.contains('editorial-photo')?'revealed':'visible');ro.unobserve(e.target)}}),{threshold:.18});reveals.forEach(x=>ro.observe(x))}
// Vela Rhythm Sticky Story — Layered Crossfade & Stable Desktop Activation
const chapters = [...document.querySelectorAll('.chapter')];
const storyImgs = [...document.querySelectorAll('.story-img')];

if (chapters.length && storyImgs.length) {
  let currentIndex = -1;
  let cleanupTimer = null;

  const activate = (newIndex, animated = true) => {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= chapters.length) return;
    const prevIndex = currentIndex;
    currentIndex = newIndex;

    // Synchronize chapter active state
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle('active', i === newIndex);
    });

    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }

    if (!animated || reduced) {
      // Immediate switch for initial load or reduced motion
      storyImgs.forEach((img, i) => {
        img.classList.toggle('active', i === newIndex);
        img.classList.remove('previous');
      });
      return;
    }

    // Layered Crossfade:
    // 1. Previous active image becomes .previous (z-index: 1, stays at opacity 1)
    // 2. Incoming image becomes .active (z-index: 2, fades from 0 to 1 over 1.15s)
    // 3. Other images stay at z-index: 0, opacity: 0
    storyImgs.forEach((img, i) => {
      if (i === newIndex) {
        img.classList.remove('previous');
        img.classList.add('active');
      } else if (i === prevIndex) {
        img.classList.remove('active');
        img.classList.add('previous');
      } else {
        img.classList.remove('active', 'previous');
      }
    });

    // Cleanup: after the 1.15s crossfade finishes, remove .previous from outgoing image
    cleanupTimer = setTimeout(() => {
      storyImgs.forEach((img, i) => {
        if (i !== currentIndex) {
          img.classList.remove('previous', 'active');
        }
      });
      cleanupTimer = null;
    }, 1200);
  };

  // Passive scroll listener with requestAnimationFrame
  // Activation line: 42% on mobile (≤800px), 55% on desktop.
  // This aligns the scene-change trigger with the text region boundary
  // so the image updates when the next chapter dominates the text panel.
  const getActivationRatio = () => window.innerWidth <= 800 ? 0.42 : 0.55;

  let tickingStory = false;
  const updateStory = () => {
    tickingStory = false;
    const activationLine = window.innerHeight * getActivationRatio();
    let bestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < chapters.length; i++) {
      const rect = chapters[i].getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - activationLine);
      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = i;
      }
    }

    activate(bestIndex, true);
  };

  const onScrollStory = () => {
    if (!tickingStory) {
      requestAnimationFrame(updateStory);
      tickingStory = true;
    }
  };

  window.addEventListener('scroll', onScrollStory, { passive: true });
  window.addEventListener('resize', onScrollStory, { passive: true });
  window.addEventListener('orientationchange', onScrollStory, { passive: true });

  // Initial calculation on load / refresh (immediate, no animation flash)
  const initialActivationLine = window.innerHeight * getActivationRatio();
  let initialBest = 0;
  let initialMin = Infinity;
  chapters.forEach((c, i) => {
    const rect = c.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - initialActivationLine);
    if (distance < initialMin) {
      initialMin = distance;
      initialBest = i;
    }
  });
  activate(initialBest, false);
}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('.menu-section').forEach(s=>{s.hidden=f!=='all'&&s.dataset.category!==f});document.querySelector('.menu-content')?.scrollIntoView({behavior:reduced?'auto':'smooth'})}));
/* ============================================================================
   Vela Brand Reservation Form — Accessible Components & Validation System
   ----------------------------------------------------------------------------
   Includes:
   - Shared Control Coordinator (one open dropdown/calendar at a time, outside-click)
   - VelaSelect (Accessible custom combobox / listbox for Time, Guests, Experience)
   - VelaDatePicker (Accessible custom dialog / popover / mobile sheet for Date)
   - VelaFormValidation (Custom inline error messaging, novalidate, focus handling)
   ============================================================================ */

;(function () {
  var form = document.querySelector('.form');
  if (!form) return;

  // Progressive enhancement: add novalidate only after JS is ready
  form.setAttribute('novalidate', '');

  // Screen-reader live region for form announcements
  var srStatus = document.createElement('div');
  srStatus.className = 'form__sr-status';
  srStatus.setAttribute('aria-live', 'assertive');
  form.appendChild(srStatus);

  // ── Shared Popup Manager ──────────────────────────────────────────────────
  var activePopups = [];
  function registerPopup(popup) {
    activePopups.push(popup);
  }
  function closeAllPopups(except) {
    activePopups.forEach(function (p) {
      if (p !== except && p.isOpen) p.close();
    });
  }

  document.addEventListener('click', function (e) {
    activePopups.forEach(function (p) {
      if (p.isOpen && p.wrapper && !p.wrapper.contains(e.target)) {
        p.close();
      }
    });
  });

  // Helper DOM utilities
  function mkEl(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function setAttrs(node, map) {
    Object.keys(map).forEach(function (k) { node.setAttribute(k, map[k]); });
  }

  // ==========================================================================
  // 1. VELA CUSTOM SELECT
  // ==========================================================================
  var CHEVRON = '<svg class="icon icon--sm vela-select__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
  var CHECK_ICON = '<svg class="icon icon--sm vela-select__check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"/></svg>';

  var selectInstances = {};

  function VelaSelect(native) {
    this.native    = native;
    this.field     = native.closest('.field');
    this.lbl       = document.querySelector('label[for="' + native.id + '"]');
    this.uid       = 'vela-lb-' + (native.id || Math.random().toString(36).slice(2));
    this.trigId    = 'vela-trig-' + (native.id || Math.random().toString(36).slice(2));
    this.isOpen    = false;
    this.activeIdx = -1;
    this.optEls    = [];
    this._build();
    this._bind();
    registerPopup(this);
    if (native.id) selectInstances[native.id] = this;
  }

  VelaSelect.prototype._build = function () {
    var self = this, n = this.native;

    this.wrapper = mkEl('div', 'vela-select');
    this.wrapper.setAttribute('data-vela-select', '');

    this.trigger = mkEl('button', 'vela-select__trigger');
    this.trigger.type = 'button';
    this.trigger.id = this.trigId;
    setAttrs(this.trigger, {
      'role': 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-controls': this.uid
    });

    if (this.lbl) {
      if (!this.lbl.id) this.lbl.id = 'vela-lbl-' + n.id;
      this.trigger.setAttribute('aria-labelledby', this.lbl.id + ' ' + this.trigId);
      this.lbl.addEventListener('click', function (e) {
        e.preventDefault();
        self.trigger.focus();
      });
    }

    this.valueSpan = mkEl('span', 'vela-select__value');
    var cur = n.options[n.selectedIndex];
    this.valueSpan.textContent = cur ? cur.text : '';
    if (cur && cur.value === '') {
      this.valueSpan.classList.add('is-placeholder');
    }

    var chevWrap = mkEl('span', 'vela-select__chevron-wrap');
    chevWrap.innerHTML = CHEVRON;
    this.trigger.appendChild(this.valueSpan);
    this.trigger.appendChild(chevWrap);

    this.listbox = mkEl('ul', 'vela-select__listbox');
    setAttrs(this.listbox, { id: this.uid, role: 'listbox', tabindex: '-1' });
    if (this.lbl) this.listbox.setAttribute('aria-label', this.lbl.textContent.trim());
    this._buildOpts();

    n.parentNode.insertBefore(this.wrapper, n);
    this.wrapper.appendChild(this.trigger);
    this.wrapper.appendChild(this.listbox);
    this.wrapper.appendChild(n);

    n.classList.add('vela-select__native');
    setAttrs(n, { 'aria-hidden': 'true', 'tabindex': '-1' });
  };

  VelaSelect.prototype._buildOpts = function () {
    this.listbox.innerHTML = '';
    this.optEls = [];
    var self = this;
    Array.from(this.native.options).forEach(function (opt, i) {
      var li = mkEl('li', 'vela-select__option');
      li.id = self.uid + '-opt-' + i;
      setAttrs(li, {
        role: 'option',
        'data-index': i,
        'aria-selected': i === self.native.selectedIndex ? 'true' : 'false'
      });
      li.innerHTML = '<span class="vela-select__opt-text">' + opt.text + '</span>' + CHECK_ICON;
      if (i === self.native.selectedIndex) li.classList.add('is-selected');
      if (opt.disabled) {
        li.setAttribute('aria-disabled', 'true');
        li.classList.add('is-disabled');
      }
      self.listbox.appendChild(li);
      self.optEls.push(li);
    });
    this.activeIdx = this.native.selectedIndex;
  };

  VelaSelect.prototype._bind = function () {
    var self = this, n = this.native;

    this.trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      self.isOpen ? self.close() : self.open();
    });

    this.trigger.addEventListener('keydown', function (e) { self._handleKey(e); });

    this.listbox.addEventListener('click', function (e) {
      var li = e.target.closest('.vela-select__option');
      if (!li || li.classList.contains('is-disabled')) return;
      self._select(parseInt(li.getAttribute('data-index'), 10));
    });

    n.addEventListener('change', function () {
      self._sync();
    });
  };

  VelaSelect.prototype._handleKey = function (e) {
    var k = e.key;
    if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      if (this.isOpen) {
        this._select(this.activeIdx);
      } else {
        this.open();
      }
    } else if (k === 'ArrowDown') {
      e.preventDefault();
      if (!this.isOpen) {
        this.open();
      } else {
        this._move(1);
      }
    } else if (k === 'ArrowUp') {
      e.preventDefault();
      if (!this.isOpen) {
        this.open();
      } else {
        this._move(-1);
      }
    } else if (k === 'Home' && this.isOpen) {
      e.preventDefault();
      this._setActive(0);
    } else if (k === 'End' && this.isOpen) {
      e.preventDefault();
      this._setActive(this.optEls.length - 1);
    } else if (k === 'Escape' && this.isOpen) {
      e.preventDefault();
      this.close();
      this.trigger.focus();
    } else if (k === 'Tab' && this.isOpen) {
      this.close();
    } else if (k.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
      this._typeAhead(k);
    }
  };

  VelaSelect.prototype.open = function () {
    closeAllPopups(this);
    this.isOpen = true;
    this.wrapper.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');
    if (this.field) this.field.classList.add('field--select-open');
    this._position();
    this.activeIdx = Math.max(0, this.native.selectedIndex);
    this._updateActive();
  };

  VelaSelect.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.wrapper.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.removeAttribute('aria-activedescendant');
    if (this.field) this.field.classList.remove('field--select-open');
    this.optEls.forEach(function (li) { li.classList.remove('is-active'); });
  };

  VelaSelect.prototype._select = function (i) {
    if (i < 0 || i >= this.optEls.length) return;
    if (this.optEls[i].classList.contains('is-disabled')) return;
    this.native.selectedIndex = i;
    this.native.dispatchEvent(new Event('change', { bubbles: true }));
    this._sync();
    this.close();
    this.trigger.focus();
  };

  VelaSelect.prototype._sync = function () {
    var sel = this.native.selectedIndex;
    var opt = this.native.options[sel];
    this.valueSpan.textContent = opt ? opt.text : '';
    if (opt && opt.value === '') {
      this.valueSpan.classList.add('is-placeholder');
    } else {
      this.valueSpan.classList.remove('is-placeholder');
    }
    this.optEls.forEach(function (li, i) {
      var s = i === sel;
      li.setAttribute('aria-selected', s ? 'true' : 'false');
      li.classList.toggle('is-selected', s);
    });
    this.activeIdx = sel;
  };

  VelaSelect.prototype._move = function (dir) {
    var next = this.activeIdx + dir;
    while (next >= 0 && next < this.optEls.length && this.optEls[next].classList.contains('is-disabled')) {
      next += dir;
    }
    if (next >= 0 && next < this.optEls.length) {
      this._setActive(next);
    }
  };

  VelaSelect.prototype._setActive = function (i) {
    this.activeIdx = i;
    this._updateActive();
  };

  VelaSelect.prototype._updateActive = function () {
    var self = this;
    this.optEls.forEach(function (li, i) {
      li.classList.toggle('is-active', i === self.activeIdx);
    });
    var active = this.optEls[this.activeIdx];
    if (active) {
      this.trigger.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    }
  };

  VelaSelect.prototype._typeAhead = function (char) {
    var lc = char.toLowerCase();
    var start = this.activeIdx + 1;
    for (var n = 0; n < this.optEls.length; n++) {
      var i = (start + n) % this.optEls.length;
      var li = this.optEls[i];
      if (!li.classList.contains('is-disabled') && li.textContent.trim().toLowerCase().charAt(0) === lc) {
        if (!this.isOpen) {
          this.open();
        }
        this._setActive(i);
        return;
      }
    }
  };

  VelaSelect.prototype._position = function () {
    var rect = this.wrapper.getBoundingClientRect();
    var estH = Math.min(this.optEls.length * 48 + 8, 280);
    var spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < estH + 16 && rect.top > estH) {
      this.wrapper.classList.add('opens-above');
    } else {
      this.wrapper.classList.remove('opens-above');
    }
  };

  // ==========================================================================
  // 2. VELA CUSTOM DATE PICKER
  // ==========================================================================
  var CALENDAR_ICON = '<svg class="vela-date__svg" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="14" height="14" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="17" y2="10"></line></svg>';
  var PREV_ICON = '<svg viewBox="0 0 10 16" width="8" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1L1 8L9 15"/></svg>';
  var NEXT_ICON = '<svg viewBox="0 0 10 16" width="8" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1L9 8L1 15"/></svg>';

  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var DAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  var datePickerInstance = null;

  function VelaDatePicker(native) {
    this.native      = native;
    this.field       = native.closest('.field');
    this.lbl         = document.querySelector('label[for="' + native.id + '"]');
    this.calId       = 'vela-cal-' + (native.id || 'date');
    this.trigId      = 'vela-trig-' + (native.id || 'date');
    this.isOpen      = false;
    this.selectedISO = native.value || '';

    var now = new Date();
    this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (this.selectedISO) {
      var parts = this.selectedISO.split('-');
      this.selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      this.selectedDate = null;
    }

    this.viewYear    = (this.selectedDate || this.today).getFullYear();
    this.viewMonth   = (this.selectedDate || this.today).getMonth();
    this.focusedDate = new Date((this.selectedDate || this.today).getTime());

    this._build();
    this._bind();
    registerPopup(this);
    datePickerInstance = this;
  }

  VelaDatePicker.prototype._formatDisplay = function (d) {
    if (!d) return 'Select date';
    return DAY_NAMES[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
  };

  VelaDatePicker.prototype._formatISO = function (d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  };

  VelaDatePicker.prototype._build = function () {
    var self = this, n = this.native;

    this.wrapper = mkEl('div', 'vela-date');
    this.wrapper.setAttribute('data-vela-date', '');

    // Trigger button
    this.trigger = mkEl('button', 'vela-date__trigger');
    this.trigger.type = 'button';
    this.trigger.id = this.trigId;
    setAttrs(this.trigger, {
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
      'aria-controls': this.calId
    });

    if (this.lbl) {
      if (!this.lbl.id) this.lbl.id = 'vela-lbl-' + n.id;
      this.trigger.setAttribute('aria-labelledby', this.lbl.id + ' ' + this.trigId);
      this.lbl.addEventListener('click', function (e) {
        e.preventDefault();
        self.trigger.focus();
      });
    }

    this.valueSpan = mkEl('span', 'vela-date__value');
    if (this.selectedDate) {
      this.valueSpan.textContent = this._formatDisplay(this.selectedDate);
    } else {
      this.valueSpan.textContent = 'Select date';
      this.valueSpan.classList.add('is-placeholder');
    }

    var iconSpan = mkEl('span', 'vela-date__icon');
    iconSpan.innerHTML = CALENDAR_ICON;
    this.trigger.appendChild(this.valueSpan);
    this.trigger.appendChild(iconSpan);

    // Mobile backdrop
    this.backdrop = mkEl('div', 'vela-date__backdrop');
    this.backdrop.setAttribute('aria-hidden', 'true');

    // Calendar container
    this.calendar = mkEl('div', 'vela-date__calendar');
    setAttrs(this.calendar, {
      id: this.calId,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Choose reservation date',
      tabindex: '-1'
    });

    // Mobile header with close button
    var mobHeader = mkEl('div', 'vela-date__mobile-header');
    var mobTitle = mkEl('span', 'vela-date__mobile-title');
    mobTitle.textContent = 'Select date';
    var mobClose = mkEl('button', 'vela-date__mobile-close');
    mobClose.type = 'button';
    mobClose.textContent = '✕';
    mobClose.setAttribute('aria-label', 'Close calendar');
    mobClose.addEventListener('click', function () { self.close(); self.trigger.focus(); });
    mobHeader.appendChild(mobTitle);
    mobHeader.appendChild(mobClose);
    this.calendar.appendChild(mobHeader);

    // Calendar nav header
    var header = mkEl('div', 'vela-date__header');
    this.prevBtn = mkEl('button', 'vela-date__nav-btn vela-date__prev');
    this.prevBtn.type = 'button';
    this.prevBtn.setAttribute('aria-label', 'Previous month');
    this.prevBtn.innerHTML = PREV_ICON;

    this.titleSpan = mkEl('span', 'vela-date__title');
    this.titleSpan.setAttribute('aria-live', 'polite');

    this.nextBtn = mkEl('button', 'vela-date__nav-btn vela-date__next');
    this.nextBtn.type = 'button';
    this.nextBtn.setAttribute('aria-label', 'Next month');
    this.nextBtn.innerHTML = NEXT_ICON;

    header.appendChild(this.prevBtn);
    header.appendChild(this.titleSpan);
    header.appendChild(this.nextBtn);
    this.calendar.appendChild(header);

    // Weekday labels
    var weekdays = mkEl('div', 'vela-date__weekdays');
    weekdays.setAttribute('role', 'row');
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(function (w, i) {
      var sp = mkEl('span', 'vela-date__weekday');
      sp.setAttribute('role', 'columnheader');
      sp.setAttribute('aria-label', DAY_NAMES[i]);
      sp.textContent = w;
      weekdays.appendChild(sp);
    });
    this.calendar.appendChild(weekdays);

    // Days grid
    this.grid = mkEl('div', 'vela-date__grid');
    this.grid.setAttribute('role', 'grid');
    this.calendar.appendChild(this.grid);

    // Footer actions
    var actions = mkEl('div', 'vela-date__actions');
    this.todayBtn = mkEl('button', 'vela-date__action-btn vela-date__today-btn');
    this.todayBtn.type = 'button';
    this.todayBtn.textContent = 'Today';
    this.clearBtn = mkEl('button', 'vela-date__action-btn vela-date__clear-btn');
    this.clearBtn.type = 'button';
    this.clearBtn.textContent = 'Clear';
    actions.appendChild(this.todayBtn);
    actions.appendChild(this.clearBtn);
    this.calendar.appendChild(actions);

    // Insert into DOM
    n.parentNode.insertBefore(this.wrapper, n);
    this.wrapper.appendChild(this.trigger);
    this.wrapper.appendChild(this.backdrop);
    this.wrapper.appendChild(this.calendar);
    this.wrapper.appendChild(n);

    n.classList.add('vela-date__native');
    setAttrs(n, { 'aria-hidden': 'true', 'tabindex': '-1' });

    this._renderGrid();
  };

  VelaDatePicker.prototype._renderGrid = function () {
    var self = this;
    this.titleSpan.textContent = MONTH_NAMES[this.viewMonth] + ' ' + this.viewYear;

    // Check if prev button should be disabled (cannot go before current month)
    var isPastMonth = (this.viewYear < this.today.getFullYear()) ||
      (this.viewYear === this.today.getFullYear() && this.viewMonth <= this.today.getMonth());
    this.prevBtn.disabled = isPastMonth;

    this.grid.innerHTML = '';
    var firstDayIdx = new Date(this.viewYear, this.viewMonth, 1).getDay();
    var daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

    // Empty leading cells
    for (var i = 0; i < firstDayIdx; i++) {
      var empty = mkEl('span', 'vela-date__day is-empty');
      empty.setAttribute('aria-hidden', 'true');
      this.grid.appendChild(empty);
    }

    // Day buttons
    for (var d = 1; d <= daysInMonth; d++) {
      var dObj = new Date(this.viewYear, this.viewMonth, d);
      var iso = this._formatISO(dObj);
      var btn = mkEl('button', 'vela-date__day');
      btn.type = 'button';
      btn.textContent = String(d);
      btn.setAttribute('data-date', iso);
      btn.setAttribute('aria-label', DAY_NAMES[dObj.getDay()] + ', ' + d + ' ' + MONTH_NAMES[this.viewMonth] + ' ' + this.viewYear);

      var isPast = dObj < this.today;
      if (isPast) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      }

      if (dObj.getTime() === this.today.getTime()) {
        btn.classList.add('is-today');
      }

      if (this.selectedISO === iso) {
        btn.classList.add('is-selected');
        btn.setAttribute('aria-selected', 'true');
      }

      if (this.focusedDate &&
          this.focusedDate.getFullYear() === this.viewYear &&
          this.focusedDate.getMonth() === this.viewMonth &&
          this.focusedDate.getDate() === d) {
        btn.classList.add('is-focused');
      }

      this.grid.appendChild(btn);
    }
  };

  VelaDatePicker.prototype._bind = function () {
    var self = this;

    this.trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      self.isOpen ? self.close() : self.open();
    });

    this.trigger.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'Enter' || k === ' ' || k === 'ArrowDown') {
        e.preventDefault();
        self.open();
      }
    });

    this.backdrop.addEventListener('click', function () {
      self.close();
      self.trigger.focus();
    });

    this.prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      self._changeMonth(-1);
    });

    this.nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      self._changeMonth(1);
    });

    this.todayBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      self._selectDate(new Date(self.today.getTime()));
    });

    this.clearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      self._clearDate();
    });

    this.grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.vela-date__day');
      if (!btn || btn.disabled || btn.classList.contains('is-empty')) return;
      var iso = btn.getAttribute('data-date');
      var parts = iso.split('-');
      var picked = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      self._selectDate(picked);
    });

    this.calendar.addEventListener('keydown', function (e) {
      self._handleCalendarKey(e);
    });

    window.addEventListener('resize', function () {
      if (self.isOpen) self._position();
    });
  };

  VelaDatePicker.prototype._changeMonth = function (dir) {
    var m = this.viewMonth + dir;
    var y = this.viewYear;
    if (m > 11) { m = 0; y++; }
    else if (m < 0) { m = 11; y--; }

    // Prevent going earlier than current month
    if (y < this.today.getFullYear() || (y === this.today.getFullYear() && m < this.today.getMonth())) {
      return;
    }

    this.viewMonth = m;
    this.viewYear = y;
    this.focusedDate = new Date(y, m, Math.min(this.focusedDate.getDate(), new Date(y, m + 1, 0).getDate()));
    this._renderGrid();
  };

  VelaDatePicker.prototype._handleCalendarKey = function (e) {
    var k = e.key;
    var d = new Date(this.focusedDate.getTime());

    if (k === 'Escape') {
      e.preventDefault();
      this.close();
      this.trigger.focus();
      return;
    }

    var handled = false;
    if (k === 'ArrowLeft') {
      d.setDate(d.getDate() - 1);
      handled = true;
    } else if (k === 'ArrowRight') {
      d.setDate(d.getDate() + 1);
      handled = true;
    } else if (k === 'ArrowUp') {
      d.setDate(d.getDate() - 7);
      handled = true;
    } else if (k === 'ArrowDown') {
      d.setDate(d.getDate() + 7);
      handled = true;
    } else if (k === 'Home') {
      d.setDate(d.getDate() - d.getDay());
      handled = true;
    } else if (k === 'End') {
      d.setDate(d.getDate() + (6 - d.getDay()));
      handled = true;
    } else if (k === 'PageUp') {
      this._changeMonth(-1);
      e.preventDefault();
      return;
    } else if (k === 'PageDown') {
      this._changeMonth(1);
      e.preventDefault();
      return;
    } else if (k === 'Enter') {
      e.preventDefault();
      if (this.focusedDate >= this.today) {
        this._selectDate(new Date(this.focusedDate.getTime()));
      }
      return;
    }

    if (handled) {
      e.preventDefault();
      if (d < this.today) {
        d = new Date(this.today.getTime());
      }
      this.focusedDate = d;
      if (d.getFullYear() !== this.viewYear || d.getMonth() !== this.viewMonth) {
        this.viewYear = d.getFullYear();
        this.viewMonth = d.getMonth();
      }
      this._renderGrid();
      var activeBtn = this.grid.querySelector('.is-focused');
      if (activeBtn) activeBtn.focus();
    }
  };

  VelaDatePicker.prototype.open = function () {
    closeAllPopups(this);
    this.isOpen = true;
    this.wrapper.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');
    if (this.field) this.field.classList.add('field--date-open');

    // Sync focused date to selected date or today
    this.focusedDate = new Date((this.selectedDate || this.today).getTime());
    this.viewYear = this.focusedDate.getFullYear();
    this.viewMonth = this.focusedDate.getMonth();
    this._renderGrid();
    this._position();

    // Lock body scroll if mobile
    if (window.innerWidth <= 600) {
      document.body.classList.add('date-picker-open');
    }

    // Set initial focus to calendar container or focused day
    var activeBtn = this.grid.querySelector('.is-focused') || this.grid.querySelector('.vela-date__day:not(:disabled)');
    if (activeBtn) {
      activeBtn.focus();
    } else {
      this.calendar.focus();
    }
  };

  VelaDatePicker.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.wrapper.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    if (this.field) this.field.classList.remove('field--date-open');
    document.body.classList.remove('date-picker-open');
  };

  VelaDatePicker.prototype._selectDate = function (d) {
    this.selectedDate = d;
    this.selectedISO = this._formatISO(d);
    this.native.value = this.selectedISO;
    this.valueSpan.textContent = this._formatDisplay(d);
    this.valueSpan.classList.remove('is-placeholder');

    this._renderGrid();
    this.native.dispatchEvent(new Event('change', { bubbles: true }));
    this.native.dispatchEvent(new Event('input', { bubbles: true }));

    this.close();
    this.trigger.focus();
  };

  VelaDatePicker.prototype._clearDate = function () {
    this.selectedDate = null;
    this.selectedISO = '';
    this.native.value = '';
    this.valueSpan.textContent = 'Select date';
    this.valueSpan.classList.add('is-placeholder');

    this._renderGrid();
    this.native.dispatchEvent(new Event('change', { bubbles: true }));
    this.native.dispatchEvent(new Event('input', { bubbles: true }));

    this.close();
    this.trigger.focus();
  };

  VelaDatePicker.prototype._position = function () {
    if (window.innerWidth <= 600) {
      this.wrapper.classList.remove('opens-above');
      return;
    }
    var rect = this.wrapper.getBoundingClientRect();
    var estH = 340;
    var spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < estH && rect.top > estH) {
      this.wrapper.classList.add('opens-above');
    } else {
      this.wrapper.classList.remove('opens-above');
    }
  };

  // ==========================================================================
  // 3. INITIALIZE CONTROLS
  // ==========================================================================
  var nativeDate = form.querySelector('#date');
  if (nativeDate) {
    new VelaDatePicker(nativeDate);
  }

  var formSelects = Array.from(form.querySelectorAll('select'));
  formSelects.forEach(function (s) {
    new VelaSelect(s);
  });

  // ==========================================================================
  // 4. INLINE VALIDATION & FORM SUBMISSION SYSTEM
  // ==========================================================================
  // Attach dedicated error containers to all form fields
  var fieldConfig = [
    {
      id: 'date',
      label: 'Date',
      getControl: function () { return datePickerInstance ? datePickerInstance.trigger : form.querySelector('#date'); },
      getValue: function () { return form.querySelector('#date').value; },
      validate: function () {
        var v = form.querySelector('#date').value;
        if (!v) return 'Choose a reservation date.';
        var parts = v.split('-');
        var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (d < today) return 'Please choose a future reservation date.';
        return '';
      }
    },
    {
      id: 'time',
      label: 'Time',
      getControl: function () { return selectInstances['time'] ? selectInstances['time'].trigger : form.querySelector('#time'); },
      getValue: function () { return form.querySelector('#time').value; },
      validate: function () {
        var v = form.querySelector('#time').value;
        if (!v) return 'Choose a reservation time.';
        return '';
      }
    },
    {
      id: 'guests',
      label: 'Guests',
      getControl: function () { return selectInstances['guests'] ? selectInstances['guests'].trigger : form.querySelector('#guests'); },
      getValue: function () { return form.querySelector('#guests').value; },
      validate: function () {
        var v = form.querySelector('#guests').value;
        if (!v) return 'Choose the number of guests.';
        return '';
      }
    },
    {
      id: 'area',
      label: 'Experience',
      getControl: function () { return selectInstances['area'] ? selectInstances['area'].trigger : form.querySelector('#area'); },
      getValue: function () { return form.querySelector('#area').value; },
      validate: function () {
        var v = form.querySelector('#area').value;
        if (!v) return 'Choose a dining experience.';
        return '';
      }
    },
    {
      id: 'name',
      label: 'Name',
      getControl: function () { return form.querySelector('#name'); },
      getValue: function () { return form.querySelector('#name').value; },
      validate: function () {
        var v = form.querySelector('#name').value.trim();
        if (!v) return 'Enter your name.';
        if (v.length < 2) return 'Please enter your full name.';
        return '';
      }
    },
    {
      id: 'phone',
      label: 'Phone',
      getControl: function () { return form.querySelector('#phone'); },
      getValue: function () { return form.querySelector('#phone').value; },
      validate: function () {
        var v = form.querySelector('#phone').value.trim();
        if (!v) return 'Enter a phone number.';
        var digits = v.replace(/\D/g, '');
        if (digits.length < 7) return 'Please enter a valid phone number.';
        return '';
      }
    },
    {
      id: 'email',
      label: 'Email',
      getControl: function () { return form.querySelector('#email'); },
      getValue: function () { return form.querySelector('#email').value; },
      validate: function () {
        var v = form.querySelector('#email').value.trim();
        if (!v) return 'Enter a valid email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address.';
        return '';
      }
    },
    {
      id: 'notes',
      label: 'Notes',
      getControl: function () { return form.querySelector('#notes'); },
      getValue: function () { return form.querySelector('#notes') ? form.querySelector('#notes').value : ''; },
      validate: function () { return ''; } // Optional field
    }
  ];

  // Create inline error DOM elements for each field
  fieldConfig.forEach(function (item) {
    var rawInput = form.querySelector('#' + item.id);
    if (!rawInput) return;
    var fieldDiv = rawInput.closest('.field');
    if (!fieldDiv) return;

    var errSpan = mkEl('span', 'field__error-msg');
    errSpan.id = 'err-' + item.id;
    errSpan.style.display = 'none';
    errSpan.setAttribute('aria-live', 'polite');
    fieldDiv.appendChild(errSpan);
    item.errSpan = errSpan;
    item.fieldDiv = fieldDiv;

    // Real-time clearance: when user interacts with field that has an error, clear as soon as valid
    function clearIfValid() {
      if (fieldDiv.classList.contains('has-error')) {
        var msg = item.validate();
        if (!msg) {
          setError(item, '');
        }
      }
    }
    rawInput.addEventListener('input', clearIfValid);
    rawInput.addEventListener('change', clearIfValid);
  });

  var ALERT_ICON = '<svg class="icon icon--sm" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  var CHECK_CIRCLE_ICON = '<svg class="icon icon--sm" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';

  function setError(item, msg) {
    var ctrl = item.getControl();
    if (msg) {
      item.fieldDiv.classList.add('has-error');
      item.errSpan.innerHTML = ALERT_ICON + '<span>' + msg + '</span>';
      item.errSpan.style.display = 'flex';
      if (ctrl) {
        ctrl.setAttribute('aria-invalid', 'true');
        ctrl.setAttribute('aria-describedby', item.errSpan.id);
      }
    } else {
      item.fieldDiv.classList.remove('has-error');
      item.errSpan.innerHTML = '';
      item.errSpan.style.display = 'none';
      if (ctrl) {
        ctrl.removeAttribute('aria-invalid');
        ctrl.removeAttribute('aria-describedby');
      }
    }
  }

  // Form Reset synchronization
  form.addEventListener('reset', function () {
    setTimeout(function () {
      fieldConfig.forEach(function (item) { setError(item, ''); });
      if (datePickerInstance) datePickerInstance._clearDate();
      Object.keys(selectInstances).forEach(function (k) { selectInstances[k]._sync(); });
    }, 0);
  });

  // Form Submission handling
  var submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;
    var errorCount = 0;

    fieldConfig.forEach(function (item) {
      if (!item.fieldDiv) return;
      var err = item.validate();
      if (err) {
        setError(item, err);
        errorCount++;
        if (!firstInvalid) {
          firstInvalid = item;
        }
      } else {
        setError(item, '');
      }
    });

    if (firstInvalid) {
      var ctrl = firstInvalid.getControl();
      if (ctrl && typeof ctrl.focus === 'function') {
        ctrl.focus();
      }
      srStatus.textContent = 'Please correct the ' + errorCount + ' error' + (errorCount > 1 ? 's' : '') + ' in the reservation form.';
      return;
    }

    // Success state
    srStatus.textContent = 'Reservation request received. We will hold the view.';
    if (submitBtn) {
      submitBtn.innerHTML = CHECK_CIRCLE_ICON + '<span>REQUEST RECEIVED</span>';
      submitBtn.disabled = true;
    }
  });

})();
