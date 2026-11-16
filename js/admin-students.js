/* PassPortal — pages/admin/students script (split from script.js) */
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
    // 10. ADMIN MANAGE STUDENTS
    // =====================================

    const adminStudentsBody = document.getElementById("admin-students-table-body");

    if (adminStudentsBody) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "admin") {
                window.location.href = "login.html";
            } else {
                const students = JSON.parse(localStorage.getItem("passportal_students") || "[]");
                if (!Array.isArray(students)) throw new Error("Invalid student data.");

                adminStudentsBody.replaceChildren();

                if (students.length === 0) {
                    const row = document.createElement("tr");
                    const cell = document.createElement("td");
                    cell.colSpan = 7;
                    cell.textContent = "No students have registered yet.";
                    cell.style.textAlign = "center";
                    cell.style.padding = "40px";
                    row.appendChild(cell);
                    adminStudentsBody.appendChild(row);
                } else {
                    students.forEach(function (student, index) {
                        const row = document.createElement("tr");
                        row.style.animation = "slideUp 0.3s ease " + (index * 0.04) + "s both";

                        const values = [
                            student.studentId,
                            student.fullName,
                            student.email,
                            student.phone,
                            student.course,
                            student.year,
                            student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"
                        ];

                        values.forEach(function (value) {
                            const cell = document.createElement("td");
                            cell.textContent = String(value ?? "");
                            row.appendChild(cell);
                        });

                        adminStudentsBody.appendChild(row);
                    });
                }

                showMessage("admin-students-message", students.length + " registered student(s) found.", true);
            }
        } catch (error) {
            console.error("Admin students page error:", error);
            adminStudentsBody.replaceChildren();
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "Unable to load student records.";
            row.appendChild(cell);
            adminStudentsBody.appendChild(row);
        }
    }

});
