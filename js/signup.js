// =============================
// SIGNUP MODAL FUNCTIONALITY
// =============================

// Get modals
const signupModal = document.getElementById("signup-modal");
const loginModal = document.getElementById("login-modal");

// Close button
const closeSignup = document.getElementById("closeSignup");

// Password inputs
const signupPassword = document.getElementById("signup-password");
const signupConfirmPassword = document.getElementById("signupc-password");
const signupShowPass = document.getElementById("signup-showPass");

// --- Open Signup Modal ---
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    signupModal.style.display = "flex";
  });
}

// --- Close Signup Modal ---
closeSignup.addEventListener("click", () => {
  signupModal.style.display = "none";
});

// --- Close when clicking outside ---
window.addEventListener("click", (e) => {
  if (e.target === signupModal) {
    signupModal.style.display = "none";
  }
});

// --- Switch to Login ---
function toggleLogin() {
  signupModal.style.display = "none";
  loginModal.style.display = "flex";
}

// --- Show / Hide Passwords ---
signupShowPass.addEventListener("change", () => {
  const type = signupShowPass.checked ? "text" : "password";
  signupPassword.type = type;
  signupConfirmPassword.type = type;
});

// --- Signup Validation ---
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const password = signupPassword.value.trim();
  const confirmPassword = signupConfirmPassword.value.trim();

  // Password must include uppercase, lowercase, number, and special char, at least 8 chars long
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!passwordRegex.test(password)) {
    alert(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    );
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Success feedback
  alert("Account created successfully! You can now log in.");
  signupForm.reset();

  // Close modal after signup
  signupModal.style.display = "none";

  // Open login modal automatically (optional)
  loginModal.style.display = "flex";
});
