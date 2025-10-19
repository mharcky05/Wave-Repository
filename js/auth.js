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
const accountForm = document.getElementById("accountForm");

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
accountBtn?.addEventListener("click", () => showModal(accountModal));

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
// SIGNUP VALIDATION
// ===============================
signupForm?.addEventListener("submit", (e) => {
  const password = signupPwd.value;
  const confirm = signupCPwd.value;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!regex.test(password)) {
    e.preventDefault();
    alert("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
    return;
  }
  if (password !== confirm) {
    e.preventDefault();
    alert("Passwords do not match!");
    return;
  }

  closeModal(signupModal);
  alert("Account created! You may now log in.");
  signupForm.reset();
});

// ===============================
// LOGIN BEHAVIOR
// ===============================
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  closeModal(loginModal);

  // Hide login/signup buttons, show account
  toggleVisibility(loginBtn, false);
  toggleVisibility(signupBtn, false);
  toggleVisibility(accountBtn, true);

  loginForm.reset();
});

// ===============================
// LOGOUT BEHAVIOR
// ===============================
accountForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  closeModal(accountModal);

  // Restore buttons
  toggleVisibility(loginBtn, true);
  toggleVisibility(signupBtn, true);
  toggleVisibility(accountBtn, false);

  loginForm?.reset();
  signupForm?.reset();
});

// ===============================
// UTILITY FUNCTIONS
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

// ===============================
// INITIAL STATE
// ===============================
// Hide the "My Account" button by default
toggleVisibility(accountBtn, false);
