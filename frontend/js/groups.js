// ==================== CREATE GROUP ====================
import { createGroup } from './supabase-client.js';
import { showToast } from './utils.js';

export function initCreateGroup() {
  const form = document.getElementById('create-group-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name               = form.querySelector('#groupName').value.trim();
    const contributionAmount = parseFloat(form.querySelector('#contribution').value);
    const frequency          = form.querySelector('#frequency').value;
    const startDate          = form.querySelector('#startDate')?.value || null;
    const description        = form.querySelector('#description')?.value.trim() || '';

    // Client-side validation
    if (!name) {
      showToast('Please enter a group name', 'error');
      return;
    }
    if (!contributionAmount || contributionAmount < 100) {
      showToast('Minimum contribution is R100', 'error');
      return;
    }
    if (!frequency) {
      showToast('Please select a contribution frequency', 'error');
      return;
    }

    // Normalise frequency to lowercase to match DB CHECK constraint
    // DB accepts: 'weekly' | 'bi-weekly' | 'monthly'
    const frequencyNormalised = frequency.toLowerCase();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating…';

    try {
      await createGroup({
        name,
        description,
        contributionAmount,
        frequency: frequencyNormalised,
        maxMembers: 20,   // sensible default — form has no such field
        startDate,
      });
      showToast('Group created successfully!');
      setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 800);
    } catch (err) {
      console.error('createGroup error:', err);
      // Surface the real error so it's never silently swallowed
      const msg = err?.message || 'Unknown error creating group';
      showToast('Error: ' + msg, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Create Group
      `;
    }
  });
}
