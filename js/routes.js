/* PassPortal — pages/routes script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

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

});
