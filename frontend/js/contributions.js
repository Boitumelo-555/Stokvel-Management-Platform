// ==================== CONTRIBUTIONS ====================

function initContributions() {
  renderContributionsTable();

  // Filter functionality
  const filterSelect = document.getElementById('contribution-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      renderContributionsTable(filterSelect.value);
    });
  }
}

function renderContributionsTable(filter = 'all') {
  const tableBody = document.getElementById('contributions-table-body');
  if (!tableBody) return;

  let filteredContributions = mockContributions;
  if (filter !== 'all') {
    filteredContributions = mockContributions.filter(c => c.status.toLowerCase() === filter);
  }

  if (filteredContributions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding: 2rem;">
          No contributions found
        </td>
      </tr>
    `;
    return;
    
  }

  // Calculate totals
  const totalAmount =filteredContributions.reduce((sum, c) => sum + c.amount, 0);
  document.getElementById('total-contributions').textContent = formatCurrency(totalAmount);
  document.getElementById('contribution-count').textContent = filteredContributions.length;

  tableBody.innerHTML = filteredContributions.map(contribution => `
    <tr data-testid="contribution-row-${contribution.id}">
      <td>${formatDate(contribution.date)}</td>
      <td>${contribution.group}</td>
      <td class="amount-cell">${formatCurrency(contribution.amount)}</td>
      <td>
        <mark class="badge ${
          contribution.status === 'Completed' ? 'badge-success' :
          contribution.status === 'Pending' ? 'badge-warning' : 'badge-error'
        }">${contribution.status}</mark>
      </td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="viewReceipt('${contribution.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View
        </button>
      </td>
    </tr>
  `).join('');
}

function viewReceipt(contributionId) {
  const contribution = mockContributions.find(c => c.id === contributionId);
  if (contribution) {
    showToast(`Receipt for ${formatCurrency(contribution.amount)} on ${formatDate(contribution.date)}`);
  }
}
