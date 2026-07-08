const form = document.getElementById("registerForm");

form.addEventListener("submit", registerPatient);

async function registerPatient(e){

    e.preventDefault();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if(password !== confirmPassword){

        showMessage(
            "Passwords do not match",
            "danger"
        );

        return;

    }

    const patient = {

        firstName:
            document.getElementById("firstName").value,

        lastName:
            document.getElementById("lastName").value,

        email:
            document.getElementById("email").value,

        phone:
            document.getElementById("phone").value,

        dateOfBirth:
            document.getElementById("dob").value,

        gender:
            document.getElementById("gender").value,

        address:
            document.getElementById("address").value,

        password:
            password

    };

    try{

        const response = await fetch("/api/auth/register",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(patient)

        });

        if(!response.ok){

            throw new Error("Registration Failed");

        }

        showMessage(

            "Registration Successful. Redirecting to Login...",

            "success"

        );

        setTimeout(()=>{

            window.location.href="login.html";

        },2000);

    }

    catch(error){

        showMessage(error.message,"danger");

    }

}

function showMessage(message,type){

    const div=document.getElementById("message");

    div.className="alert alert-"+type;

    div.innerHTML=message;

    div.classList.remove("d-none");

}