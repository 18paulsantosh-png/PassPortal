/* PassPortal — pages/forgot-password script (split from script.js) */
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

    function showMessage(elementId, text, success) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.className = success ? "message-box message-success" : "message-box message-error";
            element.style.display = "block";
        }
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

    // =====================================
    // 4. FORGOT PASSWORD
    // =====================================

    const forgotPasswordForm = document.getElementById("forgot-password-form");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("reset-email").value.trim().toLowerCase();
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-new-password").value;

            if (newPassword.length < 8) {
                showMessage("reset-message", "Password must contain at least 8 characters.", false);
                return;
            }

            if (newPassword !== confirmPassword) {
                showMessage("reset-message", "Passwords do not match.", false);
                return;
            }

            try {
                const students = getStudents();
                const index = students.findIndex(function (student) {
                    return student.email === email && student.role === "student";
                });

                if (index === -1) {
                    showMessage("reset-message", "No student account was found for this email.", false);
                    showToast("Email not found.", false);
                    return;
                }

                students[index].password = newPassword;
                localStorage.setItem("passportal_students", JSON.stringify(students));
                showMessage("reset-message", "Password reset successfully. You can now log in.", true);
                showToast("Password updated! 🔒", true);
                forgotPasswordForm.reset();

            } catch (error) {
                showMessage("reset-message", "Unable to reset the password.", false);
                console.error(error);
            }
        });
    }

});
