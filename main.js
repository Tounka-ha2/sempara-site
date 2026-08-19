(() => {
  'use strict';

  /* ============ Sélection du type de site ============ */
  const cards = document.querySelectorAll('.card[data-type]');
  const siteTypeInput = document.getElementById('siteType');
  const typeLabels = {
    vitrine: 'Site vitrine',
    professionnel: 'Site professionnel'
  };

  function selectCard(card) {
    cards.forEach(c => c.setAttribute('aria-checked', 'false'));
    card.setAttribute('aria-checked', 'true');
    const type = card.getAttribute('data-type');
    if (siteTypeInput) {
      siteTypeInput.value = typeLabels[type] || type;
    }
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      selectCard(card);
      const questionnaire = document.getElementById('questionnaire');
      if (questionnaire) {
        setTimeout(() => questionnaire.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ============ Multi-étapes du formulaire ============ */
  const form = document.getElementById('clientForm');
  const steps = Array.from(document.querySelectorAll('.form__step'));
  const progressFill = document.getElementById('progressFill');
  const progressSteps = document.querySelectorAll('.progress__step');
  const nextStep1 = document.getElementById('nextStep1');
  const prevStep2 = document.getElementById('prevStep2');
  const confirmation = document.getElementById('confirmation');
  const questionnaireSection = document.getElementById('questionnaire');
  const submitBtn = document.getElementById('submitForm');
  const restartBtn = document.getElementById('restartBtn');

  const progressByStep = { 1: '50%', 2: '100%' };

  function goToStep(stepNumber) {
    steps.forEach(step => {
      const isActive = Number(step.getAttribute('data-step')) === stepNumber;
      step.classList.toggle('form__step--active', isActive);
    });
    progressSteps.forEach(el => {
      el.classList.toggle('progress__step--active', Number(el.getAttribute('data-step')) <= stepNumber);
    });
    if (progressFill) progressFill.style.width = progressByStep[stepNumber] || '50%';
  }

  function validateFields(container) {
    let valid = true;
    const fields = container.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(field => {
      field.classList.remove('field--invalid');
      if (!field.value || !field.value.trim()) {
        valid = false;
        field.classList.add('field--invalid');
      }
    });
    return valid;
  }

  if (nextStep1) {
    nextStep1.addEventListener('click', () => {
      const step1 = document.querySelector('.form__step[data-step="1"]');
      if (!validateFields(step1)) return;
      goToStep(2);
    });
  }

  if (prevStep2) {
    prevStep2.addEventListener('click', () => goToStep(1));
  }

  document.querySelectorAll('.form__group input, .form__group select, .form__group textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('field--invalid'));
    field.addEventListener('change', () => field.classList.remove('field--invalid'));
  });

  /* ============ Envoi du formulaire ============ */
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const step2 = document.querySelector('.form__step[data-step="2"]');
      if (!validateFields(step2)) return;

      const originalContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });

        if (!response.ok) throw new Error('Échec de l\'envoi');

        showConfirmation();
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        alert('Une erreur est survenue lors de l\'envoi. Merci de réessayer ou de nous contacter directement à sempara.sn@gmail.com.');
      }
    });
  }

  function showConfirmation() {
    if (questionnaireSection) questionnaireSection.hidden = true;
    if (confirmation) {
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      setTimeout(() => {
        form.reset();
        cards.forEach(c => c.setAttribute('aria-checked', 'false'));
        goToStep(1);
        if (confirmation) confirmation.hidden = true;
        if (questionnaireSection) questionnaireSection.hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Envoyer ma demande <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
      }, 300);
    });
  }
})();
