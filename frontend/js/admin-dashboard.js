// ==================== ADMIN DASHBOARD ====================

function initDashboard() {
  renderStats();
  renderGroups();
}

function renderStats() {
  const totalMembers = mockGroups.reduce((sum, g) => sum + g.members, 0);
  const totalSavings = mockGroups.reduce((sum, g) => sum + g.totalSavings, 0);
  const activeGroups = mockGroups.length;

  const statsContainer = document.getElementById('stats-grid');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <article class="stat-card" data-testid="stat-total-members">
        <figure class="stat-card-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </figure>
        <strong class="stat-value">${totalMembers}</strong>
        <p class="stat-label">Total Members</p>
      </article>
      <article class="stat-card" data-testid="stat-total-savings">
        <figure class="stat-card-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </figure>
        <strong class="stat-value">${formatCurrency(totalSavings)}</strong>
        <p class="stat-label">Total Savings</p>
      </article>
      <article class="stat-card" data-testid="stat-active-groups">
        <figure class="stat-card-icon amber">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </figure>
        <strong class="stat-value">${activeGroups}</strong>
        <p class="stat-label">Active Groups</p>
      </article>
    `;
  }
}

async function renderGroups() {
  const groupsContainer = document.getElementById('groups-grid');
  if (!groupsContainer) return;

  const groups = await loadGroupsFromAPI();

  if (groups.length === 0) {
    groupsContainer.innerHTML = `
      <section class="empty-state">
        <aside class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </aside>
        <h3>No groups yet</h3>
        <p>Create your first stokvel group to get started</p>
        <a href="create-group.html" class="btn btn-primary">Create Group</a>
      </section>
    `;
    return;
  }

  groupsContainer.innerHTML = groups.map(group => `
    <article class="group-card" data-testid="group-card-${group.id}">
      <header class="group-card-header">
        <section>
          <h3 class="group-name">${group.name}</h3>
          <mark class="badge badge-success">active</mark>
        </section>
      </header>
      <footer class="group-meta">
        <p class="group-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          ${formatCurrency(group.contribution_amount || group.contribution)} / ${group.meeting_frequency || group.frequency}
        </p>
      </footer>
    </article>
  `).join('');
}