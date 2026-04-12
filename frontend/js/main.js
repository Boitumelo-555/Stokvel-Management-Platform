// ==================== INITIALIZE ====================
// Entry point — routes to the correct page initializer based on current HTML file.
// Load order for HTML pages (replace the single app.js script tag with these, in order):
//   <script src="js/data.js"></script>
//   <script src="js/utils.js"></script>
//   <script src="js/auth.js"></script>
//   <script src="js/admin-dashboard.js"></script>
//   <script src="js/groups.js"></script>
//   <script src="js/invites.js"></script>
//   <script src="js/contributions.js"></script>
//   <script src="js/dashboards.js"></script>
//   <script src="js/main.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Check auth for protected pages
  if (currentPage !== 'index.html') {
    checkAuth();
  }

  // Initialize page-specific functionality
  switch (currentPage) {
    case 'index.html':
    case '':
      initLoginPage();
      break;
    case 'admin-dashboard.html':
      initDashboard();
      break;
    case 'treasurer-dashboard.html':
      initTreasurerDashboard();
      break;
    case 'member-dashboard.html':
      initMemberDashboard();
      break;
    case 'create-group.html':
      initCreateGroup();
      break;
    case 'invite-members.html':
      initInviteMembers();
      break;
    case 'contributions.html':
      initContributions();
      break;
  }
});
