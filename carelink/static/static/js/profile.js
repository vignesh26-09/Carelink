/* ==========================================
   Profile Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeProfile();

});

/* ==========================================
   Initialize
========================================== */

async function initializeProfile() {

    Auth.requireLogin();

    await loadProfile();

    const form = document.getElementById("profileForm");

    if (form) {

        form.addEventListener("submit", updateProfile);

    }

}

/* ==========================================
   Load Profile
========================================== */

async function loadProfile() {

    Loader.show("Loading Profile...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.PROFILE.GET

        );

        populateProfile(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load profile."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Populate Profile
========================================== */

function populateProfile(user) {

    setValue("fullName", user.fullName);

    setValue("email", user.email);

    setValue("phone", user.phone);

    setValue("address", user.address);

    setValue("dob", user.dob);

    setValue("role", user.role);

}

/* ==========================================
   Update Profile
========================================== */

async function updateProfile(event) {

    event.preventDefault();

    const profile = {

        fullName:

            document.getElementById("fullName")

            .value

            .trim(),

        phone:

            document.getElementById("phone")

            .value

            .trim(),

        address:

            document.getElementById("address")

            .value

            .trim(),

        dob:

            document.getElementById("dob")

            .value

    };

    if (!Validator.required(profile.fullName)) {

        Notification.warning(

            "Full Name is required."

        );

        return;

    }

    if (

        profile.phone &&

        !Validator.phone(profile.phone)

    ) {

        Notification.warning(

            "Invalid phone number."

        );

        return;

    }

    Loader.show("Updating Profile...");

    try {

        await ApiService.put(

            ENDPOINTS.PROFILE.UPDATE,

            profile

        );

        Notification.success(

            "Profile Updated Successfully."

        );

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to update profile."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Upload Profile Image
========================================== */

function uploadImage(input) {

    if (!input.files.length) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        const image =

            document.getElementById("profileImage");

        if (image) {

            image.src = event.target.result;

        }

    };

    reader.readAsDataURL(input.files[0]);

}

/* ==========================================
   Reset Form
========================================== */

function resetProfile() {

    loadProfile();

}

/* ==========================================
   Helper
========================================== */

function setValue(id, value) {

    const element =

        document.getElementById(id);

    if (element) {

        element.value = value || "";

    }

}