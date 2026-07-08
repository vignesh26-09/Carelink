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

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) return;

    registerForm.addEventListener(

        "submit",

        register

    );

}

/* ==========================================
   Register
========================================== */

async function register(event) {

    event.preventDefault();

    const user = {

        fullName:
            document.getElementById("fullName").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        password:
            document.getElementById("password").value.trim(),

        confirmPassword:
            document.getElementById("confirmPassword").value.trim(),

        bloodGroup:
            document.getElementById("bloodGroup").value,

        emergencyContact:
            document.getElementById("emergencyContact").value.trim()

    };

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

    if (!Validator.phone(user.emergencyContact)) {

        Notification.error("Enter a valid emergency contact number.");

        return;

    }

    Loader.show("Creating Account...");

    try {

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

    }

    catch (error) {

        const message =
            error.response?.data?.error ||
            "Registration failed.";

        Notification.error(message);

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Show Password
========================================== */

function togglePassword(id) {

    const input = document.getElementById(id);

    input.type =
        input.type === "password"
        ? "text"
        : "password";

}