/* ==========================================
   Login Page
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();

});

/* ==========================================
   Initialize
========================================== */

function initializeLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", login);

}

/* ==========================================
   Login
========================================== */

async function login(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    if (!Validator.email(email)) {

        Notification.error("Please enter a valid email.");

        return;

    }

    if (!Validator.password(password)) {

        Notification.error("Password must contain at least 8 characters.");

        return;

    }

    Loader.show("Signing in...");

    try {

        const response = await Auth.login(email, password);

        Notification.success("Login Successful");

        setTimeout(() => {

            Router.dashboard();

        }, 1000);

    }

    catch (error) {

        const message =
            error.response?.data?.error ||
            "Invalid email or password.";

        Notification.error(message);

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Show Password
========================================== */

function togglePassword() {

    const password = document.getElementById("password");

    password.type =
        password.type === "password"
        ? "text"
        : "password";

}