// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// Tab Switching (Login & Register)
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Form`).classList.add('active');
    });
});

// Handle Login
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginFormElement");

    if (!loginForm) {
        console.error("❌ ERROR: loginFormElement not found in login.html!");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || "Login failed!");
            }

            const data = await response.json();

            sessionStorage.setItem("token", data.token); // ✅ Store JWT token

            // ✅ Decode JWT to get the role
            const decodedToken = JSON.parse(atob(data.token.split(".")[1])); 
            const userRole = decodedToken.role;

            console.log("✅ Logged in as:", userRole);  // ✅ Debugging log

            // ✅ Redirect based on user role
            if (userRole === "teacher") {
                window.location.href = "teacher.html";
            } else if (userRole === "student") {
                window.location.href = "student.html";
            } else {
                alert("Unknown role: " + userRole);
                console.warn("⚠ Unexpected role received:", userRole);
            }
        } catch (error) {
            console.error("❌ Login error:", error);
            alert("Login failed: " + error.message);
        }
    });
});

// Handle Registration
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerFormElement");

    if (!registerForm) {
        console.error("❌ ERROR: registerFormElement not found in login.html!");
        return;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const regName = document.getElementById("regName").value;
        const regEmail = document.getElementById("regEmail").value;
        const regPassword = document.getElementById("regPassword").value;
        const regRole = document.getElementById("regRole").value;

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! You can now log in.");
                tabBtns[0].click(); // ✅ Switch to login tab after successful registration
            } else {// Full updated login.js with helpful comments

// -----------------------------
// Tab UI: switch between Login and Register forms
// -----------------------------
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all tabs/forms, then enable the clicked one
    tabBtns.forEach(b => b.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));

    btn.classList.add('active');

    // If data-tab attribute present, show the matching form element id (e.g. "loginForm" -> "loginFormElement")
    const targetId = btn.dataset?.tab ? `${btn.dataset.tab}Form` : null;
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    }
  });
});

// -----------------------------
// DOMContentLoaded: attach form handlers
// - Uses relative API paths (/api/...) so it works locally and after deployment
// - Stores JWT in sessionStorage (short-lived storage) and redirects based on role
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  // ---------- LOGIN ----------
  const loginForm = document.getElementById('loginFormElement');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Read input values
      const email = (document.getElementById('email')?.value || '').trim();
      const password = (document.getElementById('password')?.value || '').trim();
      if (!email || !password) {
        alert('Please enter email and password.');
        return;
      }

      try {
        // POST to backend login route (relative URL)
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
          // Show server-provided message if available
          const text = await res.text().catch(() => res.statusText);
          throw new Error(text || `Login failed (${res.status})`);
        }

        // Expect { token } in response
        const data = await res.json();
        if (!data?.token) throw new Error('No token received from server.');

        // Save token (sessionStorage so it clears when browser/tab closes)
        sessionStorage.setItem('token', data.token);

        // Try to safely decode JWT payload to get user role and redirect accordingly
        try {
          const parts = data.token.split('.');
          if (parts.length >= 2) {
            // atob might throw for invalid padding, replace URL-safe chars first
            const payloadJson = decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))));
            const payload = JSON.parse(payloadJson);
            const role = payload?.role;
            if (role === 'teacher') return window.location.href = 'teacher.html';
            if (role === 'student') return window.location.href = 'student.html';
          }
        } catch (err) {
          // If decode fails, fallback to default dashboard
          console.warn('JWT decode failed (non-fatal):', err);
        }

        // Default redirect (dashboard or other landing page)
        window.location.href = 'dashboard.html';
      } catch (err) {
        console.error('Login error:', err);
        alert('Login failed: ' + (err.message || 'Unknown error'));
      }
    });
  } else {
    console.warn('loginFormElement not found on this page.');
  }

  // ---------- REGISTER ----------
  const registerForm = document.getElementById('registerFormElement');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Read register form values
      const name = (document.getElementById('regName')?.value || '').trim();
      const email = (document.getElementById('regEmail')?.value || '').trim();
      const password = (document.getElementById('regPassword')?.value || '').trim();
      const role = (document.getElementById('regRole')?.value || 'student').trim();

      if (!name || !email || !password) {
        alert('Please fill all registration fields.');
        return;
      }

      try {
        // POST to backend register route (relative URL)
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });

        // Parse server response (may be JSON or text)
        const body = await res.json().catch(() => ({}));

        if (res.ok) {
          // Registration succeeded — prompt user to login
          alert('Registration successful. Please log in.');
          // Switch to login tab if available
          const firstTab = document.querySelector('.tab-btn[data-tab="login"]') || tabBtns[0];
          if (firstTab) firstTab.click();
          registerForm.reset();
        } else {
          // Show server message or fallback
          const msg = body?.message || body?.error || `Registration failed (${res.status})`;
          alert(msg);
        }
      } catch (err) {
        console.error('Registration error:', err);
        alert('Registration failed: ' + (err.message || 'Unknown error'));
      }
    });
  } else {
    console.warn('registerFormElement not found on this page.');
  }
});
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("❌ Registration error:", error);
            alert("Registration failed: " + error.message);
        }
    });
});
