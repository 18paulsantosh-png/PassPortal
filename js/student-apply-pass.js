/* PassPortal — pages/student/apply-pass script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // UTILITIES
    // =====================================

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

});
