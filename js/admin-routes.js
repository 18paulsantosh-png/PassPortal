/* PassPortal — pages/admin/routes script (split from script.js) */
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
    // 11. ADMIN MANAGE ROUTES
    // =====================================

    const adminRoutesBody = document.getElementById("admin-routes-table-body");

    if (adminRoutesBody) {
        const routeForm = document.getElementById("admin-route-form");

        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") {
                window.location.href = "login.html";
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

});
