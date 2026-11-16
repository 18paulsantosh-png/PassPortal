/* PassPortal — pages/validation script (split from script.js) */
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

});
