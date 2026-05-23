const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');

if (nav && hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.nav-links a, .nav-cta, .brand-pill').forEach(link => {
  link.addEventListener('click', () => {
    if (!nav) return;
    nav.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  });
});

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });
}

const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const business = form.querySelector('#business').value.trim();
    const problem = form.querySelector('#problem').value.trim();

    if (!name || !business || !problem) return;

    const subject = encodeURIComponent(`TebeeAI enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\n\nBusiness: ${business}\n\nWhat is not working:\n${problem}`);

    window.location.href = `mailto:hello@tebeeai.com?subject=${subject}&body=${body}`;
    form.style.display = 'none';
    if (success) success.classList.add('visible');
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 92,
      behavior: 'smooth'
    });
  });
});

// Explore section — hover to preview
const exploreLinks = document.querySelectorAll('.explore-link');
const exploreCards = document.querySelectorAll('.explore-card');

if (exploreLinks.length && exploreCards.length) {
  const activateExplore = (idx) => {
    exploreLinks.forEach((l, i) => l.classList.toggle('active', i === idx));
    exploreCards.forEach((c, i) => c.classList.toggle('active', i === idx));
  };
  activateExplore(0);
  exploreLinks.forEach((link, idx) => {
    link.addEventListener('mouseenter', () => activateExplore(idx));
    link.addEventListener('focus', () => activateExplore(idx));
  });
}

const revealTargets = document.querySelectorAll(
  '.insight-card, .method-card, .story-card, .service-card, .work-row, .feature-grid, .contact-panel, .start-grid'
);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });

  revealTargets.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    element.style.transitionDelay = `${(index % 4) * 55}ms`;
    observer.observe(element);
  });
} else {
  revealTargets.forEach(element => element.classList.add('in-view'));
}
