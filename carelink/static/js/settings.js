/* ==========================================
   Settings Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeSettings();

});

/* ==========================================
   Initialize
========================================== */

async function initializeSettings() {

    Auth.requireLogin();

    await loadSettings();

    const passwordForm =

        document.getElementById("passwordForm");

    if (passwordForm) {

        passwordForm.addEventListener(

            "submit",

            changePassword

        );

    }

}

/* ==========================================
   Load Settings
========================================== */

async function loadSettings() {

    Loader.show("Loading Settings...");

    try {

        const response = await ApiService.get(

            ENDPOINTS.SETTINGS.GET

        );

        populateSettings(response.data);

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to load settings."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Populate Settings
========================================== */

function populateSettings(settings) {

    setChecked(

        "emailNotification",

        settings.emailNotification

    );

    setChecked(

        "appointmentReminder",

        settings.appointmentReminder

    );

    setChecked(

        "systemNotification",

        settings.systemNotification

    );

}

/* ==========================================
   Save Settings
========================================== */

async function saveSettings() {

    const settings = {

        emailNotification:

            getChecked("emailNotification"),

        appointmentReminder:

            getChecked("appointmentReminder"),

        systemNotification:

            getChecked("systemNotification")

    };

    Loader.show("Saving Settings...");

    try {

        await ApiService.put(

            ENDPOINTS.SETTINGS.UPDATE,

            settings

        );

        Notification.success(

            "Settings Saved Successfully."

        );

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to save settings."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Change Password
========================================== */

async function changePassword(event) {

    event.preventDefault();

    const currentPassword =

        document.getElementById("currentPassword")

        .value;

    const newPassword =

        document.getElementById("newPassword")

        .value;

    const confirmPassword =

        document.getElementById("confirmPassword")

        .value;

    if (

        !Validator.password(newPassword)

    ) {

        Notification.warning(

            "Password must contain at least 8 characters."

        );

        return;

    }

    if (

        !Validator.match(

            newPassword,

            confirmPassword

        )

    ) {

        Notification.warning(

            "Passwords do not match."

        );

        return;

    }

    Loader.show("Updating Password...");

    try {

        await ApiService.put(

            ENDPOINTS.AUTH.CHANGE_PASSWORD,

            {

                currentPassword,

                newPassword

            }

        );

        Notification.success(

            "Password Updated Successfully."

        );

        document

            .getElementById("passwordForm")

            .reset();

    }

    catch (error) {

        Notification.error(

            error.response?.data?.error ||

            "Unable to change password."

        );

    }

    finally {

        Loader.hide();

    }

}

/* ==========================================
   Reset Settings
========================================== */

function resetSettings() {

    loadSettings();

}

/* ==========================================
   Logout
========================================== */

function logout() {

    Auth.logout();

}

/* ==========================================
   Helpers
========================================== */

function getChecked(id) {

    const element =

        document.getElementById(id);

    return element

        ? element.checked

        : false;

}

function setChecked(id, value) {

    const element =

        document.getElementById(id);

    if (element) {

        element.checked = value;

    }

}