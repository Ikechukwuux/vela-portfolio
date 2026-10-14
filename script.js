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
const chapters=[...document.querySelectorAll('.chapter')],storyImgs=[...document.querySelectorAll('.story-img')];if(chapters.length){const activate=i=>{chapters.forEach((c,n)=>c.classList.toggle('active',n===i));storyImgs.forEach((c,n)=>c.classList.toggle('active',n===i))};const so=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top-innerHeight*.45)-Math.abs(b.boundingClientRect.top-innerHeight*.45));if(visible[0])activate(chapters.indexOf(visible[0].target))},{rootMargin:'-32% 0px -42% 0px',threshold:0});chapters.forEach(c=>so.observe(c));activate(0)}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('.menu-section').forEach(s=>{s.hidden=f!=='all'&&s.dataset.category!==f});document.querySelector('.menu-content')?.scrollIntoView({behavior:reduced?'auto':'smooth'})}));
const form=document.querySelector('.form');form?.addEventListener('submit',e=>{e.preventDefault();const b=form.querySelector('button');b.textContent='REQUEST RECEIVED';b.disabled=true});
