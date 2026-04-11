// ==================== INVITE MEMBERS ====================

async function initInviteMembers() {
  await loadInvitesFromAPI();

  const form = document.getElementById('invite-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('invite-email');
      const email = emailInput.value.trim();

      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      try {
        const res = await fetch('http://localhost:3000/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            name: email.split('@')[0],
            role: 'member',
            group_id: null
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || 'Failed to send invite', 'error');
          return;
        }

        showToast(`Invitation sent to ${email}`);
        emailInput.value = '';
        await loadInvitesFromAPI();

      } catch (err) {
        showToast('Could not connect to server — is the backend running?', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send Invite
        `;
      }
    });
  }
}

async function loadInvitesFromAPI() {
  try {
    const res = await fetch('http://localhost:3000/invites');
    const invites = await res.json();
    renderInviteListFromAPI(invites);
  } catch (err) {
    console.warn('Backend not available, falling back to mock data');
    renderInviteList();
  }
}

function renderInviteListFromAPI(invites) {
  const inviteList = document.getElementById('invite-list');
  if (!inviteList) return;

  if (invites.length === 0) {
    inviteList.innerHTML = `
      <section class="empty-state">
        <p>No invitations sent yet</p>
      </section>
    `;
    return;
  }

  inviteList.innerHTML = invites.map(invite => `
    <article class="invite-item" data-testid="invite-item-${invite.id}">
      <section>
        <p class="invite-email">${invite.email}</p>
        <small class="invite-date">Sent on ${formatDate(invite.created_at)}</small>
      </section>
      <mark class="badge ${invite.status === 'accepted' ? 'badge-success' : 'badge-warning'}">
        ${invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
      </mark>
    </article>
  `).join('');
}

function renderInviteList() {
  const inviteList = document.getElementById('invite-list');
  if (!inviteList) return;

  if (mockInvites.length === 0) {
    inviteList.innerHTML = `
      <section class="empty-state">
        <p>No invitations sent yet</p>
      </section>
    `;
    return;
  }

  inviteList.innerHTML = mockInvites.map(invite => `
    <article class="invite-item" data-testid="invite-item-${invite.id}">
      <section>
        <p class="invite-email">${invite.email}</p>
        <small class="invite-date">Sent on ${formatDate(invite.sentAt)}</small>
      </section>
      <mark class="badge ${invite.status === 'accepted' ? 'badge-success' : 'badge-warning'}">
        ${invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
      </mark>
    </article>
  `).join('');
}