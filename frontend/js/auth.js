// ==================== AUTH ====================

function initLoginPage() {
  const googleBtn = document.getElementById('google-signin-btn');

  // Google sign-in simulation - role comes from backend in real implementation
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      googleBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10">
            <animate attributeName="stroke-dashoffset" values="0;60" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        Signing in...
      `;
      googleBtn.disabled = true;

      // Simulate authentication delay
      setTimeout(() => {
        // In real app, role would be returned from backend after Google OAuth
        // For demo, we simulate different roles based on mock user data
        const mockUsers = [
          { id: 'user-001', name: 'Thabo Mokoena', email: 'thabo@example.com', role: 'admin', avatar: 'TM' },
          { id: 'user-002', name: 'Sipho Ndlovu', email: 'sipho@example.com', role: 'member', avatar: 'SN' },
          { id: 'user-003', name: 'Nomsa Dlamini', email: 'nomsa@example.com', role: 'treasurer', avatar: 'ND' }
        ];

        // For demo: cycle through roles or randomly assign
        const storedRole = localStorage.getItem('demo_role_index') || '0';
        const roleIndex = parseInt(storedRole);
        const user = mockUsers[roleIndex % mockUsers.length];

        // Store next role index for demo cycling
        localStorage.setItem('demo_role_index', ((roleIndex + 1) % mockUsers.length).toString());

        // Store mock user session
        localStorage.setItem('stokvel_user', JSON.stringify(user));

        // Redirect based on user role from "backend"
        switch (user.role) {
          case 'admin':
            showToast(`Welcome ${user.name}! Redirecting to Admin Dashboard...`);
            setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
            break;
          case 'treasurer':
            showToast(`Welcome ${user.name}! Redirecting to Treasurer Dashboard...`);
            setTimeout(() => window.location.href = 'treasurer-dashboard.html', 1000);
            break;
          case 'member':
          default:
            showToast(`Welcome ${user.name}! Redirecting to Member Dashboard...`);
            setTimeout(() => window.location.href = 'member-dashboard.html', 1000);
            break;
        }
      }, 1500);
    });
  }
}

const NAV_LINKS = {
  admin: [
    { href: 'admin-dashboard.html', testid: 'nav-dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>' },
    { href: 'create-group.html',    testid: 'nav-create-group', label: 'Create Group', icon: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>' },
    { href: 'invite-members.html',  testid: 'nav-invite', label: 'Invite Members', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>' },
    { href: 'contributions.html',   testid: 'nav-contributions', label: 'Contributions', icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' },
  ],
  treasurer: [
    { href: 'treasurer-dashboard.html', testid: 'nav-treasurer-dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>' },
    { href: 'contributions.html',       testid: 'nav-contributions', label: 'Contributions', icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' },
    { href: '#',                        testid: 'nav-payouts', label: 'Payouts', icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>' },
    { href: '#',                        testid: 'nav-reports', label: 'Reports', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>' },
  ],
  member: [
    { href: 'member-dashboard.html', testid: 'nav-member-dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>' },
    { href: 'contributions.html',    testid: 'nav-my-contributions', label: 'My Contributions', icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' },
    { href: '#',                     testid: 'nav-my-groups', label: 'My Groups', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
    { href: '#',                     testid: 'nav-payout-schedule', label: 'Payout Schedule', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' },
  ],
};

function checkAuth() {
  const user = JSON.parse(localStorage.getItem('stokvel_user') || 'null');

  // Update user info in sidebar if session exists
  if (user) {
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (userAvatarEl) userAvatarEl.textContent = user.avatar;
  }

  // Always rebuild sidebar nav — use session role if available, fall back to admin
  const navSection = document.querySelector('.sidebar-nav .nav-section');
  if (!navSection) return;

  const role = user ? user.role : 'admin';
  const links = NAV_LINKS[role] || NAV_LINKS.admin;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navSection.innerHTML = `
    <p class="nav-section-title">Main Menu</p>
    ${links.map(link => `
      <a href="${link.href}" class="nav-link${currentPage === link.href ? ' active' : ''}" data-testid="${link.testid}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${link.icon}
        </svg>
        ${link.label}
      </a>
    `).join('')}
  `;
}

function logout() {
  localStorage.removeItem('stokvel_user');
  window.location.href = 'index.html';
}
