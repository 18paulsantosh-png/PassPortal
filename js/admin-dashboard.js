/* PassPortal — pages/admin/dashboard script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // UTILITIES
    // =====================================

    function animateValue(element, start, end, duration) {
        if (!element) return;
        const range = end - start;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            element.textContent = Math.floor(start + range * progress);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // =====================================
    // 9. ADMIN DASHBOARD STATISTICS
    // =====================================

    const adminTotalStudents = document.getElementById("admin-total-students");

    if (adminTotalStudents) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") {
                window.location.href = "login.html";
            } else {
                const students = JSON.parse(localStorage.getItem("passportal_students") || "[]");
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");

                if (!Array.isArray(students) || !Array.isArray(applications)) throw new Error("Invalid saved data.");

                const countStatus = function (status) {
                    return applications.filter(function (a) { return a.status === status; }).length;
                };

                animateValue(document.getElementById("admin-total-students"), 0, students.length, 800);
                animateValue(document.getElementById("admin-pending-applications"), 0, countStatus("Pending"), 800);
                animateValue(document.getElementById("admin-approved-applications"), 0, countStatus("Approved"), 800);
                animateValue(document.getElementById("admin-rejected-applications"), 0, countStatus("Rejected"), 800);

                const issuedEl = document.getElementById("admin-issued-passes");
                const paymentsEl = document.getElementById("admin-pending-payments");
                if (issuedEl) issuedEl.textContent = countStatus("Approved");
                if (paymentsEl) paymentsEl.textContent = countStatus("Pending");
            }
        } catch (error) {
            console.error("Admin dashboard statistics error:", error);
        }
    }

});
