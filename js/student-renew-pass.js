/* PassPortal — pages/student/renew-pass script (split from script.js) */
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

    // =====================================
    // 16. RENEW PASS
    // =====================================

    const renewForm = document.getElementById("renew-pass-form");

    if (renewForm) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "login.html";
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

});
