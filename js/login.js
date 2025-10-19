// =============================
// LOGIN MODAL FUNCTIONALITY
// =============================

// Get modals
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const accountModal = document.getElementById("account-modal");

// Get buttons (in navbar or elsewhere)
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const accountBtn = document.getElementById("accountBtn");
const getStartedBtn = document.getElementById("getstartedBtn");
const bookNowBtn = document.getElementById("booknowBtn");

// Close buttons
const closeLogin = document.getElementById("closeLogin");

// Password toggle elements
const loginPassword = document.getElementById("login-password");
const loginShowPass = document.getElementById("login-showPass");

// --- Open Login Modal ---
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "flex";
    });
}

// --- Close Login Modal ---
closeLogin.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// --- Close when clicking outside the modal ---
window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
});

// --- Show/Hide Password ---
loginShowPass.addEventListener("change", () => {
    loginPassword.type = loginShowPass.checked ? "text" : "password";
});

// --- Switch to Signup ---
function toggleSignup() {
    loginModal.style.display = "none";
    signupModal.style.display = "flex";
}

// --- Login behavior ---
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Close login modal
    loginModal.style.display = "none";

    // UI Changes (if navbar buttons exist)
    if (getStartedBtn) getStartedBtn.style.display = "none";
    if (bookNowBtn) bookNowBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (accountBtn) accountBtn.style.display = "inline-block";

    // Optional: auto-show account modal
    if (accountModal) accountModal.style.display = "flex";

    // Reset form
    loginForm.reset();
});
