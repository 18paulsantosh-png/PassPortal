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
                            window.location.href = "admin/dashboard.html";
                        } else {
                            window.location.href = "student/dashboard.html";
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


    // =====================================
    // 3. STUDENT DASHBOARD
    // =====================================

    const dashboardName = document.getElementById("dashboard-name");

    if (dashboardName) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");

            if (!session || session.role !== "student") {
                window.location.href = "../login.html";
            } else {
                const students = getStudents();
                const student = students.find(function (item) {
                    return item.email === session.email && item.role === "student";
                });

                if (!student) {
                    localStorage.removeItem("passportal_session");
                    window.location.href = "../login.html";
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
            window.location.href = "../login.html";
        }
    }

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            showToast("Logged out successfully! 👋", true);
            setTimeout(function () {
                localStorage.removeItem("passportal_session");
                window.location.href = "../login.html";
            }, 600);
        });
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


    // =====================================
    // 5. STUDENT PASS APPLICATION
    // =====================================

    const applicationForm = document.getElementById("pass-application-form");

    if (applicationForm) {
        const routeField = document.getElementById("application-route");
        const typeField = document.getElementById("pass-type");
        const durationField = document.getElementById("pass-duration");
        const startDateField = document.getElementById("application-start-date");
        const feeDisplay = document.getElementById("application-fee");
        const routeFareDisplay = document.getElementById("route-monthly-fare");

        const defaultRoutes = [
            { id: "R001", name: "Phagwara", stops: "Demo pickup stops", fare: 500 },
            { id: "R002", name: "Jalandhar", stops: "Demo pickup stops", fare: 1000 },
            { id: "R003", name: "Hoshiarpur", stops: "Demo pickup stops", fare: 1500 },
            { id: "R004", name: "Nakodar", stops: "Demo pickup stops", fare: 800 }
        ];

        let savedRoutes = [];

        try {
            const storedRoutes = localStorage.getItem("passportal_routes");
            savedRoutes = storedRoutes === null ? defaultRoutes : JSON.parse(storedRoutes);
            if (!Array.isArray(savedRoutes)) throw new Error("Invalid route data.");

            if (storedRoutes === null) {
                localStorage.setItem("passportal_routes", JSON.stringify(defaultRoutes));
            }

            if (routeField) {
                routeField.replaceChildren();
                const placeholder = document.createElement("option");
                placeholder.value = "";
                placeholder.textContent = savedRoutes.length ? "Select a route" : "No routes available";
                routeField.appendChild(placeholder);

                savedRoutes.forEach(function (route) {
                    const option = document.createElement("option");
                    option.value = route.id;
                    option.textContent = route.id + " — " + route.name + " (₹" + route.fare + "/mo)";
                    routeField.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Unable to load routes:", error);
            if (routeField) {
                routeField.replaceChildren();
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "Unable to load routes";
                routeField.appendChild(option);
            }
        }

        function calculateApplicationFee() {
            const passType = typeField ? typeField.value : "";
            const duration = durationField ? Number(durationField.value) : 1;
            const selectedRoute = savedRoutes.find(function (route) {
                return route.id === (routeField ? routeField.value : "");
            });

            let fee = 0;
            if (passType === "daily") fee = 50;
            else if (passType === "monthly") fee = selectedRoute ? Number(selectedRoute.fare) * duration : 0;
            else if (passType === "semester") fee = 2500;

            if (feeDisplay) {
                animateValue(feeDisplay, parseInt(feeDisplay.textContent) || 0, fee, 400);
            }
            return fee;
        }

        function updateRouteFare() {
            const selectedRoute = savedRoutes.find(function (route) {
                return route.id === (routeField ? routeField.value : "");
            });

            if (routeFareDisplay) {
                routeFareDisplay.textContent = selectedRoute ? Number(selectedRoute.fare) : 0;
            }
            calculateApplicationFee();
        }

        if (routeField) routeField.addEventListener("change", updateRouteFare);
        if (typeField) typeField.addEventListener("change", updateRouteFare);
        if (durationField) durationField.addEventListener("change", updateRouteFare);
        updateRouteFare();

        // Set min date to today
        if (startDateField) {
            const today = new Date().toISOString().split("T")[0];
            startDateField.setAttribute("min", today);
        }

        applicationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            try {
                const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
                if (!session || session.role !== "student") {
                    showMessage("application-message", "Please log in with your student account first.", false);
                    return;
                }

                const route = routeField ? routeField.value : "";
                const selectedRoute = savedRoutes.find(function (item) { return item.id === route; });
                const routeName = selectedRoute ? selectedRoute.name : "Unknown Route";
                const passType = typeField ? typeField.value : "";
                const duration = durationField ? Number(durationField.value) : 0;
                const startDate = startDateField ? startDateField.value : "";

                if (!route || !passType || !duration || !startDate) {
                    showMessage("application-message", "Please complete all application fields.", false);
                    showToast("Please fill in all fields.", false);
                    return;
                }

                const selectedDate = new Date(startDate + "T00:00:00");
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
                    showMessage("application-message", "Please select today or a future start date.", false);
                    return;
                }

                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                if (!Array.isArray(applications)) throw new Error("Invalid application data.");

                const fee = calculateApplicationFee();

                const application = {
                    applicationId: "APP" + Date.now(),
                    studentEmail: session.email,
                    studentName: session.fullName,
                    route: route,
                    routeName: routeName,
                    passType: passType,
                    durationMonths: duration,
                    startDate: startDate,
                    fee: fee,
                    status: "Pending",
                    submittedAt: new Date().toISOString()
                };

                applications.push(application);
                localStorage.setItem("passportal_applications", JSON.stringify(applications));
                showMessage("application-message", "Application submitted successfully! ID: " + application.applicationId, true);
                showToast("Application submitted! 🚌", true);
                applicationForm.reset();
                updateRouteFare();

            } catch (error) {
                console.error("Pass application error:", error);
                showMessage("application-message", "Could not save your application. Please try again.", false);
            }
        });
    }


    // =====================================
    // 6. STUDENT MY PASS PAGE
    // =====================================

    const myPassTableBody = document.getElementById("my-pass-table-body");

    if (myPassTableBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "../login.html";
            } else {
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                if (!Array.isArray(applications)) throw new Error("Invalid application data.");

                const myApplications = applications.filter(function (application) {
                    return application.studentEmail === session.email;
                });

                myPassTableBody.replaceChildren();

                if (myApplications.length === 0) {
                    const row = document.createElement("tr");
                    const cell = document.createElement("td");
                    cell.colSpan = 7;
                    cell.textContent = "You have not submitted any applications yet.";
                    cell.style.textAlign = "center";
                    cell.style.padding = "40px";
                    cell.style.color = "#636e72";
                    row.appendChild(cell);
                    myPassTableBody.appendChild(row);
                } else {
                    myApplications.slice().reverse().forEach(function (application, index) {
                        const row = document.createElement("tr");
                        row.style.animation = "slideUp 0.4s ease " + (index * 0.05) + "s both";

                        const values = [
                            application.applicationId,
                            application.routeName || application.route,
                            application.passType,
                            application.durationMonths + " month(s)",
                            application.startDate,
                            "₹" + application.fee,
                            application.status
                        ];

                        values.forEach(function (value, i) {
                            const cell = document.createElement("td");
                            if (i === 6) {
                                const badge = document.createElement("span");
                                badge.textContent = value;
                                badge.style.padding = "4px 12px";
                                badge.style.borderRadius = "20px";
                                badge.style.fontSize = ".78rem";
                                badge.style.fontWeight = "700";
                                if (value === "Approved") {
                                    badge.style.background = "#e8faf4";
                                    badge.style.color = "#00b894";
                                } else if (value === "Rejected") {
                                    badge.style.background = "#fff0f0";
                                    badge.style.color = "#ff7675";
                                } else {
                                    badge.style.background = "#fffbeb";
                                    badge.style.color = "#d99327";
                                }
                                cell.appendChild(badge);
                            } else {
                                cell.textContent = String(value);
                            }
                            row.appendChild(cell);
                        });

                        myPassTableBody.appendChild(row);
                    });
                }

                showMessage("my-pass-message", myApplications.length + " application(s) found.", true);
            }
        } catch (error) {
            console.error("My Pass page error:", error);
            myPassTableBody.replaceChildren();
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "Unable to load applications. Please try again.";
            row.appendChild(cell);
            myPassTableBody.appendChild(row);
        }
    }


    // =====================================
    // 7. ADMIN APPLICATION REVIEW
    // =====================================

    const adminApplicationsBody = document.getElementById("admin-applications-table-body");

    if (adminApplicationsBody) {
        const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
        if (!session || session.role !== "admin") {
            window.location.href = "../login.html";
        } else {
            function renderAdminApplications() {
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                if (!Array.isArray(applications)) throw new Error("Invalid application data.");

                adminApplicationsBody.replaceChildren();

                if (applications.length === 0) {
                    const row = document.createElement("tr");
                    const cell = document.createElement("td");
                    cell.colSpan = 10;
                    cell.textContent = "No applications have been submitted yet.";
                    cell.style.textAlign = "center";
                    cell.style.padding = "40px";
                    row.appendChild(cell);
                    adminApplicationsBody.appendChild(row);
                    return;
                }

                applications.slice().reverse().forEach(function (application, index) {
                    const row = document.createElement("tr");
                    row.style.animation = "slideUp 0.3s ease " + (index * 0.03) + "s both";

                    const values = [
                        application.applicationId,
                        application.studentName,
                        application.studentEmail,
                        application.routeName || application.route,
                        application.passType,
                        application.durationMonths + " month(s)",
                        application.startDate,
                        "₹" + application.fee,
                        application.status
                    ];

                    values.forEach(function (value, i) {
                        const cell = document.createElement("td");
                        if (i === 8) {
                            const badge = document.createElement("span");
                            badge.textContent = value;
                            badge.style.padding = "4px 12px";
                            badge.style.borderRadius = "20px";
                            badge.style.fontSize = ".78rem";
                            badge.style.fontWeight = "700";
                            if (value === "Approved") {
                                badge.style.background = "#e8faf4";
                                badge.style.color = "#00b894";
                            } else if (value === "Rejected") {
                                badge.style.background = "#fff0f0";
                                badge.style.color = "#ff7675";
                            } else {
                                badge.style.background = "#fffbeb";
                                badge.style.color = "#d99327";
                            }
                            cell.appendChild(badge);
                        } else {
                            cell.textContent = String(value);
                        }
                        row.appendChild(cell);
                    });

                    const actionsCell = document.createElement("td");

                    if (application.status === "Pending") {
                        const approveButton = document.createElement("button");
                        approveButton.type = "button";
                        approveButton.textContent = "✓ Approve";
                        approveButton.className = "btn-success";
                        approveButton.style.fontSize = ".8rem";
                        approveButton.style.padding = "8px 14px";

                        approveButton.addEventListener("click", function () {
                            updateApplicationStatus(application.applicationId, "Approved");
                        });

                        const rejectButton = document.createElement("button");
                        rejectButton.type = "button";
                        rejectButton.textContent = "✕ Reject";
                        rejectButton.className = "btn-danger";
                        rejectButton.style.marginLeft = "6px";
                        rejectButton.style.fontSize = ".8rem";
                        rejectButton.style.padding = "8px 14px";

                        rejectButton.addEventListener("click", function () {
                            if (confirm("Are you sure you want to reject this application?")) {
                                updateApplicationStatus(application.applicationId, "Rejected");
                            }
                        });

                        actionsCell.appendChild(approveButton);
                        actionsCell.appendChild(rejectButton);
                    } else {
                        const badge = document.createElement("span");
                        badge.textContent = "✓ Reviewed";
                        badge.style.color = "#636e72";
                        badge.style.fontWeight = "600";
                        badge.style.fontSize = ".82rem";
                        actionsCell.appendChild(badge);
                    }

                    row.appendChild(actionsCell);
                    adminApplicationsBody.appendChild(row);
                });
            }

            function updateApplicationStatus(applicationId, newStatus) {
                try {
                    const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                    const application = applications.find(function (item) {
                        return item.applicationId === applicationId;
                    });

                    if (!application || application.status !== "Pending") {
                        showMessage("admin-applications-message", "This application has already been reviewed.", false);
                        renderAdminApplications();
                        return;
                    }

                    application.status = newStatus;
                    application.reviewedAt = new Date().toISOString();
                    localStorage.setItem("passportal_applications", JSON.stringify(applications));
                    showMessage("admin-applications-message", "Application " + applicationId + " marked " + newStatus + ".", true);
                    showToast("Application " + newStatus.toLowerCase() + "! " + (newStatus === "Approved" ? "✅" : "❌"), newStatus === "Approved");
                    renderAdminApplications();

                } catch (error) {
                    console.error("Application review error:", error);
                    showMessage("admin-applications-message", "Could not update the application status.", false);
                }
            }

            try {
                renderAdminApplications();
            } catch (error) {
                console.error("Admin applications error:", error);
                showMessage("admin-applications-message", "Unable to load applications.", false);
            }
        }
    }


    // =====================================
    // 8. STUDENT DASHBOARD STATISTICS
    // =====================================

    const totalApplicationsElement = document.getElementById("total-applications");

    if (totalApplicationsElement) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "../login.html";
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


    // =====================================
    // 9. ADMIN DASHBOARD STATISTICS
    // =====================================

    const adminTotalStudents = document.getElementById("admin-total-students");

    if (adminTotalStudents) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") {
                window.location.href = "../login.html";
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


    // =====================================
    // 10. ADMIN MANAGE STUDENTS
    // =====================================

    const adminStudentsBody = document.getElementById("admin-students-table-body");

    if (adminStudentsBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") {
                window.location.href = "../login.html";
            } else {
                const students = JSON.parse(localStorage.getItem("passportal_students") || "[]");
                if (!Array.isArray(students)) throw new Error("Invalid student data.");

                adminStudentsBody.replaceChildren();

                if (students.length === 0) {
                    const row = document.createElement("tr");
                    const cell = document.createElement("td");
                    cell.colSpan = 7;
                    cell.textContent = "No students have registered yet.";
                    cell.style.textAlign = "center";
                    cell.style.padding = "40px";
                    row.appendChild(cell);
                    adminStudentsBody.appendChild(row);
                } else {
                    students.forEach(function (student, index) {
                        const row = document.createElement("tr");
                        row.style.animation = "slideUp 0.3s ease " + (index * 0.04) + "s both";

                        const values = [
                            student.studentId,
                            student.fullName,
                            student.email,
                            student.phone,
                            student.course,
                            student.year,
                            student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"
                        ];

                        values.forEach(function (value) {
                            const cell = document.createElement("td");
                            cell.textContent = String(value ?? "");
                            row.appendChild(cell);
                        });

                        adminStudentsBody.appendChild(row);
                    });
                }

                showMessage("admin-students-message", students.length + " registered student(s) found.", true);
            }
        } catch (error) {
            console.error("Admin students page error:", error);
            adminStudentsBody.replaceChildren();
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "Unable to load student records.";
            row.appendChild(cell);
            adminStudentsBody.appendChild(row);
        }
    }


    // =====================================
    // 11. ADMIN MANAGE ROUTES
    // =====================================

    const adminRoutesBody = document.getElementById("admin-routes-table-body");

    if (adminRoutesBody) {
        const routeForm = document.getElementById("admin-route-form");

        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") {
                window.location.href = "../login.html";
            } else {
                const defaultRoutes = [
                    { id: "R001", name: "Phagwara", stops: "Demo pickup stops", fare: 500 },
                    { id: "R002", name: "Jalandhar", stops: "Demo pickup stops", fare: 1000 },
                    { id: "R003", name: "Hoshiarpur", stops: "Demo pickup stops", fare: 1500 },
                    { id: "R004", name: "Nakodar", stops: "Demo pickup stops", fare: 800 }
                ];

                function getRoutes() {
                    const saved = localStorage.getItem("passportal_routes");
                    if (saved === null) {
                        localStorage.setItem("passportal_routes", JSON.stringify(defaultRoutes));
                        return defaultRoutes;
                    }
                    const routes = JSON.parse(saved);
                    if (!Array.isArray(routes)) throw new Error("Invalid route data.");
                    return routes;
                }

                function renderRoutes() {
                    const routes = getRoutes();
                    adminRoutesBody.replaceChildren();

                    if (routes.length === 0) {
                        const row = document.createElement("tr");
                        const cell = document.createElement("td");
                        cell.colSpan = 5;
                        cell.textContent = "No routes available.";
                        cell.style.textAlign = "center";
                        cell.style.padding = "40px";
                        row.appendChild(cell);
                        adminRoutesBody.appendChild(row);
                        return;
                    }

                    routes.forEach(function (route, index) {
                        const row = document.createElement("tr");
                        row.style.animation = "slideUp 0.3s ease " + (index * 0.05) + "s both";

                        [route.id, route.name, route.stops, "₹" + route.fare].forEach(function (value) {
                            const cell = document.createElement("td");
                            cell.textContent = String(value);
                            row.appendChild(cell);
                        });

                        const actionCell = document.createElement("td");
                        const deleteButton = document.createElement("button");
                        deleteButton.type = "button";
                        deleteButton.textContent = "🗑️ Delete";
                        deleteButton.className = "btn-danger";
                        deleteButton.style.fontSize = ".8rem";
                        deleteButton.style.padding = "8px 14px";

                        deleteButton.addEventListener("click", function () {
                            if (confirm("Delete route " + route.id + " (" + route.name + ")?")) {
                                const updatedRoutes = getRoutes().filter(function (item) {
                                    return item.id !== route.id;
                                });
                                localStorage.setItem("passportal_routes", JSON.stringify(updatedRoutes));
                                showMessage("admin-routes-message", "Route " + route.id + " deleted.", true);
                                showToast("Route deleted.", true);
                                renderRoutes();
                            }
                        });

                        actionCell.appendChild(deleteButton);
                        row.appendChild(actionCell);
                        adminRoutesBody.appendChild(row);
                    });
                }

                routeForm.addEventListener("submit", function (event) {
                    event.preventDefault();

                    const id = document.getElementById("new-route-id").value.trim().toUpperCase();
                    const name = document.getElementById("new-route-name").value.trim();
                    const stops = document.getElementById("new-route-stops").value.trim();
                    const fare = Number(document.getElementById("new-route-fare").value);

                    try {
                        const routes = getRoutes();

                        if (routes.some(function (route) { return route.id.toUpperCase() === id; })) {
                            showMessage("admin-routes-message", "That route ID already exists.", false);
                            showToast("Duplicate route ID!", false);
                            return;
                        }

                        if (!Number.isFinite(fare) || fare < 0) {
                            showMessage("admin-routes-message", "Enter a valid non-negative fare.", false);
                            return;
                        }

                        routes.push({ id: id, name: name, stops: stops, fare: fare });
                        localStorage.setItem("passportal_routes", JSON.stringify(routes));
                        routeForm.reset();
                        showMessage("admin-routes-message", "Route added successfully.", true);
                        showToast("New route added! 🛣️", true);
                        renderRoutes();

                    } catch (error) {
                        console.error("Route save error:", error);
                        showMessage("admin-routes-message", "Could not save the route.", false);
                    }
                });

                renderRoutes();
            }
        } catch (error) {
            console.error("Admin routes page error:", error);
            showMessage("admin-routes-message", "Unable to load routes.", false);
        }
    }


    // =====================================
    // 12. PUBLIC ROUTES PAGE
    // =====================================

    const publicRoutesBody = document.getElementById("public-routes-table-body");

    if (publicRoutesBody) {
        try {
            const defaultRoutes = [
                { id: "R001", name: "Phagwara", stops: "Main Market → Railway Station → Bus Stand → Campus Gate", fare: 500 },
                { id: "R002", name: "Jalandhar", stops: "City Centre → Bypass → Highway → Campus Gate", fare: 1000 },
                { id: "R003", name: "Hoshiarpur", stops: "Bus Stand → Garhshankar → Phagwara Bypass → Campus Gate", fare: 1500 },
                { id: "R004", name: "Nakodar", stops: "Main Chowk → Highway → Phagwara → Campus Gate", fare: 800 }
            ];

            const stored = localStorage.getItem("passportal_routes");
            const routes = stored ? JSON.parse(stored) : defaultRoutes;

            if (!stored) localStorage.setItem("passportal_routes", JSON.stringify(defaultRoutes));

            publicRoutesBody.replaceChildren();

            if (routes.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 4;
                cell.textContent = "No routes available at this time.";
                cell.style.textAlign = "center";
                cell.style.padding = "40px";
                row.appendChild(cell);
                publicRoutesBody.appendChild(row);
            } else {
                routes.forEach(function (route, index) {
                    const row = document.createElement("tr");
                    row.style.animation = "slideUp 0.4s ease " + (index * 0.08) + "s both";

                    [route.id, route.name, route.stops, "₹" + route.fare + "/month"].forEach(function (value) {
                        const cell = document.createElement("td");
                        cell.textContent = value;
                        row.appendChild(cell);
                    });

                    publicRoutesBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Public routes error:", error);
        }

        // Search/filter functionality
        const searchInput = document.getElementById("route-search");
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                const query = searchInput.value.toLowerCase();
                const rows = publicRoutesBody.querySelectorAll("tr");
                rows.forEach(function (row) {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? "" : "none";
                });
            });
        }
    }


    // =====================================
    // 13. PASS VALIDATION
    // =====================================

    const validationForm = document.getElementById("validation-form");

    if (validationForm) {
        validationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const passId = document.getElementById("validate-pass-id").value.trim().toUpperCase();
            const resultDiv = document.getElementById("validation-result");

            if (!passId) {
                showMessage("validation-message", "Please enter a pass/application ID.", false);
                return;
            }

            try {
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                const found = applications.find(function (a) {
                    return a.applicationId.toUpperCase() === passId;
                });

                if (!found) {
                    if (resultDiv) {
                        resultDiv.innerHTML = '<div class="message-box message-error">❌ No application found with ID: ' + passId + '</div>';
                    }
                    showToast("Pass not found.", false);
                    return;
                }

                let statusColor = "#fdcb6e";
                let statusIcon = "⏳";
                if (found.status === "Approved") { statusColor = "#00b894"; statusIcon = "✅"; }
                else if (found.status === "Rejected") { statusColor = "#ff7675"; statusIcon = "❌"; }

                if (resultDiv) {
                    resultDiv.innerHTML =
                        '<div style="padding: 24px; border-radius: 16px; background: white; border: 2px solid ' + statusColor + '; margin-top: 16px;">' +
                            '<h3 style="margin: 0 0 16px; color: ' + statusColor + ';">' + statusIcon + ' Pass ' + found.status + '</h3>' +
                            '<table style="margin: 0;">' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Application ID</td><td>' + found.applicationId + '</td></tr>' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Student</td><td>' + found.studentName + '</td></tr>' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Route</td><td>' + (found.routeName || found.route) + '</td></tr>' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Pass Type</td><td>' + found.passType + '</td></tr>' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Duration</td><td>' + found.durationMonths + ' month(s)</td></tr>' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Start Date</td><td>' + found.startDate + '</td></tr>' +
                                '<tr><td style="font-weight: 700; padding: 8px 16px 8px 0;">Fee</td><td>₹' + found.fee + '</td></tr>' +
                            '</table>' +
                        '</div>';
                }

                showToast("Pass found! Status: " + found.status, found.status === "Approved");

            } catch (error) {
                console.error("Validation error:", error);
                showMessage("validation-message", "Unable to validate. Please try again.", false);
            }
        });
    }


    // =====================================
    // 14. STUDENT PROFILE
    // =====================================

    const profileName = document.getElementById("profile-full-name");

    if (profileName) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "../login.html";
            } else {
                const students = getStudents();
                const student = students.find(function (s) { return s.email === session.email; });

                if (!student) {
                    window.location.href = "../login.html";
                    return;
                }

                const profileFields = {
                    "profile-full-name": student.fullName,
                    "profile-student-id": student.studentId,
                    "profile-email": student.email,
                    "profile-phone": student.phone,
                    "profile-course": student.course,
                    "profile-year": student.year,
                    "profile-joined": student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"
                };

                Object.keys(profileFields).forEach(function (id) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = profileFields[id];
                });

                // Initials avatar
                const avatar = document.getElementById("profile-avatar");
                if (avatar) {
                    const initials = student.fullName.split(" ").map(function (n) { return n[0]; }).join("").substring(0, 2).toUpperCase();
                    avatar.textContent = initials;
                }
            }
        } catch (error) {
            console.error("Profile error:", error);
        }
    }


    // =====================================
    // 15. STUDENT PAYMENTS
    // =====================================

    const paymentsBody = document.getElementById("student-payments-table-body");

    if (paymentsBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "../login.html";
            } else {
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                const myApps = applications.filter(function (a) { return a.studentEmail === session.email; });

                paymentsBody.replaceChildren();

                if (myApps.length === 0) {
                    const row = document.createElement("tr");
                    const cell = document.createElement("td");
                    cell.colSpan = 5;
                    cell.textContent = "No payment records found.";
                    cell.style.textAlign = "center";
                    cell.style.padding = "40px";
                    row.appendChild(cell);
                    paymentsBody.appendChild(row);
                } else {
                    myApps.slice().reverse().forEach(function (app) {
                        const row = document.createElement("tr");
                        var payStatus = app.status === "Approved" ? "Paid" : (app.status === "Rejected" ? "Refunded" : "Pending");

                        [app.applicationId, "₹" + app.fee, app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "N/A", app.passType, payStatus].forEach(function (val, i) {
                            const cell = document.createElement("td");
                            if (i === 4) {
                                const badge = document.createElement("span");
                                badge.textContent = val;
                                badge.style.padding = "4px 12px";
                                badge.style.borderRadius = "20px";
                                badge.style.fontSize = ".78rem";
                                badge.style.fontWeight = "700";
                                if (val === "Paid") { badge.style.background = "#e8faf4"; badge.style.color = "#00b894"; }
                                else if (val === "Refunded") { badge.style.background = "#fff0f0"; badge.style.color = "#ff7675"; }
                                else { badge.style.background = "#fffbeb"; badge.style.color = "#d99327"; }
                                cell.appendChild(badge);
                            } else {
                                cell.textContent = val;
                            }
                            row.appendChild(cell);
                        });

                        paymentsBody.appendChild(row);
                    });
                }
            }
        } catch (error) {
            console.error("Payments error:", error);
        }
    }


    // =====================================
    // 16. RENEW PASS
    // =====================================

    const renewForm = document.getElementById("renew-pass-form");

    if (renewForm) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "../login.html";
            }

            const renewSelect = document.getElementById("renew-pass-select");
            if (renewSelect) {
                const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                const myApproved = applications.filter(function (a) {
                    return a.studentEmail === session.email && a.status === "Approved";
                });

                renewSelect.replaceChildren();
                const placeholder = document.createElement("option");
                placeholder.value = "";
                placeholder.textContent = myApproved.length ? "Select an approved pass" : "No approved passes found";
                renewSelect.appendChild(placeholder);

                myApproved.forEach(function (app) {
                    const option = document.createElement("option");
                    option.value = app.applicationId;
                    option.textContent = app.applicationId + " — " + (app.routeName || app.route) + " (" + app.passType + ")";
                    renewSelect.appendChild(option);
                });
            }

            renewForm.addEventListener("submit", function (e) {
                e.preventDefault();
                const selectedId = renewSelect ? renewSelect.value : "";
                const renewDuration = document.getElementById("renew-duration");
                const duration = renewDuration ? Number(renewDuration.value) : 1;

                if (!selectedId) {
                    showMessage("renew-message", "Please select a pass to renew.", false);
                    return;
                }

                try {
                    const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
                    const original = applications.find(function (a) { return a.applicationId === selectedId; });

                    if (!original) {
                        showMessage("renew-message", "Original application not found.", false);
                        return;
                    }

                    const routes = JSON.parse(localStorage.getItem("passportal_routes") || "[]");
                    const route = routes.find(function (r) { return r.id === original.route; });
                    const fee = route ? route.fare * duration : original.fee;

                    const renewal = {
                        applicationId: "RNW" + Date.now(),
                        studentEmail: session.email,
                        studentName: session.fullName,
                        route: original.route,
                        routeName: original.routeName,
                        passType: original.passType,
                        durationMonths: duration,
                        startDate: new Date().toISOString().split("T")[0],
                        fee: fee,
                        status: "Pending",
                        submittedAt: new Date().toISOString(),
                        isRenewal: true,
                        originalId: selectedId
                    };

                    applications.push(renewal);
                    localStorage.setItem("passportal_applications", JSON.stringify(applications));
                    showMessage("renew-message", "Renewal submitted! ID: " + renewal.applicationId, true);
                    showToast("Pass renewal submitted! 🔄", true);
                    renewForm.reset();

                } catch (error) {
                    showMessage("renew-message", "Could not submit renewal.", false);
                    console.error(error);
                }
            });

        } catch (error) {
            console.error("Renew pass error:", error);
        }
    }


    // =====================================
    // 17. ADMIN PASSES
    // =====================================

    const adminPassesBody = document.getElementById("admin-passes-table-body");

    if (adminPassesBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") { window.location.href = "../login.html"; return; }

            const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");
            const approved = applications.filter(function (a) { return a.status === "Approved"; });

            adminPassesBody.replaceChildren();

            if (approved.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 7;
                cell.textContent = "No approved passes yet.";
                cell.style.textAlign = "center";
                cell.style.padding = "40px";
                row.appendChild(cell);
                adminPassesBody.appendChild(row);
            } else {
                approved.forEach(function (app) {
                    const row = document.createElement("tr");
                    [app.applicationId, app.studentName, app.routeName || app.route, app.passType, app.startDate, app.durationMonths + " month(s)", "₹" + app.fee].forEach(function (val) {
                        const cell = document.createElement("td");
                        cell.textContent = val;
                        row.appendChild(cell);
                    });
                    adminPassesBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Admin passes error:", error);
        }
    }


    // =====================================
    // 18. ADMIN PAYMENTS
    // =====================================

    const adminPaymentsBody = document.getElementById("admin-payments-table-body");

    if (adminPaymentsBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") { window.location.href = "../login.html"; return; }

            const applications = JSON.parse(localStorage.getItem("passportal_applications") || "[]");

            adminPaymentsBody.replaceChildren();

            if (applications.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 6;
                cell.textContent = "No payment records.";
                cell.style.textAlign = "center";
                cell.style.padding = "40px";
                row.appendChild(cell);
                adminPaymentsBody.appendChild(row);
            } else {
                var totalRevenue = 0;
                applications.forEach(function (app) {
                    const row = document.createElement("tr");
                    var payStatus = app.status === "Approved" ? "Paid" : (app.status === "Rejected" ? "Refunded" : "Pending");
                    if (app.status === "Approved") totalRevenue += app.fee;

                    [app.applicationId, app.studentName, "₹" + app.fee, app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "N/A", app.passType, payStatus].forEach(function (val, i) {
                        const cell = document.createElement("td");
                        if (i === 5) {
                            const badge = document.createElement("span");
                            badge.textContent = val;
                            badge.style.padding = "4px 12px";
                            badge.style.borderRadius = "20px";
                            badge.style.fontSize = ".78rem";
                            badge.style.fontWeight = "700";
                            if (val === "Paid") { badge.style.background = "#e8faf4"; badge.style.color = "#00b894"; }
                            else if (val === "Refunded") { badge.style.background = "#fff0f0"; badge.style.color = "#ff7675"; }
                            else { badge.style.background = "#fffbeb"; badge.style.color = "#d99327"; }
                            cell.appendChild(badge);
                        } else {
                            cell.textContent = val;
                        }
                        row.appendChild(cell);
                    });

                    adminPaymentsBody.appendChild(row);
                });

                const revenueEl = document.getElementById("admin-total-revenue");
                if (revenueEl) revenueEl.textContent = "₹" + totalRevenue;
            }
        } catch (error) {
            console.error("Admin payments error:", error);
        }
    }


});
