// ==================== CREATE GROUP ====================

async function initCreateGroup() {
  const form = document.getElementById('create-group-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const groupData = {
        name: formData.get('groupName'),
        contribution_amount: parseFloat(formData.get('contribution')),
        meeting_frequency: formData.get('frequency'),
        payout_order: 'round-robin'
      };

      if (!groupData.name || !groupData.contribution_amount || !groupData.meeting_frequency) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Creating...';

      try {
        const res = await fetch('http://localhost:3000/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupData)
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || 'Failed to create group', 'error');
          return;
        }

        showToast('Group created successfully!');
        setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);

      } catch (err) {
        showToast('Could not connect to server — is the backend running?', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Group';
      }
    });
  }
}

async function loadGroupsFromAPI() {
  try {
    const res = await fetch('http://localhost:3000/groups');
    const groups = await res.json();
    return groups;
  } catch (err) {
    console.warn('Backend not available, falling back to mock data');
    return mockGroups;
  }
}