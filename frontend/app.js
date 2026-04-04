const API = "http://localhost:3000";

// Load groups on page load
async function loadGroups() {
  const res = await fetch(`${API}/groups`);
  const groups = await res.json();

  const list = document.getElementById("groups");
  list.innerHTML = "";

  groups.forEach(g => {
    const li = document.createElement("li");
    li.textContent = `${g.name} (Members: ${g.members.join(", ") || "None"})`;
    list.appendChild(li);
  });
}

// Create a new group
async function createGroup() {
  const name = document.getElementById("groupName").value;
  if (!name) return alert("Enter a group name");

  await fetch(`${API}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  document.getElementById("groupName").value = "";
  loadGroups();
}

// Join an existing group
async function joinGroup() {
  const groupName = document.getElementById("joinGroupName").value;
  const memberName = document.getElementById("memberName").value;

  if (!groupName || !memberName) return alert("Enter group and your name");

  const res = await fetch(`${API}/groups`);
  const groups = await res.json();
  const group = groups.find(g => g.name === groupName);

  if (!group) return alert("Group not found");

  await fetch(`${API}/groups/${group.id}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: memberName })
  });

  document.getElementById("joinGroupName").value = "";
  document.getElementById("memberName").value = "";
  loadGroups();
}

// Initial load
loadGroups();
