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
// LOGOUT
// ===============================
logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    closeModal(accountModal);
    updateNavbarState(false);
    if (notifInterval) clearInterval(notifInterval);
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
// NOTIFICATIONS (with explicit "read" indicator)
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

        // No-notifications case
        if (!data || data.length === 0) {
            notifList.innerHTML = "<li>No notifications.</li>";
            notifBadge.style.display = "none";
            return;
        }

        // Update badge
        const unreadCount = data.filter((n) => !n.isRead).length;
        notifBadge.textContent = unreadCount;
        notifBadge.style.display = unreadCount > 0 ? "block" : "none";

        // Build list
        data.forEach((notif) => {
            const li = document.createElement("li");
            li.className = "notif-item";
            li.setAttribute("data-notifid", notif.notifID);

            // message wrapper
            const msgWrap = document.createElement("div");
            msgWrap.style.display = "flex";
            msgWrap.style.justifyContent = "space-between";
            msgWrap.style.alignItems = "center";

            const msg = document.createElement("span");
            msg.textContent = notif.message;
            msg.style.flex = "1";
            msgWrap.appendChild(msg);

            // read indicator pill
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

            // click on the list item opens payment when approved
            li.addEventListener("click", async (e) => {
                const target = e.target;

                // ✅ If user clicked the "Mark as read" pill
                if (target.classList.contains("notif-read-pill") && !li.hasAttribute("data-read")) {
                    e.stopPropagation(); // prevent parent li click
                    target.style.pointerEvents = "none"; // avoid double click

                    try {
                        const markRes = await fetch(`http://localhost:3000/notif/mark-read/${notif.notifID}`, {
                            method: "PATCH",
                        });

                        if (!markRes.ok) throw new Error("Mark-read failed");

                        // Immediate UI update
                        li.classList.remove("unread");
                        li.setAttribute("data-read", "true");
                        target.textContent = "✓ Read";
                        target.style.background = "transparent";
                        target.style.color = "#4b5563";
                        target.style.borderColor = "#e5e7eb";
                        target.style.cursor = "default";

                        // Update badge
                        const current = parseInt(notifBadge.textContent || "0", 10);
                        const next = Math.max(current - 1, 0);
                        notifBadge.textContent = next;
                        notifBadge.style.display = next > 0 ? "block" : "none";

                        // Optional: brief fade animation
                        li.style.transition = "opacity 0.3s ease";
                        li.style.opacity = "0.7";

                        setTimeout(() => loadNotifications(), 500);
                    } catch (err) {
                        console.error("Failed to mark as read:", err);
                    }

                    return; // stop here — don’t trigger other click logic
                }

                // ✅ Otherwise, handle normal li click (approved notification → open modal)
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

// Toggle popup visibility
notifBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = notifPopup.classList.toggle("show");
    if (isVisible) notifBadge.style.display = "none";
});

// close popup when clicking outside
window.addEventListener("click", (e) => {
    if (!notifPopup.contains(e.target) && e.target !== notifBtn) {
        notifPopup.classList.remove("show");
    }
});

// Polling (15s) but only when popup is closed
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
// INITIAL LOAD
// ===============================
const loggedIn = localStorage.getItem("isLoggedIn") === "true";
updateNavbarState(loggedIn);
if (loggedIn) startNotifPolling();
