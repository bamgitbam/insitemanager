(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const dialog = document.querySelector('[data-lightbox-dialog]');
  const dialogImage = document.querySelector('[data-lightbox-image]');
  const dialogCaption = document.querySelector('[data-lightbox-caption]');
  const dialogOriginal = document.querySelector('[data-lightbox-original]');
  const dialogClose = document.querySelector('[data-lightbox-close]');
  let dialogTrigger = null;

  // The no-script mobile navigation is visible by default; only collapse it when the controls work.
  if (menuButton && mobileNav) document.documentElement.classList.add('js-enabled');

  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  syncHeader();
  addEventListener('scroll', syncHeader, { passive: true });

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav?.classList.toggle('open', open);
  });

  const closeMobileNav = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    mobileNav?.classList.remove('open');
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav?.classList.contains('open')) {
      closeMobileNav();
      menuButton?.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (mobileNav?.classList.contains('open') && !header?.contains(event.target)) closeMobileNav();
  });
  document.addEventListener('focusin', (event) => {
    if (mobileNav?.classList.contains('open') && !header?.contains(event.target)) closeMobileNav();
  });
  matchMedia('(max-width: 1100px)').addEventListener('change', closeMobileNav);

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Screenshot links open the original image when JS or <dialog> is unavailable.
  // Ordinary unmodified clicks use the lightbox; modified clicks keep native link behavior.
  document.querySelectorAll('a[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!dialog?.showModal || !dialogImage) return;
      event.preventDefault();
      dialogTrigger = trigger;
      dialogImage.src = trigger.href;
      if (dialogOriginal) dialogOriginal.href = trigger.href;
      const embeddedImage = trigger.querySelector('img');
      dialogImage.alt = embeddedImage?.alt || 'InsiteManager screenshot';
      if (dialogCaption) dialogCaption.textContent = trigger.dataset.caption || '';
      dialog.showModal();
    });
  });

  const closeDialog = () => {
    if (!dialog?.open) return;
    dialog.close();
  };
  dialogClose?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener('close', () => {
    dialogImage?.removeAttribute('src');
    dialogOriginal?.removeAttribute('href');
    dialogTrigger?.focus();
    dialogTrigger = null;
  });


  // Step 168: user-controlled horizontal target gallery; swipe/scroll works without JS.
  document.querySelectorAll('[data-target-gallery]').forEach((gallery) => {
    const viewport = gallery.querySelector('[data-target-viewport]');
    const cards = [...viewport.querySelectorAll('.ronin-feature-card')];
    const previous = gallery.querySelector('[data-target-prev]');
    const next = gallery.querySelector('[data-target-next]');
    const count = gallery.querySelector('[data-target-count]');
    if (!cards.length) return;

    const firstVisible = () => {
      const left = viewport.getBoundingClientRect().left;
      let best = 0;
      let distance = Infinity;
      cards.forEach((card, i) => {
        const delta = Math.abs(card.getBoundingClientRect().left - left);
        if (delta < distance) { distance = delta; best = i; }
      });
      return best;
    };
    const updateControls = () => {
      const index = firstVisible();
      const visible = Math.max(1, Math.round(viewport.clientWidth / (cards[0].getBoundingClientRect().width + 16)));
      const end = Math.min(cards.length, index + visible);
      const summary = `${index + 1}${end > index + 1 ? `–${end}` : ''} of ${cards.length}`;
      if (count && count.textContent !== summary) count.textContent = summary;
      if (previous) previous.disabled = viewport.scrollLeft <= 3;
      if (next) next.disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 3;
    };
    const go = (delta) => {
      const index = firstVisible();
      const destination = cards[Math.max(0, Math.min(cards.length - 1, index + delta))];
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      viewport.scrollTo({ left: destination.offsetLeft - cards[0].offsetLeft, behavior: reduce ? 'instant' : 'smooth' });
    };
    previous?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        go(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    viewport.addEventListener('scroll', updateControls, { passive: true });
    addEventListener('resize', updateControls, { passive: true });
    updateControls();
  });

  // Animate only below-the-fold sections. Nothing is hidden if JavaScript or observers fail.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((node) => {
      if (node.getBoundingClientRect().top > window.innerHeight * 0.9) {
        node.classList.add('reveal-pending');
        observer.observe(node);
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
