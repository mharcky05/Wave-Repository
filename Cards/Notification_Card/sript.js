// Get elements
const notifications = document.querySelectorAll(".notification");
const markAllBtn = document.getElementById("markAllBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const notificationList = document.getElementById("notificationList");

// Mark notification as read when clicked
notifications.forEach(notif => {
  notif.addEventListener("click", () => {
    notif.classList.remove("unread");
    notif.classList.add("read");
  });
});

// Mark all as read
markAllBtn.addEventListener("click", () => {
  const notifs = document.querySelectorAll(".notification");
  notifs.forEach(n => {
    n.classList.remove("unread");
    n.classList.add("read");
  });
});

// Clear all notifications
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all notifications?")) {
    notificationList.innerHTML = `
      <div class="no-notif-card">
        <p>No notifications yet.</p>
      </div>`;
  }
});
