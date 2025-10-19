// =============================
// ACCOUNT MODAL FUNCTIONALITY
// =============================

// Get elements
const accountModal = document.getElementById("account-modal");
const closeAccount = document.getElementById("closeAccount");
const accountForm = document.getElementById("accountForm");

// Buttons for navigation / state
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const accountBtn = document.getElementById("accountBtn");
const getStartedBtn = document.getElementById("getstartedBtn");
const bookNowBtn = document.getElementById("booknowBtn");

// --- Open Account Modal ---
if (accountBtn) {
  accountBtn.addEventListener("click", () => {
    accountModal.style.display = "flex";
  });
}

// --- Close Modal ---
closeAccount.addEventListener("click", () => {
  accountModal.style.display = "none";
});

// --- Close When Clicking Outside ---
window.addEventListener("click", (e) => {
  if (e.target === accountModal) {
    accountModal.style.display = "none";
  }
});

// --- Logout Behavior ---
accountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  accountModal.style.display = "none";

  // Reset UI visibility
  if (getStartedBtn) getStartedBtn.style.display = "flex";
  if (bookNowBtn) bookNowBtn.style.display = "none";
  if (loginBtn) loginBtn.style.display = "inline-block";
  if (signupBtn) signupBtn.style.display = "inline-block";
  if (accountBtn) accountBtn.style.display = "none";

  // Clear forms if present
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (loginForm) loginForm.reset();
  if (signupForm) signupForm.reset();

  alert("You have been logged out successfully.");
});
