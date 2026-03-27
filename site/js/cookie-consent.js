(() => {
  const KEY = 'detraxis_cookie_consent';
  const hasDecision = () => {
    try { return !!localStorage.getItem(KEY); } catch { return false; }
  };
  if (hasDecision()) return;

  const accept = () => {
    try { localStorage.setItem(KEY, 'accepted'); } catch {}
    teardown();
  };
  const reject = () => {
    try { localStorage.setItem(KEY, 'rejected'); } catch {}
    teardown();
  };

  const root = document.createElement('div');
  root.className = 'cookie-consent';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-live', 'polite');

  root.innerHTML = `
    <div class="cookie-consent__bar" aria-label="Preferências de cookies">
      <div class="cookie-consent__text">
        Usamos cookies leves para medir tráfego e melhorar sua experiência. Nenhum dado sensível é coletado.
      </div>
      <div class="cookie-consent__actions">
        <button type="button" class="btn btn--outline" data-cc-reject>Recusar</button>
        <button type="button" class="btn btn--primary" data-cc-accept>
          <span class="btn__inner"><span>Aceitar</span></span>
        </button>
      </div>
    </div>
  `;

  const teardown = () => {
    const bar = root.querySelector('.cookie-consent__bar');
    if (bar) {
      bar.classList.remove('is-visible');
      setTimeout(() => {
        root.remove();
      }, 280);
    } else {
      root.remove();
    }
  };

  const onReady = () => {
    document.body.appendChild(root);
    const bar = root.querySelector('.cookie-consent__bar');
    const acc = root.querySelector('[data-cc-accept]');
    const rej = root.querySelector('[data-cc-reject]');
    if (acc) acc.addEventListener('click', accept);
    if (rej) rej.addEventListener('click', reject);
    requestAnimationFrame(() => {
      if (bar) bar.classList.add('is-visible');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
