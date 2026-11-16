/* PassPortal — index script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // HOMEPAGE ANIMATIONS
    // =====================================

    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
        // Intersection observer for scroll animations
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(".feature-card, .process-step, .cta-section").forEach(function (el) {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            el.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
            observer.observe(el);
        });

        // Parallax on hero visual
        const visual = document.querySelector(".hero-visual");
        if (visual) {
            window.addEventListener("mousemove", function (e) {
                const x = (e.clientX / window.innerWidth - 0.5) * 10;
                const y = (e.clientY / window.innerHeight - 0.5) * 10;
                visual.style.transform = "perspective(1000px) rotateY(" + x + "deg) rotateX(" + (-y) + "deg)";
            });
        }
    }

    // Mobile nav toggle
    const mobileToggle = document.getElementById("mobile-nav-toggle");
    const mobileNav = document.getElementById("mobile-nav-menu");
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
            mobileToggle.textContent = mobileNav.classList.contains("open") ? "✕" : "☰";
        });
    }

});
