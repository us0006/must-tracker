document.addEventListener('DOMContentLoaded', () => { loadUserProfileData(); loadSystemStats(); loadLeaderboard(); loadUserTable(); loadAllAchievements(); });

async function loadUserProfileData() {
    try {
        const res = await fetch('/auth/profile'); const data = await res.json();
        if (data.success) {
            document.getElementById('a-name').innerText = data.name;
            if (document.getElementById('prof_name')) { document.getElementById('prof_name').value = data.name; document.getElementById('prof_email').value = data.email; }
        }
    } catch (e) { }
}

const profileForm = document.getElementById('updateProfileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = { name: document.getElementById('prof_name').value, email: document.getElementById('prof_email').value, currentPassword: document.getElementById('prof_current_pass').value, newPassword: document.getElementById('prof_new_pass').value };
        try {
            const res = await fetch('/auth/update-profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.success) { alert(data.message); document.getElementById('prof_current_pass').value = ''; document.getElementById('prof_new_pass').value = ''; loadUserProfileData(); } else { alert(data.message); }
        } catch (error) { alert("Network error."); }
    });
}

async function loadSystemStats() {
    try {
        const res = await fetch('/admin/stats'); const stats = await res.json();
        document.getElementById('admin-stats').innerHTML = `<div class="stat-card"><h3 class="stat-val gold">${stats.total_students || 0}</h3><span class="stat-label">Students</span></div><div class="stat-card"><h3 class="stat-val green">${stats.total_teachers || 0}</h3><span class="stat-label">Teachers</span></div><div class="stat-card"><h3 class="stat-val blue">${stats.total_achievements || 0}</h3><span class="stat-label">Logged</span></div><div class="stat-card"><h3 class="stat-val red">${stats.pending_approvals || 0}</h3><span class="stat-label">Pending</span></div>`;
    } catch (e) { }
}

async function loadLeaderboard() {
    try {
        const res = await fetch('/admin/leaderboard'); const top = await res.json(); const cont = document.getElementById('leaderboard-grid');
        if (top.length === 0) return cont.innerHTML = '<p>No records.</p>';
        cont.innerHTML = top.map((s, i) => `<div class="leaderboard-card"><div class="medal">${['🥇', '🥈', '🥉'][i] || '🏅'}</div><h4 class="lb-name">${s.name}</h4><p class="sub-text">${s.reg_id}</p><p class="lb-score">${s.achievement_count} Approved</p></div>`).join('');
    } catch (e) { }
}

async function loadUserTable() {
    try {
        const res = await fetch('/admin/users'); const users = await res.json();
        const studs = users.filter(u => u.role === 'student'); const teachs = users.filter(u => u.role === 'teacher');

        const sSelect = document.getElementById('studentSelect'); const tSelect = document.getElementById('teacherSelect');
        if (sSelect) { sSelect.innerHTML = '<option value="all">🎓 Select Student (All)</option>'; studs.forEach((s, i) => sSelect.innerHTML += `<option value="${s.id}">${i + 1}. ${s.name} (${s.reg_id})</option>`); }
        if (tSelect) { tSelect.innerHTML = '<option value="all">👨‍🏫 Select Teacher (All)</option>'; teachs.forEach((t, i) => tSelect.innerHTML += `<option value="${t.id}">${i + 1}. ${t.name} (${t.reg_id})</option>`); }

        const render = (arr) => arr.map(u => `<tr><td>${u.reg_id}</td><td><strong>${u.name}</strong></td><td style="color:${u.status === 'active' ? '#2ecc71' : '#e74c3c'}">${u.status.toUpperCase()}</td><td><button class="btn-toggle" onclick="toggleUser(${u.id}, '${u.status}')" style="background-color:${u.status === 'active' ? '#e74c3c' : '#2ecc71'}">${u.status === 'active' ? 'Deactivate' : 'Activate'}</button></td></tr>`).join('');
        document.getElementById('student-users-body').innerHTML = studs.length ? render(studs) : '<tr><td colspan="4">None</td></tr>';
        document.getElementById('teacher-users-body').innerHTML = teachs.length ? render(teachs) : '<tr><td colspan="4">None</td></tr>';
    } catch (e) { }
}

async function toggleUser(id, st) { if (confirm("Change status?")) { await fetch('/admin/toggle-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, currentStatus: st }) }); loadUserTable(); loadSystemStats(); } }

async function loadAllAchievements() {
    try {
        const res = await fetch('/admin/all-achievements'); const recs = await res.json(); const tbody = document.getElementById('all-ach-body');
        if (recs.length === 0) return tbody.innerHTML = '<tr><td colspan="5">No records</td></tr>';
        tbody.innerHTML = recs.map(r => `<tr data-student-id="${r.user_id}" data-teacher-id="${r.evaluated_by || 'unassigned'}"><td>${new Date(r.created_at).toLocaleDateString()}</td><td><strong>${r.user_name}</strong><br><span class="sub-text">${r.reg_id}</span></td><td>${r.title}</td><td><span class="badge" style="background-color:${r.status === 'approved' ? '#2ecc71' : (r.status === 'rejected' ? '#e74c3c' : '#f39c12')}">${r.status.toUpperCase()}</span></td><td><strong>${r.teacher_name || (r.status === 'pending' ? '<span style="color:#f39c12">Pending</span>' : 'Unknown')}</strong></td></tr>`).join('');
    } catch (e) { }
}

function filterRecords() {
    const sSel = document.getElementById('studentSelect').value; const tSel = document.getElementById('teacherSelect').value;
    document.querySelectorAll('#all-ach-body tr').forEach(r => {
        const mS = (sSel === 'all') || (r.getAttribute('data-student-id') === sSel);
        const mT = (tSel === 'all') || (r.getAttribute('data-teacher-id') === tSel);
        r.style.display = (mS && mT) ? '' : 'none';
    });
}