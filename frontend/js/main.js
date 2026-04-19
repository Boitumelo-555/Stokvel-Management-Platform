// ==================== INITIALIZE ====================
// Single ES module entry point. Each HTML page loads only this file:
//   <script type="module" src="js/main.js"></script>
console.log("THE SWITCHBOARD IS AWAKE!");
import { checkAuth, initLoginPage, logout } from './auth.js';
import { initDashboard }         from './admin-dashboard.js';
import { initTreasurerDashboard, initMemberDashboard } from './dashboards.js';
import { initCreateGroup }       from './groups.js';
import { initInviteMembers }     from './invites.js';
import { initContributions }     from './contributions.js';

// Expose logout globally so HTML onclick="logout()" works
window.logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  console.log("Current Page detected as:", currentPage); // ADD THIS LINE

  if (currentPage !== 'index.html' && currentPage !== '') {
    checkAuth();
  }

  switch (currentPage) {
    case 'index.html':
    case '':
      initLoginPage();
      break;
    case 'admin-dashboard.html':
    case 'admin-dashboard':
      initDashboard();
      break;
    case 'treasurer-dashboard.html':
      initTreasurerDashboard();
      break;
    case 'member-dashboard.html':
      initMemberDashboard();
      break;
    case 'create-group.html':
    case 'create-group':
      initCreateGroup();
      break;
    case 'invite-members.html':
    case 'invite-members': 
      initInviteMembers();
      break;
    case 'contributions.html':
      initContributions();
      break;
  }
});
// ===============================
// MOCK DATA FOR TREASURER DASHBOARD
// ===============================

const mockDashboardData = {
  stats: {
    pending: 5,
    collected: 12500,
    nextPayout: "15 Feb 2026"
  },
  contributions: [
    {
      name: "Thabo Mokoena",
      date: "15 Jan 2026",
      group: "Soweto Savings Club",
      amount: 500,
      status: "Completed"
    },
    {
      name: "Bongani Zulu",
      date: "14 Jan 2026",
      group: "Family Unity Stokvel",
      amount: 1000,
      status: "Completed"
    },
    {
      name: "Lerato Molefe",
      date: "14 Jan 2026",
      group: "Soweto Savings Club",
      amount: 500,
      status: "Pending"
    },
    {
      name: "Mandla Khumalo",
      date: "13 Jan 2026",
      group: "Young Professionals",
      amount: 750,
      status: "Completed"
    },
    {
      name: "Zanele Nkosi",
      date: "12 Jan 2026",
      group: "Family Unity Stokvel",
      amount: 1000,
      status: "Late"
    }
  ]
};

// ===============================
// LOAD MOCK DATA INTO UI
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadTable();
});

// ===============================
// UPDATE STATS
// ===============================

function loadStats() {
  const statValues = document.querySelectorAll(".stat-value");

  if (statValues.length >= 3) {
    statValues[0].textContent = mockDashboardData.stats.pending;
    statValues[1].textContent = `R ${mockDashboardData.stats.collected.toLocaleString()}`;
    statValues[2].textContent = mockDashboardData.stats.nextPayout;
  }
}

// ===============================
// UPDATE TABLE
// ===============================

function loadTable() {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  mockDashboardData.contributions.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.date}</td>
      <td>${item.group}</td>
      <td class="amount-cell">R ${item.amount}</td>
      <td>${getStatusBadge(item.status)}</td>
    `;

    tableBody.appendChild(row);
  });
}

// ===============================
// STATUS BADGE HELPER
// ===============================

function getStatusBadge(status) {
  if (status === "Completed") {
    return `<mark class="badge badge-success">Completed</mark>`;
  }
  if (status === "Pending") {
    return `<mark class="badge badge-warning">Pending</mark>`;
  }
  if (status === "Late") {
    return `<mark class="badge badge-error">Late</mark>`;
  }
  return status;
}

// ===============================
// MOCK LOGOUT FUNCTION
// ===============================

function logout() {
  alert("Logged out successfully (mock)");
}
