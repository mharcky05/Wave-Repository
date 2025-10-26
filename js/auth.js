
// ===============================
// AUTHENTICATION MODALS SCRIPT
// ===============================

// --- GET ELEMENTS ---
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const accountModal = document.getElementById("account-modal");

// Navbar Buttons
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const accountBtn = document.getElementById("accountBtn");

// Close Buttons
const closeLogin = document.getElementById("closeLogin");
const closeSignup = document.getElementById("closeSignup");
const closeAccount = document.getElementById("closeAccount");

// Forms
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Account Info Fields
const accName = document.getElementById("acc-name");
const accEmail = document.getElementById("acc-email");
const accContact = document.getElementById("acc-contact");

// Logout Button
const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// OPEN MODALS
// ===============================
loginBtn?.addEventListener("click", () => showModal(loginModal));
signupBtn?.addEventListener("click", () => showModal(signupModal));
accountBtn?.addEventListener("click", () => {
  showModal(accountModal);
  loadAccountInfo();
});

// ===============================
// CLOSE MODALS
// ===============================
closeLogin?.addEventListener("click", () => closeModal(loginModal));
closeSignup?.addEventListener("click", () => closeModal(signupModal));
closeAccount?.addEventListener("click", () => closeModal(accountModal));

// Close when clicking outside
window.addEventListener("click", (e) => {
  [loginModal, signupModal, accountModal].forEach((modal) => {
    if (modal && e.target === modal) closeModal(modal);
  });
});

<<<<<<< HEAD
// ===============================
// SWITCH BETWEEN LOGIN & SIGNUP
// ===============================
function toggleSignup() {
  closeModal(loginModal);
  showModal(signupModal);
}
function toggleLogin() {
  closeModal(signupModal);
  showModal(loginModal);
}

=======
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
// ===============================
// PASSWORD TOGGLE
// ===============================
const loginPwd = document.getElementById("login-password");
const loginShow = document.getElementById("login-showPass");
const signupPwd = document.getElementById("signup-password");
const signupCPwd = document.getElementById("signupc-password");
const signupShow = document.getElementById("signup-showPass");

loginShow?.addEventListener("change", () => {
  loginPwd.type = loginShow.checked ? "text" : "password";
});
signupShow?.addEventListener("change", () => {
  const type = signupShow.checked ? "text" : "password";
  signupPwd.type = type;
  signupCPwd.type = type;
});

// ===============================
// SIGNUP BACKEND
// ===============================
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("signup-fname").value.trim();
  const lastName = document.getElementById("signup-lname").value.trim();
  const contactNo = document.getElementById("signup-contact").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirm = document.getElementById("signupc-password").value.trim();

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, contactNo, email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      closeModal(signupModal);
      signupForm.reset();
    }
  } catch (err) {
    console.error(err);
    alert("Signup failed.");
  }
});

// ===============================
// LOGIN BACKEND (Guest + Admin)
// ===============================
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

<<<<<<< HEAD
<<<<<<< HEAD
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
=======
  toggleVisibility(loginBtn, false);
  toggleVisibility(signupBtn, false);
  toggleVisibility(accountBtn, true);
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
=======
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok && data.user) {
      if (data.user.isAdmin) {
        // Admin login → redirect to admin dashboard
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("adminEmail", data.user.email);
        closeModal(loginModal);
        window.location.href = "/admin.html";
      } else {
        // Guest login
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("guestID", data.user.guestID);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
        localStorage.setItem("userContact", data.user.contactNo);
        console.log("✅ guestID saved:", data.user.guestID);

        closeModal(loginModal);
        updateNavbarState(true);
      }
    } else {
      alert("❌ Login failed: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("❌ Login failed due to network or server error.");
  }
});

// ===============================
// LOGOUT
// ===============================
<<<<<<< HEAD
document.querySelector('#account-modal .logout-btn')?.addEventListener('click', () => {
  closeModal(accountModal);
<<<<<<< HEAD

=======
logoutBtn?.addEventListener("click", () => {
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("guestID");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("userContact");
  localStorage.removeItem("adminEmail");

<<<<<<< HEAD
  // Restore buttons
=======
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  toggleVisibility(loginBtn, true);
  toggleVisibility(signupBtn, true);
  toggleVisibility(accountBtn, false);
=======
  closeModal(accountModal);
  updateNavbarState(false);
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
});

// ===============================
// ACCOUNT INFO LOADER
// ===============================
async function loadAccountInfo() {
  const email = localStorage.getItem("userEmail");
  if (!email) return;

  try {
    const res = await fetch(`http://localhost:3000/auth/user/${email}`);
    const data = await res.json();

    if (res.ok && data.user) {
      accName.textContent = data.user.fullName;
      accEmail.textContent = data.user.email;
      accContact.textContent = data.user.contactNo;
    } else {
      console.warn("⚠️ Could not load account info:", data.message);
    }
  } catch (err) {
    console.error("❌ Error loading account info:", err);
  }
}

// ===============================
// EDIT PROFILE FEATURE
// ===============================
const editProfileBtn = document.getElementById("editProfileBtn");
const editForm = document.getElementById("edit-profile-form");
const accountView = document.getElementById("account-view");
const cancelEditBtn = document.getElementById("cancelEditBtn");

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    document.getElementById("editFullName").value = accName.textContent;
    document.getElementById("editEmail").value = accEmail.textContent;
    document.getElementById("editContact").value = accContact.textContent;

    accountView.style.display = "none";
    editForm.style.display = "flex";
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    editForm.style.display = "none";
    accountView.style.display = "block";
  });
}

editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("editFullName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const contact = document.getElementById("editContact").value.trim();

  try {
    const res = await fetch("http://localhost:3000/auth/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, contact }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userContact", contact);

      loadAccountInfo();
      editForm.style.display = "none";
      accountView.style.display = "block";
      alert("✅ Profile updated successfully!");
    } else {
      alert("⚠️ " + data.message);
    }
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    alert("Something went wrong while saving changes.");
  }
});

// ===============================
// HELPER FUNCTIONS
// ===============================
function showModal(modal) {
  if (modal) modal.style.display = "flex";
}

function closeModal(modal) {
  if (modal) modal.style.display = "none";
}

function toggleVisibility(element, show) {
  if (!element) return;
  element.style.display = show ? "inline-block" : "none";
}

function updateNavbarState(isLoggedIn, isAdmin = false) {
  toggleVisibility(loginBtn, !isLoggedIn);
  toggleVisibility(signupBtn, !isLoggedIn);
  toggleVisibility(accountBtn, isLoggedIn && !isAdmin);
}

// Clear localStorage on localhost reload
if (window.location.hostname === "localhost") {
  window.addEventListener("load", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("guestID");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userContact");
    localStorage.removeItem("adminEmail");
    updateNavbarState(false);
  });
}

// ===============================
// INITIAL STATE
// ===============================
<<<<<<< HEAD
toggleVisibility(accountBtn, false); // hide account button by default
=======
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const isAdmin = !!localStorage.getItem("adminEmail");
updateNavbarState(isLoggedIn, isAdmin);


const adminLoginForm = document.getElementById("adminLoginForm");

adminLoginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value.trim();

  try {
    const res = await fetch("http://localhost:3000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok && data.admin) {
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("adminEmail", data.admin.email);
      localStorage.setItem("adminID", data.admin.adminID);

      // Redirect to admin dashboard
      window.location.href = "/admin.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("❌ Admin login failed due to network/server error.");
  }
});
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
