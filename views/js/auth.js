/* ==========================================
   AUTHENTICATION UI LOGIC - MUST TRACKER
   ========================================== */

// 1. Toggle between Login and Register
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Safety check to ensure elements exist before toggling
    if (!loginForm || !registerForm) return;

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// 2. Dynamic UI for Registration Number/ID
function updateRegistrationUI() {
    const roleSelect = document.getElementById('reg_role');
    const sessionContainer = document.getElementById('session_container');
    const idLabel = document.getElementById('id_label');
    const idInput = document.getElementById('reg_id');

    if (!roleSelect || !idLabel || !idInput) return;

    const role = roleSelect.value;

    if (role === 'student') {
        if (sessionContainer) sessionContainer.style.display = 'block';
        idLabel.innerText = "Registration Number";
        idInput.placeholder = "FA23-BSE-048";
    } else {
        if (sessionContainer) sessionContainer.style.display = 'none';
        // Handle Teacher and Admin ID Labels
        idLabel.innerText = role === 'teacher' ? "Employee ID" : "Administrator ID";
        idInput.placeholder = role === 'teacher' ? "EMP-XXXX" : "ADM-XXXX";
    }
}

// 3. Handle Registration & Login 
document.addEventListener('DOMContentLoaded', () => {
    
    // REGISTRATION FORM
    const regForm = document.getElementById('authRegisterForm');
    regForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Use unique IDs to avoid conflict with login fields
        const pass = document.getElementById('reg_pass').value;
        const confirm = document.getElementById('reg_confirm').value;

        // Password Validation
        if (pass !== confirm) {
            alert("Passwords do not match!");
            return;
        }

        const userData = {
            name: document.getElementById('reg_name').value,
            email: document.getElementById('reg_email').value,
            role: document.getElementById('reg_role').value,
            department: document.getElementById('reg_dept').value,
            reg_id: document.getElementById('reg_id').value,
            session: document.getElementById('reg_role').value === 'student' 
                     ? document.getElementById('reg_session').value : "N/A",
            password: pass
        };

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            
            if (data.success) {
                alert("Account created successfully! Please login.");
                toggleAuth();
                regForm.reset(); // Clear form after success
            } else {
                alert(data.message || "Registration failed. ID might already exist.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Connection error. Check if server is running.");
        }
    });

    // LOGIN FORM
    const loginForm = document.getElementById('authLoginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginData = {
            id: document.getElementById('login_id').value,
            role: document.getElementById('login_role').value,
            password: document.getElementById('login_pass').value
        };

        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();

            if (data.success) {
                // Redirects based on Assigned Role
                window.location.href = `/${data.role}.html`;
            } else {
                // Now shows specific message (like Deactivated) from backend
                alert(data.message || "Invalid credentials or role mismatch.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Connection error. Check if server is running.");
        }
    });
});