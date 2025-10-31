// Authentication and Notification Management System
// Handles user authentication, notifications, and payment flows

// DOM Element References
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

// Modal Event Handlers
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

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  [loginModal, signupModal, accountModal, paymentModal].forEach((modal) => {
    if (modal && e.target === modal) closeModal(modal);
  });
});

// Password Visibility Toggle
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

// User Registration
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

// User Authentication
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
    alert("Login failed due to server error.");
  }
});

// User Logout
logoutBtn?.addEventListener("click", () => {
  const isAdmin = localStorage.getItem("adminEmail");

  if (isAdmin) {
    localStorage.clear();
    window.location.href = "/index.html";
  } else {
    localStorage.clear();
    closeModal(accountModal);
    updateNavbarState(false);
    if (notifInterval) clearInterval(notifInterval);
  }
});

// Account Management
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

// Notification System
let notifInterval;
let unreadNotificationCount = 0;

async function loadNotifications() {
  const guestID = localStorage.getItem("guestID");
  if (!guestID) return;

  try {
    const res = await fetch(`http://localhost:3000/notifications/${guestID}`);
    const data = await res.json();
    const notifList = notifPopup.querySelector("ul");
    notifList.innerHTML = "";

    if (!data || data.length === 0) {
      notifList.innerHTML = "<li class='no-notif'>No notifications</li>";
      notifBadge.style.display = "none";
      unreadNotificationCount = 0;
      return;
    }

    unreadNotificationCount = data.filter((n) => !n.isRead).length;

    notifBadge.textContent = unreadNotificationCount;
    notifBadge.style.display = unreadNotificationCount > 0 ? "block" : "none";

    data.forEach((notif) => {
      const li = document.createElement("li");
      li.className = `notif-item ${notif.isRead ? "read" : "unread"}`;
      li.setAttribute("data-notifid", notif.notifID);
      li.setAttribute("data-read", notif.isRead);

      const msg = document.createElement("span");
      msg.className = "notif-message";
      msg.textContent = notif.message;

      const time = document.createElement("span");
      time.className = "notif-time";
      time.textContent = formatNotificationTime(notif.createdAt);

      const content = document.createElement("div");
      content.className = "notif-content";
      content.appendChild(msg);
      content.appendChild(time);

      li.appendChild(content);

      li.addEventListener("click", async (e) => {
        e.stopPropagation();

        if (li.getAttribute("data-read") === "0" || !notif.isRead) {
          try {
            const markRes = await fetch(
              `http://localhost:3000/notifications/mark-read/${notif.notifID}`,
              { method: "PATCH" }
            );

            if (markRes.ok) {
              await loadNotifications();
              
              li.classList.remove("unread");
              li.classList.add("read");
              li.setAttribute("data-read", "1");

              const updatedCount = Math.max(unreadNotificationCount - 1, 0);
              notifBadge.textContent = updatedCount;
              notifBadge.style.display = updatedCount > 0 ? "block" : "none";
              unreadNotificationCount = updatedCount;
            }
          } catch (err) {
            console.error("Failed to mark as read:", err);
          }
        }

        if (notif.message.toLowerCase().includes("approved")) {
          notifPopup.classList.remove("show");

          try {
            const guestID = localStorage.getItem("guestID");
            if (!guestID) {
              showModal(paymentModal);
              return;
            }

            const latestBookingRes = await fetch(`http://localhost:3000/api/bookings/latest/${guestID}`);
            
            if (latestBookingRes.ok) {
              const bookingData = await latestBookingRes.json();
              showPaymentModalWithActualData(bookingData);
            } else {
              showBasicPaymentModal();
            }
          } catch (err) {
            console.error("Error fetching booking:", err);
            showBasicPaymentModal();
          }
        }
      });
      notifList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading notifications:", err);
  }
}

function formatNotificationTime(dateString) {
  if (!dateString) return "Just now";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

notifBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  notifPopup.classList.toggle("show");
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

// Payment Modal Functions
function showPaymentModalWithActualData(bookingData) {
  const paymentModal = document.getElementById("payment-modal");
  
  if (!paymentModal) {
    console.error("Payment modal not found");
    return;
  }

  const totalPrice = bookingData.totalPrice || 0;
  const checkinDate = new Date(bookingData.checkinDate).toLocaleDateString();
  const checkoutDate = new Date(bookingData.checkoutDate).toLocaleDateString();

  const summaryBox = paymentModal.querySelector(".summary-box");
  if (summaryBox) {
    summaryBox.innerHTML = `
        <h3>Booking Summary</h3>
        <p><strong>Booking ID:</strong> ${bookingData.bookingID}</p>
        <p><strong>Package:</strong> ${bookingData.packageName}</p>
        <p><strong>Check-in:</strong> ${checkinDate} ${bookingData.checkinTime}</p>
        <p><strong>Check-out:</strong> ${checkoutDate} ${bookingData.checkoutTime}</p>
        <p><strong>Guests:</strong> ${bookingData.numGuests} + ${bookingData.additionalPax || 0} additional</p>
        <p><strong>Additional Hours:</strong> ${bookingData.additionalHours || 0} hours</p>
        <hr>
        <p><strong>Base Price:</strong> ₱${Number(bookingData.basePrice).toLocaleString()}</p>
        ${bookingData.additionalPax ? `<p><strong>Additional Pax:</strong> ₱${(bookingData.additionalPax * 150).toLocaleString()}</p>` : ''}
        ${bookingData.additionalHours ? `<p><strong>Additional Hours:</strong> ₱${(bookingData.additionalHours * 500).toLocaleString()}</p>` : ''}
        <p><strong>Total Amount:</strong> ₱${Number(totalPrice).toLocaleString()}</p>
    `;
  }

  paymentModal.dataset.bookingId = bookingData.bookingID;
  paymentModal.dataset.totalAmount = totalPrice;

  showModal(paymentModal);
}

function showBasicPaymentModal() {
  const paymentModal = document.getElementById("payment-modal");
  const summaryBox = paymentModal.querySelector(".summary-box");
  
  summaryBox.innerHTML = `
      <h3>Booking Summary</h3>
      <p><strong>Status:</strong> Approved</p>
      <p><strong>Note:</strong> Please contact admin for actual amount</p>
  `;
  
  showModal(paymentModal);
}

// Utility Functions
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

function toggleSignup() {
  closeModal(loginModal);
  showModal(signupModal);
}

function toggleLogin() {
  closeModal(signupModal);
  showModal(loginModal);
}

// Application Initialization
async function initializeApp() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const guestID = localStorage.getItem("guestID");
  const userEmail = localStorage.getItem("userEmail");

  if (!isLoggedIn || !guestID || !userEmail) {
    updateNavbarState(false);
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/auth/user/${userEmail}`);

    if (res.ok) {
      updateNavbarState(true);
      startNotifPolling();
    } else {
      localStorage.clear();
      updateNavbarState(false);
    }
  } catch (err) {
    console.error("Session verification failed:", err);
    localStorage.clear();
    updateNavbarState(false);
  }
}

initializeApp();

// Profile Editing
const editProfileBtn = document.getElementById("editProfileBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editProfileForm = document.getElementById("edit-profile-form");
const accountView = document.getElementById("account-view");

editProfileBtn?.addEventListener("click", () => {
  accountView.style.display = "none";
  editProfileForm.style.display = "block";

  document.getElementById("editFullName").value = accName.textContent;
  document.getElementById("editEmail").value = accEmail.textContent;
  document.getElementById("editContact").value = accContact.textContent;
});

cancelEditBtn?.addEventListener("click", () => {
  editProfileForm.style.display = "none";
  accountView.style.display = "block";
});

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
      body: JSON.stringify({ fullName, email, contact, currentEmail }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userContact", contact);

      await loadAccountInfo();
      editProfileForm.style.display = "none";
      accountView.style.display = "block";
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Profile update failed.");
  }
});