// ===== SMOOTH SCROLL NAVIGATION SYSTEM =====
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section[id]");

  // ===== STICKY HEADER ON SCROLL =====
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      navbar.classList.add("sticky");
    } else {
      navbar.classList.remove("sticky");
    }

    // ===== UPDATE ACTIVE NAV LINK BASED ON SCROLL POSITION =====
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - 100) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // ===== SMOOTH SCROLL FOR NAVIGATION LINKS =====
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = targetSection.offsetTop - navbarHeight;

        // REMOVE ACTIVE CLASS FROM ALL LINKS
        navLinks.forEach((link) => link.classList.remove("active"));

        // ADD ACTIVE CLASS TO CLICKED LINK
        this.classList.add("active");

        // SMOOTH SCROLL TO TARGET
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // ===== HOME LINK SPECIAL HANDLING (SCROLL TO TOP) =====
  const homeLink = document.querySelector("a[href='#home']");
  if (homeLink) {
    homeLink.addEventListener("click", function (e) {
      e.preventDefault();

      // REMOVE ACTIVE CLASS FROM ALL LINKS
      navLinks.forEach((link) => link.classList.remove("active"));

      // ADD ACTIVE CLASS TO HOME LINK
      this.classList.add("active");

      // SMOOTH SCROLL TO TOP
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ===== PAYMENT NOTIFICATION VALIDATION SYSTEM =====

  // ✅ FUNCTION TO DISABLE PAYMENT NOTIFICATION
  function disablePaymentNotification(bookingID) {
    console.log("🔄 Disabling payment notification for booking:", bookingID);

    const notifications = document.querySelectorAll(
      '.notification-item, .notif-item, [class*="notification"]'
    );

    notifications.forEach((notification) => {
      const notificationText = notification.textContent.toLowerCase();

      // Check kung ito ay payment-related notification
      if (
        notificationText.includes("payment") ||
        notificationText.includes("pay") ||
        notificationText.includes("bayad") ||
        notification.dataset.bookingId === bookingID
      ) {
        console.log("🎯 Found payment notification:", notificationText);

        // Hanapin ang payment button sa loob ng notification
        const payButton = notification.querySelector(
          'button, .pay-btn, .notification-action, .btn-pay, [onclick*="payment"], [onclick*="Payment"]'
        );

        if (payButton && !payButton.disabled) {
          // I-disable ang button
          payButton.disabled = true;
          payButton.textContent = "✅ Already Paid";
          payButton.style.backgroundColor = "#cccccc";
          payButton.style.cursor = "not-allowed";
          payButton.style.opacity = "0.6";

          // Remove onclick events
          payButton.onclick = null;
          payButton.removeAttribute("onclick");

          console.log("✅ Successfully disabled payment button");
        }

        // Add visual indicator na completed na
        notification.style.borderLeft = "4px solid #4CAF50";
        notification.style.background = "#f8fff8";
      }
    });
  }

  // ✅ FUNCTION TO CHECK PAYMENT STATUS ON PAGE LOAD
  async function initializePaymentNotifications() {
    try {
      console.log("🔍 Checking payment notifications status...");

      // Wait for notifications to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const notifications = document.querySelectorAll(
        '.notification-item, .notif-item, [class*="notification"]'
      );

      if (notifications.length === 0) {
        console.log("ℹ️ No notifications found on page");
        return false;
      }

      console.log(`📋 Found ${notifications.length} notifications to check`);

      let foundActivePayments = false;

      for (const notification of notifications) {
        const notificationText = notification.textContent.toLowerCase();

        // Check if this is a payment notification
        if (
          notificationText.includes("payment") ||
          notificationText.includes("pay")
        ) {
          console.log(
            "💰 Payment notification found:",
            notificationText.substring(0, 50)
          );

          // Try to get booking ID
          const bookingID = extractBookingIdFromNotification(notification);

          if (bookingID && bookingID !== "booking") {
            console.log("🔎 Checking payment status for booking:", bookingID);

            try {
              const response = await fetch(`/api/payments/check/${bookingID}`);
              if (response.ok) {
                const status = await response.json();

                if (status.alreadyPaid) {
                  console.log(
                    "✅ Payment already completed, disabling notification"
                  );
                  disablePaymentNotification(bookingID);
                } else {
                  foundActivePayments = true;
                  console.log(
                    "🔄 Payment not yet completed, keeping notification active"
                  );
                }
              }
            } catch (error) {
              console.error("❌ Error checking payment status:", error);
            }
          } else {
            console.log("⚠️ No valid booking ID found in notification");
          }
        }
      }

      return foundActivePayments;
    } catch (error) {
      console.error("❌ Error initializing payment notifications:", error);
      return false;
    }
  }

  // ✅ CHECK PAYMENT STATUS FOR CURRENT GUEST
  async function checkAllGuestBookings() {
    try {
      const guestID = localStorage.getItem("guestID");

      if (!guestID) {
        console.log("ℹ️ No guest logged in, skipping payment check");
        return false;
      }

      console.log("👤 Checking ALL bookings for guest:", guestID);

      // Get all bookings for this guest
      const response = await fetch(`/api/bookings/guest/${guestID}`);
      if (response.ok) {
        const bookings = await response.json();

        console.log(`📋 Found ${bookings.length} bookings to check`);

        let foundActiveBookings = false;

        for (const booking of bookings) {
          if (booking.bookingID && booking.bookingID !== "booking") {
            console.log(
              "🔎 Checking payment status for booking:",
              booking.bookingID
            );

            try {
              const paymentResponse = await fetch(
                `/api/payments/check/${booking.bookingID}`
              );
              if (paymentResponse.ok) {
                const paymentStatus = await paymentResponse.json();

                if (paymentStatus.alreadyPaid) {
                  console.log(
                    `✅ Booking ${booking.bookingID} already paid, disabling notifications`
                  );
                  disablePaymentNotification(booking.bookingID);
                } else {
                  foundActiveBookings = true;
                }
              }
            } catch (error) {
              console.error(
                "❌ Error checking payment for booking:",
                booking.bookingID,
                error
              );
            }
          }
        }

        return foundActiveBookings;
      }
    } catch (error) {
      console.error("❌ Error checking guest bookings:", error);
      return false;
    }
    return false;
  }

  // ✅ HELPER FUNCTION TO EXTRACT BOOKING ID
  function extractBookingIdFromNotification(notification) {
    // Method 1: From data attribute
    if (
      notification.dataset.bookingId &&
      notification.dataset.bookingId !== "booking"
    ) {
      return notification.dataset.bookingId;
    }

    // Method 2: From child element data attribute
    const childWithBookingId = notification.querySelector("[data-booking-id]");
    if (
      childWithBookingId &&
      childWithBookingId.dataset.bookingId !== "booking"
    ) {
      return childWithBookingId.dataset.bookingId;
    }

    // Method 3: From text content (look for patterns like B123, BOOKING_123, etc.)
    const text = notification.textContent;
    const bookingIdMatch = text.match(/(B|BOOKING|BK)[_\-]?[A-Z0-9]+/i);
    if (bookingIdMatch && bookingIdMatch[0] !== "booking") {
      return bookingIdMatch[0];
    }

    return null;
  }

  // ===== FEEDBACK NOTIFICATION VALIDATION SYSTEM =====

  // ✅ FUNCTION TO CHECK IF GUEST HAS ALREADY SUBMITTED ANY FEEDBACK (ONE-TIME)
  async function checkGuestFeedbackHistory(guestID) {
    try {
      console.log(`🔍 Checking if guest ${guestID} has submitted any feedback before...`);
      
      const response = await fetch(`/api/feedback/check-guest/${guestID}`);
      if (response.ok) {
        const data = await response.json();
        
        console.log(`📊 Guest feedback history:`, data);
        
        // ✅ AYOS: I-disable lang kung may feedback NA TALAGA for LATEST booking
        if (data.hasSubmittedFeedback && data.latestBookingID) {
          console.log(`⛔ Guest ${guestID} has submitted feedback for latest booking - DISABLING FEEDBACK BUTTON`);
          disableFeedbackNotification(data.latestBookingID);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("❌ Error checking guest feedback history:", error);
      return false;
    }
  }

  // ✅ FUNCTION TO DISABLE ALL FEEDBACK BUTTONS
  function disableAllFeedbackButtons() {
    console.log("🔄 Disabling ALL feedback buttons...");
    
    const feedbackButtons = document.querySelectorAll(
      'button, .feedback-btn, .notification-action, .btn-feedback, [onclick*="feedback"], [onclick*="Feedback"]'
    );
    
    feedbackButtons.forEach(button => {
      const buttonText = button.textContent.toLowerCase();
      
      // Check if this is a feedback button
      if (
        buttonText.includes("feedback") || 
        buttonText.includes("share") || 
        buttonText.includes("experience") ||
        (button.hasAttribute('onclick') && button.getAttribute('onclick').includes('feedback'))
      ) {
        console.log("🎯 Found feedback button to disable:", button.textContent);
        
        button.disabled = true;
        button.textContent = "✅ Feedback Submitted";
        button.style.backgroundColor = "#cccccc";
        button.style.cursor = "not-allowed";
        button.style.opacity = "0.6";
        
        // Remove all click events
        button.onclick = null;
        button.removeAttribute("onclick");
        
        // Also remove any parent click events
        const parent = button.closest('.notification-item, .notif-item, [class*="notification"]');
        if (parent) {
          parent.style.cursor = "default";
          parent.onclick = null;
          parent.style.borderLeft = "4px solid #4CAF50";
          parent.style.background = "#f8fff8";
        }
      }
    });
    
    // Also hide or disable the entire notification containers
    const notifications = document.querySelectorAll(
      '.notification-item, .notif-item, [class*="notification"]'
    );
    
    notifications.forEach(notification => {
      const notificationText = notification.textContent.toLowerCase();
      
      if (
        notificationText.includes("feedback") ||
        notificationText.includes("experience") || 
        notificationText.includes("share")
      ) {
        console.log("🎯 Hiding feedback notification:", notificationText.substring(0, 50));
        
        // Option 2: Keep but mark as completed
        notification.style.borderLeft = "4px solid #4CAF50";
        notification.style.background = "#f8fff8";
        notification.style.opacity = "0.7";
        
        // Remove click events from the entire notification
        notification.onclick = null;
        notification.style.cursor = "default";
        
        // Find and disable any buttons inside
        const buttons = notification.querySelectorAll('button');
        buttons.forEach(btn => {
          btn.disabled = true;
          btn.style.opacity = "0.5";
          btn.style.cursor = "not-allowed";
        });
      }
    });
  }

  // ✅ FUNCTION TO DISABLE FEEDBACK NOTIFICATION
  function disableFeedbackNotification(bookingID) {
    console.log("🔄 Disabling feedback notification for booking:", bookingID);

    const notifications = document.querySelectorAll(
      '.notification-item, .notif-item, [class*="notification"]'
    );

    notifications.forEach((notification) => {
      const notificationText = notification.textContent.toLowerCase();

      // Check kung feedback-related notification
      if (
        notificationText.includes("feedback") ||
        notificationText.includes("experience") ||
        notificationText.includes("share") ||
        notification.dataset.bookingId === bookingID
      ) {
        console.log("🎯 Found feedback notification:", notificationText);

        const feedbackButton = notification.querySelector(
          'button, .feedback-btn, .notification-action, .btn-feedback, [onclick*="feedback"], [onclick*="Feedback"]'
        );

        if (feedbackButton && !feedbackButton.disabled) {
          feedbackButton.disabled = true;
          feedbackButton.textContent = "✅ Feedback Submitted";
          feedbackButton.style.backgroundColor = "#cccccc";
          feedbackButton.style.cursor = "not-allowed";
          feedbackButton.style.opacity = "0.6";

          feedbackButton.onclick = null;
          feedbackButton.removeAttribute("onclick");

          console.log("✅ Successfully disabled feedback button");
        }

        notification.style.borderLeft = "4px solid #4CAF50";
        notification.style.background = "#f8fff8";
      }
    });
  }

  // ✅ ENHANCED FUNCTION TO CHECK FEEDBACK STATUS
  async function initializeFeedbackNotifications() {
    try {
      console.log("🔍 ENHANCED: Checking feedback notifications status...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const guestID = localStorage.getItem("guestID");
      if (!guestID) {
        console.log("ℹ️ No guest logged in, skipping feedback check");
        return false;
      }

      // ✅ FIRST: CHECK IF GUEST HAS ALREADY SUBMITTED ANY FEEDBACK (ONE-TIME)
      const hasSubmittedBefore = await checkGuestFeedbackHistory(guestID);
      if (hasSubmittedBefore) {
        console.log("🛑 Guest has already submitted feedback before - STOPPING ALL FEEDBACK CHECKS");
        return false; // No need to check further
      }

      // ✅ SECOND: CHECK INDIVIDUAL BOOKING FEEDBACKS (only if no previous feedback)
      const notifications = document.querySelectorAll(
        '.notification-item, .notif-item, [class*="notification"]'
      );

      if (notifications.length === 0) {
        console.log("ℹ️ No notifications found on page");
        return false;
      }

      console.log(`📋 Found ${notifications.length} notifications to check for feedback`);

      let foundActiveFeedbacks = false;

      for (const notification of notifications) {
        const notificationText = notification.textContent.toLowerCase();

        if (
          notificationText.includes("feedback") ||
          notificationText.includes("experience") ||
          notificationText.includes("share")
        ) {
          console.log("💬 Feedback notification found:", notificationText.substring(0, 50));

          const bookingID = extractBookingIdFromNotification(notification);

          if (bookingID) {
            console.log("🔎 Checking feedback status for booking:", bookingID);

            try {
              const response = await fetch(`/api/feedback/check/${guestID}/${bookingID}`);
              if (response.ok) {
                const status = await response.json();

                if (status.alreadySubmitted) {
                  console.log("✅ Feedback already submitted for this booking, disabling notification");
                  disableFeedbackNotification(bookingID);
                } else {
                  foundActiveFeedbacks = true;
                  console.log("🔄 Feedback not yet submitted for this booking");
                }
              }
            } catch (error) {
              console.error("❌ Error checking feedback status:", error);
            }
          }
        }
      }

      return foundActiveFeedbacks;
    } catch (error) {
      console.error("❌ Error initializing feedback notifications:", error);
      return false;
    }
  }

  // ✅ ENHANCED LOGIN/LOGOUT DETECTION SYSTEM
  function setupLoginDetection() {
    console.log("🔐 Setting up ENHANCED login detection...");

    // Listen for storage changes (login/logout)
    window.addEventListener("storage", function (e) {
      if (e.key === "guestID" || e.key === "isLoggedIn") {
        console.log("🔐 Auth state changed detected, rechecking payments and feedbacks...");
        setTimeout(() => {
          initializePaymentNotifications();
          initializeFeedbackNotifications();
          checkAllGuestBookings();
        }, 1000);
      }
    });

    // Check every time the page loads/refreshes
    window.addEventListener("load", function () {
      console.log("🔄 Page loaded, checking payments and feedbacks...");
      setTimeout(() => {
        initializePaymentNotifications();
        initializeFeedbackNotifications();
        checkAllGuestBookings();
      }, 1500);
    });
  }

  // ✅ ENHANCED PAYMENT NOTIFICATION SYSTEM
  function initPaymentNotificationSystem() {
    console.log("🚀 Initializing ENHANCED payment notification system...");

    // Setup login detection FIRST
    setupLoginDetection();

    let checkCount = 0;
    const maxChecks = 3;

    const performEnhancedCheck = async () => {
      if (checkCount >= maxChecks) {
        console.log("🛑 Stopping periodic payment checks - maximum attempts reached");
        return;
      }

      checkCount++;
      console.log(`🔄 Enhanced payment check #${checkCount}/${maxChecks}`);

      // Check both notifications AND all guest bookings
      const foundPayments = await initializePaymentNotifications();
      const foundBookings = await checkAllGuestBookings();

      // ONLY CHECK AGAIN IF WE FOUND ACTIVE PAYMENTS
      if ((foundPayments || foundBookings) && checkCount < maxChecks) {
        console.log('💡 Active payments found, checking again in 3 seconds');
        setTimeout(performEnhancedCheck, 3000);
      } else {
        console.log('🛑 No active payments found OR max checks reached, stopping');
      }
    };

    // Initial comprehensive check
    setTimeout(performEnhancedCheck, 2000);
  }

  // ✅ ENHANCED FEEDBACK NOTIFICATION SYSTEM
  function initFeedbackNotificationSystem() {
    console.log("🚀 Initializing ENHANCED feedback notification system...");

    let checkCount = 0;
    const maxChecks = 3;

    const performFeedbackCheck = async () => {
      if (checkCount >= maxChecks) {
        console.log("🛑 Stopping feedback checks - maximum attempts reached");
        return;
      }

      checkCount++;
      console.log(`🔄 ENHANCED Feedback check #${checkCount}/${maxChecks}`);

      const foundFeedbacks = await initializeFeedbackNotifications();

      // Only continue checking if guest hasn't submitted any feedback yet
      if (foundFeedbacks && checkCount < maxChecks) {
        console.log('💡 Active feedback notifications found, checking again in 5 seconds');
        setTimeout(performFeedbackCheck, 5000);
      } else {
        console.log("🛑 No active feedback notifications OR guest already submitted feedback, stopping checks");
      }
    };

    setTimeout(performFeedbackCheck, 2500);
  }

  // ✅ START BOTH SYSTEMS
  initPaymentNotificationSystem();
  initFeedbackNotificationSystem();

  // ✅ MAKE FUNCTIONS AVAILABLE GLOBALLY
  window.disablePaymentNotification = disablePaymentNotification;
  window.initializePaymentNotifications = initializePaymentNotifications;
  window.checkAllGuestBookings = checkAllGuestBookings;
  window.disableFeedbackNotification = disableFeedbackNotification;
  window.initializeFeedbackNotifications = initializeFeedbackNotifications;
  window.checkGuestFeedbackHistory = checkGuestFeedbackHistory;
  window.disableAllFeedbackButtons = disableAllFeedbackButtons;

  console.log("✅ Navigation system loaded successfully!");
  console.log("✅ ENHANCED Payment notification system loaded successfully!");
  console.log("✅ ENHANCED Feedback notification system loaded successfully!");
});

// ===== GLOBAL LOADING FUNCTIONS =====
function showLoading(message = "Processing...") {
  const loadingModal = document.getElementById('loadingModal');
  if (loadingModal) {
    const messageEl = loadingModal.querySelector('.loading-message');
    messageEl.textContent = message;
    loadingModal.style.display = 'flex';
    console.log("🔄 Loading shown:", message);
  }
}

function hideLoading() {
  const loadingModal = document.getElementById('loadingModal');
  if (loadingModal) {
    loadingModal.style.display = 'none';
    console.log("✅ Loading hidden");
  }
}

function setButtonLoading(button, isLoading, loadingText = "Loading...") {
  if (isLoading) {
    button.disabled = true;
    button.classList.add('btn-loading');
    button.dataset.originalText = button.textContent;
    button.innerHTML = `${loadingText} <div class="spinner-small"></div>`;
  } else {
    button.disabled = false;
    button.classList.remove('btn-loading');
    button.textContent = button.dataset.originalText || button.textContent;
  }
}