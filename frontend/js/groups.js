// ==================== CREATE GROUP ====================
import { createGroup } from './supabase-client.js'; 
import { showToast } from './utils.js'; 
 
export function initCreateGroup() { 
  console.log("--- initCreateGroup function has STARTED ---"); 
  const form = document.getElementById('create-group-form'); 
  
  if (!form) {
    console.log("--- ERROR: Form NOT found in HTML! ---");
    return;
  } 

  const submitBtn = form.querySelector('button[type="submit"]'); 
 
  form.addEventListener('submit', async (e) => { 
    e.preventDefault();
    console.log("Step 2: The button was clicked!");
 
    // Collect the data from the form
    const name = form.querySelector('#groupName').value.trim(); 
    const contributionAmount = parseFloat(form.querySelector('#contribution').value); 
    const frequency = form.querySelector('#frequency').value; 
    const description = form.querySelector('#description')?.value.trim() || ''; 
    const startDate = form.querySelector('#startDate')?.value || null;

    console.log("Step 3: Preparing to send to Supabase...");

    // Disable button so they don't click twice
    if (submitBtn) {
      submitBtn.disabled = true; 
      submitBtn.textContent = 'Creating...'; 
    }
 
    try { 
      await createGroup({ 
        name, 
        description, 
        contributionAmount, 
        frequency, 
        maxMembers: 20,
        startDate
      }); 

      console.log("Step 4: SUCCESS!");
      showToast('Group created successfully!'); 
      
      // Give the database 1 second to breathe, then go to dashboard
      setTimeout(() => { 
        window.location.href = 'admin-dashboard.html'; 
      }, 1000); 

    } catch (err) { 
      console.log("Step 4: FAILED with error:", err.message);
      showToast('Error: ' + err.message, 'error'); 
      
      // Reset button so user can try again
      if (submitBtn) {
        submitBtn.disabled = false; 
        submitBtn.textContent = 'Create Group';
      }
    }
  });
}