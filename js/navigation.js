// ===== SMOOTH SCROLL NAVIGATION SYSTEM =====
document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[id]");
    
    // ===== STICKY HEADER ON SCROLL =====
    window.addEventListener("scroll", function() {
        if (window.scrollY > 100) {
            navbar.classList.add("sticky");
        } else {
            navbar.classList.remove("sticky");
        }
        
        // ===== UPDATE ACTIVE NAV LINK BASED ON SCROLL POSITION =====
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 100)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // ===== SMOOTH SCROLL FOR NAVIGATION LINKS =====
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                // REMOVE ACTIVE CLASS FROM ALL LINKS
                navLinks.forEach(link => link.classList.remove("active"));
                
                // ADD ACTIVE CLASS TO CLICKED LINK
                this.classList.add("active");
                
                // SMOOTH SCROLL TO TARGET
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // ===== HOME LINK SPECIAL HANDLING (SCROLL TO TOP) =====
    const homeLink = document.querySelector("a[href='#home']");
    if (homeLink) {
        homeLink.addEventListener("click", function(e) {
            e.preventDefault();
            
            // REMOVE ACTIVE CLASS FROM ALL LINKS
            navLinks.forEach(link => link.classList.remove("active"));
            
            // ADD ACTIVE CLASS TO HOME LINK
            this.classList.add("active");
            
            // SMOOTH SCROLL TO TOP
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    console.log("✅ Navigation system loaded successfully!");
});