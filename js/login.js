/* PassPortal — pages/login script (split from script.js) */
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
    // 2. LOGIN
    // =====================================

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const password = document.getElementById("login-password").value;
            const role = document.getElementById("login-role").value;

            // Button loading state
            const submitBtn = loginForm.querySelector("button[type=submit], input[type=submit]");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Signing in...";
            }

            setTimeout(function () {
                try {
                    let account = null;

                    if (role === "student") {
                        const students = getStudents();
                        account = students.find(function (student) {
                            return student.email === email && student.password === password && student.role === "student";
                        });
                    } else if (role === "admin") {
                        if (email === "admin@passportal.demo" && password === "AdminDemo123") {
                            account = { fullName: "Demo Administrator", email: email, role: "admin" };
                        }
                    }

                    if (!account) {
                        showMessage("login-message", "Invalid email, password, or selected role.", false);
                        showToast("Login failed. Check your credentials.", false);
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Sign In →"; }
                        return;
                    }

                    localStorage.setItem("passportal_session", JSON.stringify({
                        fullName: account.fullName,
                        email: account.email,
                        role: account.role,
                        loggedInAt: new Date().toISOString()
                    }));

                    showToast("Welcome back, " + account.fullName + "! 👋", true);

                    setTimeout(function () {
                        if (account.role === "admin") {
                            window.location.href = "admin-dashboard.html";
                        } else {
                            window.location.href = "student-dashboard.html";
                        }
                    }, 800);

                } catch (error) {
                    showMessage("login-message", "Unable to log in. Check browser storage.", false);
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Sign In →"; }
                    console.error(error);
                }
            }, 600);
        });

        // Toggle password visibility
        const togglePw = document.getElementById("toggle-password");
        const pwInput = document.getElementById("login-password");
        if (togglePw && pwInput) {
            togglePw.addEventListener("click", function () {
                const isPassword = pwInput.type === "password";
                pwInput.type = isPassword ? "text" : "password";
                togglePw.textContent = isPassword ? "🙈" : "👁️";
            });
        }
    }

});
