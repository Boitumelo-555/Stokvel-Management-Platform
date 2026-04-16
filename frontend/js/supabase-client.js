// ============================================================
// supabase-client.js
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL     = 'https://wzclnjbzouqietbordxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Y2xuamJ6b3VxaWV0Ym9yZHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5Mjc4OTEsImV4cCI6MjA5MTUwMzg5MX0.g4OqfuhERKGq0Ttdb-PinPMVnOdvNucTTfJtM_cXZZk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== AUTH ====================

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/index.html' },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem('stokvel_user');
}

/**
 * Returns the current user from Supabase session OR localStorage.
 * The localStorage fallback covers demo/manual logins where no
 * real OAuth token exists, so auth.uid() would be null.
 */
export async function getCurrentUser() {
  // Check LocalStorage first - this is what you have in your screenshot
  const stored = localStorage.getItem('stokvel_user');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.id) {
      return { id: parsed.id, email: parsed.email };
    }
  }

  // Fallback to Supabase if LocalStorage is empty
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getMyRole() {
  const { data, error } = await supabase.rpc('get_my_role');
  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const role    = await getMyRole();
      const profile = await getProfile(session.user.id);
      callback({ event, session, role, profile });
    } else if (event === 'SIGNED_OUT') {
      callback({ event, session: null, role: null, profile: null });
    }
  });
}

// ==================== PROFILES ====================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

// ==================== GROUPS ====================

/**
 * Create a new stokvel group.
 * NOTE: 'frequency' must be lowercase to match the DB CHECK constraint:
 *   ('weekly', 'bi-weekly', 'monthly')
 * NOTE: 'start_date' column does NOT exist in the groups table — omitted.
 */
export async function createGroup(groupData) {
  console.log("--- DATABASE INSERT STARTING ---");

  try {
    // 1. Get User ID
    const stored = JSON.parse(localStorage.getItem('stokvel_user'));
    const userId = stored ? stored.id : null;

    if (!userId) {
      throw new Error("No User ID found. Please log in again.");
    }

    // 2. Prepare Data (Careful with types!)
    const cleanData = {
      name: String(groupData.name || 'Unnamed Group'),
      description: String(groupData.description || ''),
      contribution_amount: Number(groupData.contributionAmount || 0),
      frequency: String(groupData.frequency || 'monthly').toLowerCase(),
      max_members: 20,
      created_by: userId
    };

    console.log("Data being sent to Supabase:", cleanData);

    // 3. The Actual Database Call
    const { data, error } = await supabase
      .from('groups')
      .insert([cleanData])
      .select(); // Adding .select() helps some Supabase versions confirm the save

    if (error) {
    console.error("DATABASE ERROR:", error.message);
    // This allows the button to be clicked again if there's an error
    throw error; 
  }

  console.log("--- SUCCESS! ---");
  window.location.href = 'admin-dashboard.html';
  return { success: true, data };

  } catch (err) {
    console.error("CRITICAL ERROR IN createGroup:", err.message);
    throw err;
  }
}

/**
 * Fetch all groups this user created or belongs to.
 * Uses two separate queries to avoid the Supabase .or() foreign-table
 * limitation which causes errors when filtering on related tables.
 */
export async function getMyGroups() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Query 1: groups the user created
  const { data: created, error: e1 } = await supabase
    .from('groups')
    .select('*, group_members(user_id)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  // Query 2: groups the user is a member of (but didn't create)
  const { data: membership, error: e2 } = await supabase
    .from('group_members')
    .select('group_id, groups(*, group_members(user_id))')
    .eq('user_id', user.id);

  if (e1 && e2) throw e1; // both failed

  const groups = [...(created || [])];

  // Merge in member groups, avoiding duplicates
  const createdIds = new Set(groups.map(g => g.id));
  for (const row of (membership || [])) {
    if (row.groups && !createdIds.has(row.groups.id)) {
      groups.push(row.groups);
    }
  }

  // Sort by created_at descending
  groups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return groups;
}

// ==================== INVITATIONS ====================

export async function sendInvitation(groupId, email, role = 'member') {
  console.log('=== sendInvitation called ===');
  console.log('groupId:', groupId);
  console.log('email:', email);
  console.log('role:', role);
  
  const user = await getCurrentUser();
  if (!user) throw new Error('Not logged in');
  
  console.log('Current user:', user.id);
  
  // Generate a unique token for the invite link
  const token = crypto.randomUUID();
  console.log('Generated token:', token);
  
  const invitationData = {
    group_id: groupId,
    email,
    invited_by: user.id,
    status: 'pending',
    token,
    role,
  };
  
  console.log('Attempting to insert:', invitationData);
  
  const { data, error } = await supabase
    .from('invitations')
    .insert(invitationData)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    console.error('Error details:', error.message, error.details, error.hint);
    throw error;
  }
  
  console.log('Invitation created successfully:', data);
  return data;
}

export async function getGroupInvitations(groupId) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function acceptInvitation(token) {
  const { data, error } = await supabase.rpc('accept_invitation', { _token: token });
  if (error) throw error;
  return data;
}

// ==================== CONTRIBUTIONS ====================

export async function getMyContributions() {
  const { data, error } = await supabase
    .from('contributions')
    .select('*, groups(name)')
    .order('due_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function recordContribution({ groupId, userId, amount, dueDate, status }) {
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      group_id: groupId,
      user_id: userId,
      amount,
      due_date: dueDate,
      status: status || 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
