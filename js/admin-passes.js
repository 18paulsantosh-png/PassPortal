/* PassPortal — pages/admin/passes script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // 17. ADMIN PASSES
    // =====================================

    const adminPassesBody = document.getElementById("admin-passes-table-body");

    if (adminPassesBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") { window.location.href = "login.html"; return; }

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

});
