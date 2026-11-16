/* PassPortal — pages/student/dashboard script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // UTILITIES
    // =====================================

    function getStudents() {
        const savedData = localStorage.getItem("passportal_students");
        const students = JSON.parse(savedData || "[]");
        if (!Array.isArray(students)) throw new Error("Invalid student data.");
        return students;
    }

    function showToast(text, success) {
        const existing = document.querySelector(".toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.className = success ? "toast toast-success" : "toast toast-error";
        toast.textContent = text;
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            toast.style.transition = "all 0.4s ease";
            setTimeout(function () { toast.remove(); }, 400);
        }, 3500);
    }

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
    // 3. STUDENT DASHBOARD
    // =====================================

    const dashboardName = document.getElementById("dashboard-name");

    if (dashboardName) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");

            if (!session || session.role !== "student") {
                window.location.href = "login.html";
            } else {
                const students = getStudents();
                const student = students.find(function (item) {
                    return item.email === session.email && item.role === "student";
                });

                if (!student) {
                    localStorage.removeItem("passportal_session");
                    window.location.href = "login.html";
                } else {
                    document.getElementById("dashboard-name").textContent = student.fullName;

                    const fields = {
                        "dashboard-full-name": student.fullName,
                        "dashboard-student-id": student.studentId,
                        "dashboard-email": student.email,
                        "dashboard-course": student.course,
                        "dashboard-year": student.year
                    };

                    Object.keys(fields).forEach(function (id) {
                        const element = document.getElementById(id);
                        if (element) element.textContent = fields[id];
                    });

                    // Greeting based on time
                    const hour = new Date().getHours();
                    const greeting = document.getElementById("dashboard-greeting");
                    if (greeting) {
                        if (hour < 12) greeting.textContent = "Good Morning! ☀️";
                        else if (hour < 17) greeting.textContent = "Good Afternoon! 🌤️";
                        else greeting.textContent = "Good Evening! 🌙";
                    }
                }
            }

        } catch (error) {
            console.error("Dashboard error:", error);
            window.location.href = "login.html";
        }
    }

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            showToast("Logged out successfully! 👋", true);
            setTimeout(function () {
                localStorage.removeItem("passportal_session");
                window.location.href = "login.html";
            }, 600);
        });
    }

    // =====================================
    // 8. STUDENT DASHBOARD STATISTICS
    // =====================================

    const totalApplicationsElement = document.getElementById("total-applications");

    if (totalApplicationsElement) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "login.html";
            } else {
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                if (!Array.isArray(applications)) throw new Error("Invalid application data.");

                const myApplications = applications.filter(function (a) { return a.studentEmail === session.email; });
                const pending = myApplications.filter(function (a) { return a.status === "Pending"; }).length;
                const approved = myApplications.filter(function (a) { return a.status === "Approved"; }).length;
                const rejected = myApplications.filter(function (a) { return a.status === "Rejected"; }).length;

                animateValue(document.getElementById("total-applications"), 0, myApplications.length, 800);
                animateValue(document.getElementById("pending-applications"), 0, pending, 800);
                animateValue(document.getElementById("approved-applications"), 0, approved, 800);
                animateValue(document.getElementById("rejected-applications"), 0, rejected, 800);
            }
        } catch (error) {
            console.error("Application statistics error:", error);
        }
    }

});
