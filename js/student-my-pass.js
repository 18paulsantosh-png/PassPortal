/* PassPortal — pages/student/my-pass script (split from script.js) */
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

    // =====================================
    // 6. STUDENT MY PASS PAGE
    // =====================================

    const myPassTableBody = document.getElementById("my-pass-table-body");

    if (myPassTableBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "login.html";
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

});
