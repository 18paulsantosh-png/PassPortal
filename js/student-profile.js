/* PassPortal — pages/student/profile script (split from script.js) */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("PassPortal JavaScript loaded successfully.");

    // =====================================
    // UTILITIES
    // =====================================

    function getStudents() {
        const savedData = localStorage.getItem("passportal_students");
        const students = JSON.parse(savedData || "[]");
        if (!Array.isArray(students)) throw new Error("Invalid student data.");
        return students;
    }

    // =====================================
    // 14. STUDENT PROFILE
    // =====================================

    const profileName = document.getElementById("profile-full-name");

    if (profileName) {
        try {
            const session = JSON.parse(localStorage.getItem("passportal_session") || "null");
            if (!session || session.role !== "student") {
                window.location.href = "login.html";
            } else {
                const students = getStudents();
                const student = students.find(function (s) { return s.email === session.email; });

                if (!student) {
                    window.location.href = "login.html";
                    return;
                }

                const profileFields = {
                    "profile-full-name": student.fullName,
                    "profile-student-id": student.studentId,
                    "profile-email": student.email,
                    "profile-phone": student.phone,
                    "profile-course": student.course,
                    "profile-year": student.year,
                    "profile-joined": student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"
                };

                Object.keys(profileFields).forEach(function (id) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = profileFields[id];
                });

                // Initials avatar
                const avatar = document.getElementById("profile-avatar");
                if (avatar) {
                    const initials = student.fullName.split(" ").map(function (n) { return n[0]; }).join("").substring(0, 2).toUpperCase();
                    avatar.textContent = initials;
                }
            }
        } catch (error) {
            console.error("Profile error:", error);
        }
    }

});
