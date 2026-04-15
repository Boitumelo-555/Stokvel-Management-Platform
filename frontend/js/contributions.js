import { getMyContributions } from './supabase-client.js';

const tableBody = document.getElementById('contributions-table-body');
const filter = document.getElementById('contribution-filter');
const totalEl = document.getElementById('total-contributions');
const countEl = document.getElementById('contribution-count');

let contributions = [];

async function loadContributions() {
  try {
    const raw = await getMyContributions();

    contributions = raw.map(c => ({
      id: c.id,
      date: c.due_date,
      group: c.groups?.name || 'No Group',
      amount: Number(c.amount),
      status: c.status || 'pending'
    }));

    renderTable(contributions);
    updateStats(contributions);
  } catch (err) {
    console.error(err);
  }
}

function renderTable(data) {
  tableBody.innerHTML = '';

  data.forEach(c => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${c.date}</td>
      <td>${c.group}</td>
      <td>R ${c.amount}</td>
      <td>${capitalize(c.status)}</td>
    `;

    tableBody.appendChild(row);
  });
}

function updateStats(data) {
  const total = data.reduce((sum, c) => sum + c.amount, 0);

  totalEl.textContent = total.toFixed(2);
  countEl.textContent = data.length;
}

filter?.addEventListener('change', () => {
  const value = filter.value;

  if (value === 'all') {
    renderTable(contributions);
    updateStats(contributions);
  } else {
    const filtered = contributions.filter(c => c.status === value);
    renderTable(filtered);
    updateStats(filtered);
  }
});

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

loadContributions();
