/* PassPortal — pages/admin/payments script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // 18. ADMIN PAYMENTS
    // =====================================

    const adminPaymentsBody = document.getElementById("admin-payments-table-body");

    if (adminPaymentsBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") { window.location.href = "login.html"; return; }

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
