(() => {
  const modal = document.getElementById('lead-modal');
  const form = document.getElementById('lead-form');

  if (!modal || !form) {
    return;
  }

  const status = document.getElementById('lead-form-status');
  const submitButton = form.querySelector('.form__submit');
  const submitInner = submitButton ? submitButton.querySelector('.btn__inner') : null;
  const planCards = [];
  const planInput = () => null;
  const qsId = new URLSearchParams(window.location.search).get('form_id');
  const metaId = document.querySelector('meta[name="formspree-id"]')?.getAttribute('content') || '';
  const submitEndpoint = (() => {
    const raw = form.dataset.submitEndpoint || '';
    if (raw && !raw.includes('SEU_FORM_ID')) return raw;
    if (qsId) return `https://formspree.io/f/${qsId}`;
    if (metaId && !metaId.includes('SEU_FORM_ID')) return `https://formspree.io/f/${metaId}`;
    return '';
  })();

  let activeTrigger = null;

  const setStatus = (message, tone) => {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.classList.remove('is-error', 'is-success');
    if (tone === 'error') {
      status.classList.add('is-error');
    }
    if (tone === 'success') {
      status.classList.add('is-success');
    }
  };

  const setPlan = (planValue) => {
    planCards.forEach((card) => {
      const input = card.querySelector('input[name="plan"]');
      const isSelected = input && input.value === planValue;
      if (input) {
        input.checked = Boolean(isSelected);
      }
      card.classList.toggle('is-selected', Boolean(isSelected));
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      card.setAttribute('role', 'radio');
    });
  };

  const openModal = (planValue, trigger) => {
    activeTrigger = trigger || null;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setStatus('', null);
    form.reset();
    setPlan(planValue || '');
    const firstInput = form.querySelector('#lead-name');
    if (firstInput) {
      firstInput.focus();
    }
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setStatus('', null);
    if (activeTrigger) {
      activeTrigger.focus();
    }
  };

  const setLoading = (isLoading) => {
    if (!submitButton || !submitInner) {
      return;
    }
    submitButton.disabled = isLoading;
    submitInner.textContent = isLoading ? 'Enviando...' : 'Enviar';
  };

  const validateForm = () => {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const whatsapp = form.elements.whatsapp ? form.elements.whatsapp.value.trim() : '';

    if (!name || !email) {
      setStatus('Preencha nome e e-mail para continuar.', 'error');
      return null;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setStatus('Digite um e-mail válido.', 'error');
      return null;
    }

    return { name, email, whatsapp };
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lead-trigger]');
    if (trigger) {
      event.preventDefault();
      openModal(trigger.dataset.plan || '', trigger);
      return;
    }

    const closeAction = event.target.closest('[data-modal-close]');
    if (closeAction) {
      event.preventDefault();
      closeModal();
      return;
    }

    const card = event.target.closest('[data-plan-card]');
    if (card && modal.classList.contains('is-open')) {
      const value = card.dataset.planValue || '';
      setPlan(value);
      setStatus('', null);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = validateForm();
    if (!payload) {
      return;
    }
    if (!submitEndpoint || submitEndpoint.includes('SEU_FORM_ID')) {
      setStatus('Configure o endpoint do Formspree para ativar o envio no GitHub Pages.', 'error');
      return;
    }

    setLoading(true);
    setStatus('', null);

    try {
      const response = await fetch(submitEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          _replyto: payload.email,
          source: window.location.href,
          _subject: `Lead Detraxis`
        })
      });

      let data = null;
      try {
        data = await response.json();
      } catch {}
      if (!response.ok || (data && data.ok === false)) {
        const msg = data && data.errors && data.errors.length ? data.errors[0].message : null;
        throw new Error(msg || 'request_failed');
      }

      setStatus('Obrigado pelo contato. Retornaremos em breve!', 'success');
      form.reset();
      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (error) {
      const m = typeof error?.message === 'string' ? error.message : '';
      setStatus(m || 'Não foi possível enviar agora. Tente novamente em instantes.', 'error');
    } finally {
      setLoading(false);
    }
  });
})();
