document.addEventListener('DOMContentLoaded', () => { loadUserProfileData(); loadDashboardStats(); loadPendingSubmissions(); loadVerificationHistory(); });

async function loadUserProfileData() {
    try {
        const res = await fetch('/auth/profile'); const data = await res.json();
        if (data.success) {
            document.getElementById('t-name').innerText = data.name;
            if(document.getElementById('prof_name')) { document.getElementById('prof_name').value = data.name; document.getElementById('prof_email').value = data.email; }
        }
    } catch(e) {}
}

const profileForm = document.getElementById('updateProfileForm');
if(profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = { name: document.getElementById('prof_name').value, email: document.getElementById('prof_email').value, currentPassword: document.getElementById('prof_current_pass').value, newPassword: document.getElementById('prof_new_pass').value };
        try {
            const res = await fetch('/auth/update-profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if(data.success) { alert(data.message); document.getElementById('prof_current_pass').value = ''; document.getElementById('prof_new_pass').value = ''; loadUserProfileData(); } else { alert(data.message); }
        } catch(error) { alert("Network error."); }
    });
}

async function loadDashboardStats() {
    try {
        const res = await fetch('/teacher/stats'); const stats = await res.json();
        const pending = stats.find(s => s.status === 'pending')?.count || 0; const approved = stats.find(s => s.status === 'approved')?.count || 0; const rejected = stats.find(s => s.status === 'rejected')?.count || 0;
        document.getElementById('teacher-stats').innerHTML = `<div class="stat-item"><h3 class="stat-value pending">${pending}</h3><span class="stat-label">Total Pending</span></div><div class="stat-item"><h3 class="stat-value approved">${approved}</h3><span class="stat-label">Approved</span></div><div class="stat-item"><h3 class="stat-value rejected">${rejected}</h3><span class="stat-label">Rejected</span></div>`;
    } catch(e) {}
}

async function loadPendingSubmissions() {
    const list = document.getElementById('pending-list');
    try {
        const res = await fetch('/teacher/pending'); const data = await res.json();
        if (data.length === 0) { list.innerHTML = '<p style="text-align:center;">No pending submissions.</p>'; return; }
        list.innerHTML = data.map(sub => `
            <div class="submission-card" data-search="${sub.name.toLowerCase()} ${sub.reg_id.toLowerCase()}">
                <p><strong>Student:</strong> ${sub.name} (${sub.reg_id})</p><p><strong>Achievement:</strong> ${sub.title}</p>
                <a href="/uploads/${sub.file}" target="_blank" class="doc-link">📄 View Document</a>
                <textarea id="rem-${sub.id}" class="remarks-input" placeholder="Add remarks..."></textarea>
                <div class="action-group"><button class="btn-approve" onclick="verify(${sub.id}, 'approve')">Approve</button><button class="btn-reject" onclick="verify(${sub.id}, 'reject')">Reject</button></div>
            </div>`).join('');
    } catch(err) {}
}

function filterSubmissions() {
    const query = document.getElementById('filterInput').value.toLowerCase(); const items = document.querySelectorAll('.submission-card');
    items.forEach(item => { item.style.display = item.getAttribute('data-search').includes(query) ? 'block' : 'none'; });
}

async function verify(id, action) {
    const remarks = document.getElementById(`rem-${id}`).value;
    if(action === 'reject' && !remarks.trim()) return alert("Remarks required.");
    if(!confirm(`Confirm ${action}?`)) return;
    const res = await fetch('/teacher/' + action, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id, remarks }) });
    if (res.ok) { alert("Success!"); loadPendingSubmissions(); loadVerificationHistory(); loadDashboardStats(); }
}

async function loadVerificationHistory() {
    try {
        const res = await fetch('/teacher/history'); const data = await res.json(); const tbody = document.getElementById('history-table-body');
        if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No records.</td></tr>`; return; }
        tbody.innerHTML = data.map(record => `<tr><td>${new Date(record.created_at).toLocaleDateString()}</td><td><strong>${record.student_name}</strong><br><span class="stat-label" style="font-weight:normal;">${record.reg_id}</span></td><td>${record.title}</td><td><span class="badge" style="background-color: ${record.status === 'approved' ? '#2ecc71' : '#e74c3c'}">${record.status.toUpperCase()}</span></td><td>${record.remarks || ''}</td><td><a href="/uploads/${record.file}" target="_blank" class="doc-link">View File</a></td></tr>`).join('');
    } catch(err) {}
}