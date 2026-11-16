/* PassPortal — pages/admin/applications script (split from script.js) */
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
    // 7. ADMIN APPLICATION REVIEW
    // =====================================

    const adminApplicationsBody = document.getElementById("admin-applications-table-body");

    if (adminApplicationsBody) {
        const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
        if (!session || session.role !== "admin") {
            window.location.href = "login.html";
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

});
