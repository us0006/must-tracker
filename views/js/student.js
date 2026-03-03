let currentEditId = null;
document.addEventListener('DOMContentLoaded', () => { loadUserProfileData(); loadMyAchievements(); });

async function loadUserProfileData() {
    try {
        const res = await fetch('/auth/profile'); const data = await res.json();
        if (data.success) {
            document.getElementById('welcome-name').innerText = `Welcome, ${data.name}`;
            document.getElementById('user-reg').innerText = `Reg: ${data.reg_id}`;
            if(document.getElementById('prof_name')) { document.getElementById('prof_name').value = data.name; document.getElementById('prof_email').value = data.email; }
        }
    } catch(e) { console.error(e); }
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

async function loadMyAchievements() {
    try {
        const res = await fetch('/student/my'); const data = await res.json();
        const statsRow = document.getElementById('summary');
        statsRow.innerHTML = `
            <div class="stat-item"><h3>${String(data.length).padStart(2, '0')}</h3><p>Total</p></div>
            <div class="stat-item"><h3>${String(data.filter(a => a.status === 'approved').length).padStart(2, '0')}</h3><p>Approved</p></div>
            <div class="stat-item"><h3>${String(data.filter(a => a.status === 'pending').length).padStart(2, '0')}</h3><p>Pending</p></div>
        `;
        const tbody = document.getElementById('achievement-table-body');
        tbody.innerHTML = data.map(ach => {
            const safeAch = JSON.stringify(ach).replace(/"/g, '&quot;');
            return `<tr><td>${ach.created_at ? new Date(ach.created_at).toLocaleDateString() : 'N/A'}</td><td>${ach.title}</td><td><span class="status-badge ${ach.status.toLowerCase()}">${ach.status.toUpperCase()}</span></td><td>
                <a href="/uploads/${ach.file}" target="_blank" class="action-btn btn-view">View</a>
                ${ach.status === 'pending' ? `<button onclick="editAch(${safeAch})" class="action-btn btn-edit">Edit</button><button onclick="deleteAch(${ach.id})" class="action-btn btn-delete">Delete</button>` : `<span class="locked-text">(Locked)</span>`}
            </td></tr>`;
        }).join('');
    } catch(e) {}
}

function editAch(ach) {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    document.getElementById('ach_title').value = ach.title; document.getElementById('ach_file').removeAttribute('required');
    currentEditId = ach.id; document.querySelector('#studentSubmitForm button[type="submit"]').innerText = "Update Achievement";
}

const mainForm = document.getElementById("studentSubmitForm");
if (mainForm) {
    mainForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(); formData.append('title', document.getElementById('ach_title').value);
        const fileInput = document.getElementById('ach_file'); if (fileInput.files.length > 0) formData.append('file', fileInput.files[0]);
        const url = currentEditId ? `/student/update/${currentEditId}` : '/student/submit';
        try {
            const res = await fetch(url, { method: currentEditId ? 'PUT' : 'POST', body: formData });
            if (res.ok) { alert("Success!"); currentEditId = null; mainForm.reset(); document.getElementById('ach_file').setAttribute('required', 'true'); loadMyAchievements(); }
        } catch(e) { alert("Error"); }
    });
}
async function deleteAch(id) { if(confirm("Delete?")) { await fetch(`/student/delete/${id}`, { method: 'DELETE' }); loadMyAchievements(); } }