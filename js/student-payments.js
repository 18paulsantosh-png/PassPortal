/* PassPortal — pages/student/payments script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // 15. STUDENT PAYMENTS
    // =====================================

    const paymentsBody = document.getElementById("student-payments-table-body");

    if (paymentsBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "login.html";
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

});
