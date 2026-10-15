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
  toggle.textContent = open ? '✕' : '☰';
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

  // Passive scroll listener with requestAnimationFrame & 55% activation line
  let tickingStory = false;
  const updateStory = () => {
    tickingStory = false;
    const activationLine = window.innerHeight * 0.55;
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
  const initialActivationLine = window.innerHeight * 0.55;
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
const form=document.querySelector('.form');form?.addEventListener('submit',e=>{e.preventDefault();const b=form.querySelector('button');b.textContent='REQUEST RECEIVED';b.disabled=true});
