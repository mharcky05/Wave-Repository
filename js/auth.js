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

// Logout button (NEW)
const logoutBtn = document.querySelector(".logout-btn");

// Account info fields
const accName = document.getElementById("acc-name");
const accEmail = document.getElementById("acc-email");
const accContact = document.getElementById("acc-contact");

// Password toggles
const loginPwd = document.getElementById("login-password");
const loginShow = document.getElementById("login-showPass");
const signupPwd = document.getElementById("signup-password");
const signupCPwd = document.getElementById("signupc-password");
const signupShow = document.getElementById("signup-showPass");

// ===============================
// EVENT LISTENERS
// ===============================

// --- OPEN MODALS ---
loginBtn?.addEventListener("click", () => showModal(loginModal));
signupBtn?.addEventListener("click", () => showModal(signupModal));
accountBtn?.addEventListener("click", () => {
  showModal(accountModal);
  loadAccountInfo(); // show user info when modal opens
});

// --- CLOSE MODALS ---
closeLogin?.addEventListener("click", () => closeModal(loginModal));
closeSignup?.addEventListener("click", () => closeModal(signupModal));
closeAccount?.addEventListener("click", () => closeModal(accountModal));

// --- CLICK OUTSIDE TO CLOSE ---
window.addEventListener("click", (e) => {
  [loginModal, signupModal, accountModal].forEach((modal) => {
    if (modal && e.target === modal) closeModal(modal);
  });
});

// --- SWITCH BETWEEN LOGIN & SIGNUP ---
function toggleSignup() {
  closeModal(loginModal);
  showModal(signupModal);
}
function toggleLogin() {
  closeModal(signupModal);
  showModal(loginModal);
}

// ===============================
// PASSWORD TOGGLE
// ===============================
loginShow?.addEventListener("change", () => {
  loginPwd.type = loginShow.checked ? "text" : "password";
});

signupShow?.addEventListener("change", () => {
  const type = signupShow.checked ? "text" : "password";
  signupPwd.type = type;
  signupCPwd.type = type;
});

// ===============================
// SIGNUP VALIDATION + BACKEND CONNECT
// ===============================
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("signup-fname").value;
  const lastName = document.getElementById("signup-lname").value;
  const contactNo = document.getElementById("signup-contact").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signupc-password").value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, contactNo, email, password })
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
// LOGIN BACKEND CONNECT
// ===============================
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      // ✅ Save login data locally
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
      localStorage.setItem("userContact", data.user.contactNo);

      closeModal(loginModal);
      updateNavbarState(true);
    }
  } catch (err) {
    console.error(err);
    alert("Login failed.");
  }
});

// ===============================
// LOGOUT BEHAVIOR (NEW)
// ===============================
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("userContact");

  closeModal(accountModal);
  updateNavbarState(false);
});

// ===============================
// ACCOUNT INFO LOADER
// ===============================
function loadAccountInfo() {
  const name = localStorage.getItem("userName") || "—";
  const email = localStorage.getItem("userEmail") || "—";
  const contact = localStorage.getItem("userContact") || "—";

  accName.textContent = name;
  accEmail.textContent = email;
  accContact.textContent = contact;
}

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

function updateNavbarState(isLoggedIn) {
  toggleVisibility(loginBtn, !isLoggedIn);
  toggleVisibility(signupBtn, !isLoggedIn);
  toggleVisibility(accountBtn, isLoggedIn);
}

// ===============================
// INITIAL STATE
// ===============================
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
updateNavbarState(isLoggedIn);
