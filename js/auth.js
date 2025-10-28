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
const notifBtn = document.getElementById("notifBtn");
const notifBadge = document.getElementById("notifBadge");
const notifPopup = document.getElementById("notifPopup");

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

window.addEventListener("click", (e) => {
  [loginModal, signupModal, accountModal].forEach((modal) => {
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
        async function loadNotifications() {
          const guestID = localStorage.getItem("guestID");
          if (!guestID) return;

          try {
            const res = await fetch(`http://localhost:3000/notifications/${guestID}`);
            const data = await res.json();

            const notifList = notifPopup.querySelector("ul");
            notifList.innerHTML = "";

            if (data.length > 0) {
              data.forEach((notif) => {
                const li = document.createElement("li");
                li.textContent = notif.message;
                notifList.appendChild(li);
              });

              // Show badge if may unread
              const unreadCount = data.filter((n) => !n.isRead).length;
              notifBadge.textContent = unreadCount;
              notifBadge.style.display = unreadCount > 0 ? "block" : "none";
            } else {
              notifList.innerHTML = "<li>No new notifications.</li>";
              notifBadge.style.display = "none";
            }

            // Show notif button
            notifBtn.style.display = "inline-block";
          } catch (err) {
            console.error("❌ Failed to load notifications:", err);
          }
        }

        loadNotifications(); // ⬅️ load notifications after login
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
    }
  } catch (err) {
    console.error("Error loading account info:", err);
  }
}

// ===============================
// NOTIFICATIONS
// ===============================
async function loadNotifications() {
  const guestID = localStorage.getItem("guestID");
  if (!guestID) return;

  try {
    const res = await fetch(`http://localhost:3000/api/notifications/${guestID}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // Update badge
    const unreadCount = data.filter((n) => !n.isRead).length;
    notifBadge.style.display = unreadCount > 0 ? "block" : "none";
    notifBadge.textContent = unreadCount;

    // Show popup list
    notifPopup.innerHTML = data
      .map(
        (n) => `
      <div class="notif-item" data-message="${n.message}">
        <p>${n.message}</p>
      </div>`
      )
      .join("");

    // Add click listeners after rendering
    document.querySelectorAll(".notif-item").forEach(item => {
      item.addEventListener("click", () => {
        const message = item.getAttribute("data-message");
        if (message.includes("approved")) {
          notifPopup.style.display = "none"; // close notif popup
          const paymentModal = document.getElementById("payment-modal");
          if (paymentModal) paymentModal.style.display = "flex";
          else console.warn("⚠️ Payment modal not found in DOM.");
        }
      });
    });


  } catch (err) {
    console.error("❌ Error loading notifications:", err);
  }
}

// Mark notifications as read when opening popup
notifBtn?.addEventListener("click", async () => {
  notifPopup.style.display =
    notifPopup.style.display === "block" ? "none" : "block";

  if (notifPopup.style.display === "block") {
    await markNotificationsRead();
  }
});

notifBtn?.addEventListener("click", async () => {
  notifPopup.classList.toggle("show");

  if (notifPopup.classList.contains("show")) {
    const guestID = localStorage.getItem("guestID");
    await fetch(`http://localhost:3000/notifications/mark-read/${guestID}`, {
      method: "PATCH",
    });

    notifBadge.style.display = "none";
  }
});

async function markNotificationsRead() {
  const guestID = localStorage.getItem("guestID");
  if (!guestID) return;
  await fetch(`http://localhost:3000/api/notifications/${guestID}/read`, {
    method: "PUT",
  });
  notifBadge.style.display = "none";
}

function proceedToPayment(notificationID) {
  const paymentModal = document.getElementById("payment-modal");

  if (paymentModal) {
    // Close notification popup
    notifPopup.style.display = "none";

    // Show payment modal
    paymentModal.style.display = "flex";
  } else {
    console.warn("⚠️ Payment modal not found in DOM.");
  }
}

// Auto-refresh every 10s
setInterval(loadNotifications, 10000);

// ===============================
// HELPER FUNCTIONS
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
if (loggedIn) loadNotifications();
