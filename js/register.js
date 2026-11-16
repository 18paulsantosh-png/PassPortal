/* PassPortal — pages/register script (split from script.js) */
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
    // 1. STUDENT REGISTRATION
    // =====================================

    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        // Real-time validation
        const fields = registerForm.querySelectorAll("input, select");
        fields.forEach(function (field) {
            field.addEventListener("blur", function () {
                validateField(field);
            });
            field.addEventListener("input", function () {
                if (field.classList.contains("field-error")) validateField(field);
            });
        });

        function validateField(field) {
            const id = field.id;
            let valid = true;

            if (!field.value.trim() && field.required) valid = false;
            if (id === "phone" && !/^[0-9]{10}$/.test(field.value.trim())) valid = false;
            if (id === "register-email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) valid = false;
            if (id === "register-password" && field.value.length < 8) valid = false;
            if (id === "confirm-password") {
                const pw = document.getElementById("register-password");
                if (pw && field.value !== pw.value) valid = false;
            }

            if (valid) {
                field.classList.remove("field-error");
                field.style.borderColor = "#00b894";
            } else if (field.value.trim()) {
                field.classList.add("field-error");
                field.style.borderColor = "#ff7675";
            }

            return valid;
        }

        // Password strength indicator
        const passwordField = document.getElementById("register-password");
        const strengthBar = document.getElementById("password-strength");

        if (passwordField && strengthBar) {
            passwordField.addEventListener("input", function () {
                const val = passwordField.value;
                let score = 0;
                if (val.length >= 8) score++;
                if (/[A-Z]/.test(val)) score++;
                if (/[0-9]/.test(val)) score++;
                if (/[^A-Za-z0-9]/.test(val)) score++;

                const colors = ["#ff7675", "#fdcb6e", "#00cec9", "#00b894"];
                const labels = ["Weak", "Fair", "Good", "Strong"];
                const widths = ["25%", "50%", "75%", "100%"];

                strengthBar.style.width = score > 0 ? widths[score - 1] : "0%";
                strengthBar.style.background = score > 0 ? colors[score - 1] : "transparent";
                strengthBar.textContent = score > 0 ? labels[score - 1] : "";
            });
        }

        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const fullName = document.getElementById("full-name").value.trim();
            const studentId = document.getElementById("student-id").value.trim();
            const email = document.getElementById("register-email").value.trim().toLowerCase();
            const phone = document.getElementById("phone").value.trim();
            const course = document.getElementById("course").value.trim();
            const year = document.getElementById("year").value;
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            const terms = document.getElementById("terms").checked;

            if (!fullName || !studentId || !email || !phone || !course || !year || !password || !confirmPassword) {
                showMessage("register-message", "Please complete all required fields.", false);
                showToast("Please fill in all fields.", false);
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage("register-message", "Enter a valid email address.", false);
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                showMessage("register-message", "Enter a valid 10-digit phone number.", false);
                return;
            }

            if (password.length < 8) {
                showMessage("register-message", "Password must contain at least 8 characters.", false);
                return;
            }

            if (password !== confirmPassword) {
                showMessage("register-message", "Passwords do not match.", false);
                return;
            }

            if (!terms) {
                showMessage("register-message", "Please confirm your information.", false);
                return;
            }

            try {
                const students = getStudents();
                const exists = students.some(function (student) {
                    return student.email === email || student.studentId.toLowerCase() === studentId.toLowerCase();
                });

                if (exists) {
                    showMessage("register-message", "This email or student ID is already registered.", false);
                    showToast("Account already exists!", false);
                    return;
                }

                students.push({
                    fullName: fullName,
                    studentId: studentId,
                    email: email,
                    phone: phone,
                    course: course,
                    year: year,
                    password: password,
                    role: "student",
                    createdAt: new Date().toISOString()
                });

                localStorage.setItem("passportal_students", JSON.stringify(students));
                showMessage("register-message", "Registration successful! You can now log in.", true);
                showToast("Account created successfully! 🎉", true);
                registerForm.reset();

            } catch (error) {
                showMessage("register-message", "Could not save your account. Check browser storage.", false);
                console.error(error);
            }
        });
    }

});
