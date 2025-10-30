// ===============================
// AUTHENTICATION & NOTIFICATION SCRIPT
// ===============================

// --- GET ELEMENTS ---
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const accountModal = document.getElementById("account-modal");
const paymentModal = document.getElementById("payment-modal");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const accountBtn = document.getElementById("accountBtn");
const notifBtn = document.getElementById("notifBtn");
const notifBadge = document.getElementById("notifBadge");
const notifPopup = document.getElementById("notifPopup");

const closeLogin = document.getElementById("closeLogin");
const closeSignup = document.getElementById("closeSignup");
const closeAccount = document.getElementById("closeAccount");
const closePayment = document.getElementById("closePayment");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const accName = document.getElementById("acc-name");
const accEmail = document.getElementById("acc-email");
const accContact = document.getElementById("acc-contact");

const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// EVENT LISTENERS
// ===============================
loginBtn?.addEventListener("click", () => showModal(loginModal));
signupBtn?.addEventListener("click", () => showModal(signupModal));
accountBtn?.addEventListener("click", () => {
    showModal(accountModal);
    loadAccountInfo();
});

closeLogin?.addEventListener("click", () => closeModal(loginModal));
closeSignup?.addEventListener("click", () => closeModal(signupModal));
closeAccount?.addEventListener("click", () => closeModal(accountModal));
closePayment?.addEventListener("click", () => closeModal(paymentModal));

window.addEventListener("click", (e) => {
    [loginModal, signupModal, accountModal, paymentModal].forEach((modal) => {
        if (modal && e.target === modal) closeModal(modal);
    });
});

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

    if (password !== confirm) return alert("Passwords do not match!");

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

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

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
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("adminEmail", data.user.email);
                window.location.href = "/admin.html";
            } else {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("guestID", data.user.guestID);
                localStorage.setItem("userEmail", data.user.email);
                localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
                localStorage.setItem("userContact", data.user.contactNo);

                closeModal(loginModal);
                updateNavbarState(true);
                loadNotifications();
                startNotifPolling();
            }
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("❌ Login failed due to server error.");
    }
});

// ===============================
// LOGOUT (Fixed for both admin and guest)
// ===============================
logoutBtn?.addEventListener("click", () => {
    const isAdmin = localStorage.getItem("adminEmail");
    
    if (isAdmin) {
        // Admin logout - redirect to landing page
        localStorage.clear();
        window.location.href = "/index.html";
    } else {
        // Guest logout - just close modal and update UI
        localStorage.clear();
        closeModal(accountModal);
        updateNavbarState(false);
        if (notifInterval) clearInterval(notifInterval);
    }
});

// ===============================
// ACCOUNT INFO
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
        }
    } catch (err) {
        console.error("Error loading account info:", err);
    }
}

// ===============================
// NOTIFICATIONS
// ===============================
let notifInterval;

async function loadNotifications() {
    const guestID = localStorage.getItem("guestID");
    if (!guestID) return;

    try {
        const res = await fetch(`http://localhost:3000/notifications/${guestID}`);
        const data = await res.json();
        const notifList = notifPopup.querySelector("ul");
        notifList.innerHTML = "";

        if (!data || data.length === 0) {
            notifList.innerHTML = "<li>No notifications.</li>";
            notifBadge.style.display = "none";
            return;
        }

        const unreadCount = data.filter((n) => !n.isRead).length;
        notifBadge.textContent = unreadCount;
        notifBadge.style.display = unreadCount > 0 ? "block" : "none";

        data.forEach((notif) => {
            const li = document.createElement("li");
            li.className = "notif-item";
            li.setAttribute("data-notifid", notif.notifID);

            const msgWrap = document.createElement("div");
            msgWrap.style.display = "flex";
            msgWrap.style.justifyContent = "space-between";
            msgWrap.style.alignItems = "center";

            const msg = document.createElement("span");
            msg.textContent = notif.message;
            msg.style.flex = "1";
            msgWrap.appendChild(msg);

            const readPill = document.createElement("span");
            readPill.className = "notif-read-pill";
            readPill.style.marginLeft = "8px";
            readPill.style.fontSize = "12px";
            readPill.style.padding = "3px 6px";
            readPill.style.borderRadius = "12px";
            readPill.style.border = "1px solid transparent";

            if (notif.isRead) {
                li.classList.remove("unread");
                li.setAttribute("data-read", "true");
                readPill.textContent = "✓ Read";
                readPill.style.background = "transparent";
                readPill.style.color = "#4b5563";
                readPill.style.borderColor = "#e5e7eb";
                readPill.style.opacity = "0.8";
            } else {
                li.classList.add("unread");
                li.removeAttribute("data-read");
                readPill.textContent = "Mark as read";
                readPill.style.background = "#eef2ff";
                readPill.style.color = "#3730a3";
                readPill.style.cursor = "pointer";
                readPill.style.borderColor = "#c7d2fe";
            }

            msgWrap.appendChild(readPill);
            li.appendChild(msgWrap);

            li.addEventListener("click", async (e) => {
                const target = e.target;
                if (target.classList.contains("notif-read-pill") && !li.hasAttribute("data-read")) {
                    e.stopPropagation();
                    target.style.pointerEvents = "none";

                    try {
                        const markRes = await fetch(`http://localhost:3000/notif/mark-read/${notif.notifID}`, {
                            method: "PATCH",
                        });

                        if (!markRes.ok) throw new Error("Mark-read failed");

                        li.classList.remove("unread");
                        li.setAttribute("data-read", "true");
                        target.textContent = "✓ Read";
                        target.style.background = "transparent";
                        target.style.color = "#4b5563";
                        target.style.borderColor = "#e5e7eb";
                        target.style.cursor = "default";

                        const current = parseInt(notifBadge.textContent || "0", 10);
                        const next = Math.max(current - 1, 0);
                        notifBadge.textContent = next;
                        notifBadge.style.display = next > 0 ? "block" : "none";

                        li.style.transition = "opacity 0.3s ease";
                        li.style.opacity = "0.7";

                        setTimeout(() => loadNotifications(), 500);
                    } catch (err) {
                        console.error("Failed to mark as read:", err);
                    }

                    return;
                }

                if (notif.message.toLowerCase().includes("approved")) {
                    notifPopup.classList.remove("show");
                    showModal(paymentModal);
                    const bookingInput = paymentModal.querySelector("#booking-id");
                    if (bookingInput && notif.bookingID) bookingInput.value = notif.bookingID;
                }
            });

            notifList.appendChild(li);
        });
    } catch (err) {
        console.error("Error loading notifications:", err);
    }
}

notifBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = notifPopup.classList.toggle("show");
    if (isVisible) notifBadge.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (!notifPopup.contains(e.target) && e.target !== notifBtn) {
        notifPopup.classList.remove("show");
    }
});

function startNotifPolling() {
    if (notifInterval) clearInterval(notifInterval);
    loadNotifications();
    notifInterval = setInterval(() => {
        if (!notifPopup.classList.contains("show")) loadNotifications();
    }, 15000);
}

// ===============================
// HELPERS
// ===============================
function showModal(modal) {
    if (modal) modal.style.display = "flex";
}

function closeModal(modal) {
    if (modal) modal.style.display = "none";
}

function toggleVisibility(el, show) {
    if (el) el.style.display = show ? "inline-block" : "none";
}

function updateNavbarState(isLoggedIn) {
    toggleVisibility(loginBtn, !isLoggedIn);
    toggleVisibility(signupBtn, !isLoggedIn);
    toggleVisibility(accountBtn, isLoggedIn);
    toggleVisibility(notifBtn, isLoggedIn);
}

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

// ===============================
// INITIAL LOAD
// ===============================
const loggedIn = localStorage.getItem("isLoggedIn") === "true";
updateNavbarState(loggedIn);
if (loggedIn) startNotifPolling();


// ===============================
// EDIT PROFILE FUNCTIONALITY
// ===============================
const editProfileBtn = document.getElementById("editProfileBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editProfileForm = document.getElementById("edit-profile-form");
const accountView = document.getElementById("account-view");

// Switch to edit mode
editProfileBtn?.addEventListener("click", () => {
    accountView.style.display = "none";
    editProfileForm.style.display = "block";
    
    // Pre-fill the form with current data
    document.getElementById("editFullName").value = accName.textContent;
    document.getElementById("editEmail").value = accEmail.textContent;
    document.getElementById("editContact").value = accContact.textContent;
});

// Cancel edit
cancelEditBtn?.addEventListener("click", () => {
    editProfileForm.style.display = "none";
    accountView.style.display = "block";
});

// Submit edit form
editProfileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById("editFullName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const contact = document.getElementById("editContact").value.trim();
    const currentEmail = localStorage.getItem("userEmail");

    if (!fullName || !email || !contact) {
        alert("All fields are required!");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/auth/update-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                fullName, 
                email, 
                contact,
                currentEmail // Send current email to identify the user
            }),
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            // Update localStorage
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userName", fullName);
            localStorage.setItem("userContact", contact);
            
            // Reload account info
            await loadAccountInfo();
            
            // Switch back to view mode
            editProfileForm.style.display = "none";
            accountView.style.display = "block";
        }
    } catch (err) {
        console.error("Error updating profile:", err);
        alert("Profile update failed.");
    }
});