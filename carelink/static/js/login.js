const form = document.getElementById("loginForm");

form.addEventListener("submit", login);

async function login(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {

        showError("Please fill all fields.");

        return;

    }

    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,

                password

            })

        });

        if (!response.ok) {

            throw new Error("Invalid Email or Password");

        }

        const data = await response.json();

        localStorage.setItem("token", data.token);

        localStorage.setItem("role", data.role);

        localStorage.setItem("email", data.email);

        redirectUser(data.role);

    }

    catch(error){

        showError(error.message);

    }

}

function redirectUser(role){

    switch(role){

        case "PATIENT":

            window.location.href="/patient-dashboard";

            break;

        case "DOCTOR":

            window.location.href="/doctor-dashboard";

            break;

        case "ADMIN":

            window.location.href="/admin-dashboard";

            break;

        default:

            window.location.href="/";

    }

}

function showError(message){

    const errorDiv=document.getElementById("errorMessage");

    errorDiv.classList.remove("d-none");

    errorDiv.innerText=message;

}