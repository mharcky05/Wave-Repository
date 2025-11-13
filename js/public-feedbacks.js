import { API_URL } from "./config.js";

// public-feedbacks.js - Public Feedback Display System
class PublicFeedbacks {
  constructor() {
    this.feedbacks = [];
    this.currentSlide = 0;
    this.track = document.getElementById("feedbacksTrack");
    this.prevBtn = document.querySelector(".prev-btn");
    this.nextBtn = document.querySelector(".next-btn");
    this.autoSlideInterval = null;

    this.init();
  }

  async init() {
    console.log("🔄 Initializing public feedbacks...");
    await this.loadFeedbacks();
    this.renderFeedbacks();
    this.setupEventListeners();

    // Only start auto-slide if there are multiple feedbacks
    if (this.feedbacks.length > 1) {
      this.startAutoSlide();
    }
  }

  async loadFeedbacks() {
    try {
      // Show loading state
      if (this.track) {
        this.track.innerHTML =
          '<div class="feedbacks-loading">Loading guest experiences...</div>';
      }

      const res = await fetch("${API_URL}/api/feedback");

      if (!res.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const allFeedbacks = await res.json();
      console.log("📊 Loaded feedbacks:", allFeedbacks.length);

      // Show ALL feedbacks with ratings 4-5 stars (no duplicates removal)
      this.feedbacks = allFeedbacks.filter((fb) => fb.rating >= 4);
      console.log("⭐ High-rated feedbacks to show:", this.feedbacks.length);
    } catch (error) {
      console.error("❌ Error loading public feedbacks:", error);
      if (this.track) {
        this.track.innerHTML =
          '<div class="no-feedbacks">What our guests say about their experience...</div>';
      }
    }
  }

  renderFeedbacks() {
    if (!this.track) return;

    if (!this.feedbacks || this.feedbacks.length === 0) {
      this.track.innerHTML =
        '<div class="no-feedbacks">Be the first to share your experience at L\'Escapade!</div>';
      return;
    }

    console.log("🎨 Rendering feedback slides:", this.feedbacks.length);

    this.track.innerHTML = this.feedbacks
      .map(
        (feedback, index) => `
      <div class="feedback-slide" data-index="${index}">
        <div class="feedback-stars">
          ${this.renderStaticStars(feedback.rating)}
        </div>
        <div class="feedback-text">
          "${this.truncateText(feedback.comments, 150)}"
        </div>
        <div class="feedback-author">
          — ${this.getDisplayName(feedback)}
        </div>
      </div>
    `
      )
      .join("");

    this.updateSliderPosition();
  }

  // Add this new function for static star display
  renderStaticStars(rating) {
    console.log(`⭐ Rendering ${rating} stars`);
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<span class="star filled">★</span>'; // Filled YELLOW star
      } else {
        stars += '<span class="star empty">☆</span>'; // Outline GRAY star
      }
    }
    return stars;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  getDisplayName(feedback) {
    // Always show as "Anonymous" for public display (privacy)
    return "Anonymous Guest";
  }

  setupEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        console.log("⬅️ Previous button clicked");
        this.prevSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        console.log("➡️ Next button clicked");
        this.nextSlide();
      });
    }

    // Pause auto-slide on hover
    if (this.track) {
      this.track.addEventListener("mouseenter", () => {
        console.log("⏸️ Pausing auto-slide");
        this.pauseAutoSlide();
      });

      this.track.addEventListener("mouseleave", () => {
        console.log("▶️ Resuming auto-slide");
        if (this.feedbacks.length > 1) {
          this.startAutoSlide();
        }
      });
    }
  }

  nextSlide() {
    if (this.feedbacks.length <= 1) return;

    this.currentSlide = (this.currentSlide + 1) % this.feedbacks.length;
    console.log("➡️ Moving to slide:", this.currentSlide);
    this.updateSliderPosition();
  }

  prevSlide() {
    if (this.feedbacks.length <= 1) return;

    this.currentSlide =
      (this.currentSlide - 1 + this.feedbacks.length) % this.feedbacks.length;
    console.log("⬅️ Moving to slide:", this.currentSlide);
    this.updateSliderPosition();
  }

  updateSliderPosition() {
    if (this.track && this.feedbacks.length > 0) {
      const translateX = -this.currentSlide * 100;
      this.track.style.transform = `translateX(${translateX}%)`;
      console.log("🎚️ Slider position:", translateX + "%");
    }
  }

  startAutoSlide() {
    this.stopAutoSlide();

    if (this.feedbacks.length > 1) {
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, 5000); // Change slide every 5 seconds
      console.log("🔄 Auto-slide started");
    }
  }

  pauseAutoSlide() {
    this.stopAutoSlide();
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
      console.log("⏹️ Auto-slide stopped");
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM loaded - starting public feedbacks");
  new PublicFeedbacks();
});

// Also initialize if script is loaded after DOM is ready
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(() => new PublicFeedbacks(), 100);
}
