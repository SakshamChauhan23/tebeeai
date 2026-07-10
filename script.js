// Cookie consent
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieDecline = document.getElementById('cookieDecline');
const COOKIE_CONSENT_KEY = 'tebeeai-cookie-consent';

function applyCookieConsent(value) {
  if (typeof gtag === 'function') {
    gtag('consent', 'update', { analytics_storage: value === 'granted' ? 'granted' : 'denied' });
  }
}

if (cookieBanner) {
  const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

  if (storedConsent) {
    applyCookieConsent(storedConsent);
  } else {
    cookieBanner.classList.add('visible');
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'granted');
      applyCookieConsent('granted');
      cookieBanner.classList.remove('visible');
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'denied');
      applyCookieConsent('denied');
      cookieBanner.classList.remove('visible');
    });
  }
}

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
const WEB3FORMS_KEY = 'cf8cbdd7-bbc5-403f-aa5b-616948f88682';
const SUPABASE_URL = 'https://fxlyuykucnydxqtapbgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bHl1eWt1Y255ZHhxdGFwYmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDA4NjYsImV4cCI6MjA5ODc3Njg2Nn0.-ILnbGUzddi1B4ORvOr-B7AzFS7-bLxaGA75_h7Q1J8';

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const business = form.querySelector('#business').value.trim();
    const problem = form.querySelector('#problem').value.trim();

    if (!name || !email || !business || !problem) return;

    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Store the submission in Supabase. Best effort: never blocks the email flow below.
    fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, email, business, problem })
    }).catch(() => {});

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `TebeeAI enquiry from ${name}`,
          name,
          email,
          business,
          problem
        })
      });

      const data = await res.json();
      if (data.success) {
        form.style.display = 'none';
        if (success) success.classList.add('visible');
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send enquiry →';
        alert('Something went wrong. Please try again.');
      }
    } catch {
      const subject = encodeURIComponent(`TebeeAI enquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nBusiness: ${business}\n\nWhat is not working:\n${problem}`);

      if (success) {
        const heading = success.querySelector('h3');
        const message = success.querySelector('p');
        if (heading) heading.textContent = 'Almost there.';
        if (message) message.textContent = 'Your email client should now open with your enquiry ready to send. We appreciate your patience, and look forward to hearing from you.';
        form.style.display = 'none';
        success.classList.add('visible');
      }

      window.location.href = `mailto:hello@tebeeai.online?subject=${subject}&body=${body}`;
    }
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

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (!btn || !answer) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : '';
  });
});

const revealTargets = document.querySelectorAll(
  '.insight-card, .method-card, .story-card, .service-card, .work-row, .feature-grid, .contact-panel, .capability-card, .pricing-card, .pricing-value, .faq-item'
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

// Hero flow diagram — lines draw in and zones drift as the page scrolls
const heroFlow = document.getElementById('heroFlow');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroFlow && !reduceMotion) {
  const paths = Array.from(heroFlow.querySelectorAll('.hf-path'));
  const zones = Array.from(heroFlow.querySelectorAll('.hf-quadrant'));
  const lengths = paths.map(path => path.getTotalLength());

  paths.forEach((path, index) => {
    path.style.strokeDasharray = String(lengths[index]);
  });

  let ticking = false;

  const updateFlow = () => {
    const rect = heroFlow.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));

    paths.forEach((path, index) => {
      const length = lengths[index];
      const drawn = Math.min(length, Math.max(0, (progress * 1.35 - index * 0.025) * length));
      path.style.strokeDashoffset = String(length - drawn);
    });

    zones.forEach((zone, index) => {
      const depth = index % 2 === 0 ? 12 : -16;
      zone.style.transform = `translateY(${(0.5 - progress) * depth}px)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFlow);
  }, { passive: true });

  window.addEventListener('resize', updateFlow);
  updateFlow();
} else if (heroFlow) {
  heroFlow.querySelectorAll('.hf-path').forEach(path => {
    path.style.strokeDasharray = 'none';
  });
}
