/* ==========================================
   Register Page
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeRegister();
});

/* ==========================================
   Initialize
========================================== */

function initializeRegister() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", register);
}

/* ==========================================
   Register Form Action
========================================== */

async function register(event) {
    event.preventDefault();

    // Mapping values to exactly match RegisterPatientDto requirements
    const user = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
        confirmPassword: document.getElementById("confirmPassword").value.trim(),
        bloodGroup: document.getElementById("bloodGroup").value,
        emergencyContact: document.getElementById("emergencyContact").value.trim()
    };

    // Client-side Validations
    if (!Validator.required(user.fullName)) {
        Notification.error("Full Name is required.");
        return;
    }

    if (!Validator.email(user.email)) {
        Notification.error("Invalid Email.");
        return;
    }

    if (!Validator.password(user.password)) {
        Notification.error("Password must contain at least 8 characters.");
        return;
    }

    if (!Validator.match(user.password, user.confirmPassword)) {
        Notification.error("Passwords do not match.");
        return;
    }

    if (!Validator.required(user.bloodGroup)) {
        Notification.error("Blood Group selection is required.");
        return;
    }

    if (!Validator.phone(user.emergencyContact)) {
        Notification.error("Enter a valid emergency contact number.");
        return;
    }

    Loader.show("Creating Account...");

    try {
        // Axios/fetch payload structure sent to backend 
        await Auth.register({
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            bloodGroup: user.bloodGroup,
            emergencyContact: user.emergencyContact
        });

        Notification.success("Registration Successful");
        
        setTimeout(() => {
            Router.login();
        }, 1500);

    } catch (error) {
       console.error("The hidden error is:", error);

        const message = error.response?.data?.error || "Registration failed.";
        Notification.error(message);
    } finally {
        Loader.hide();
    }
}

/* ==========================================
   Utility: Show/Hide Password Toggle
========================================== */

function togglePassword(id) {
    const input = document.getElementById(id);
    if (!input) return;
    
    input.type = input.type === "password" ? "text" : "password";
}