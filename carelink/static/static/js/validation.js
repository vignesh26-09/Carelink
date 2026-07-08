/* ==========================================
   Form Validation
========================================== */

const Validator = {

    /* Required Field */

    required(value) {

        return value !== null &&
               value !== undefined &&
               value.toString().trim() !== "";

    },

    /* Email */

    email(email) {

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return pattern.test(email);

    },

    /* Password */

    password(password) {

        return password.length >= 8;

    },

    /* Phone Number */

    phone(phone) {

        return /^[0-9]{10}$/.test(phone);

    },

    /* Name */

    name(name) {

        return /^[A-Za-z ]+$/.test(name);

    },

    /* Number */

    number(value) {

        return !isNaN(value);

    },

    /* Date */

    date(date) {

        return !isNaN(Date.parse(date));

    },

    /* Password Match */

    match(password, confirmPassword) {

        return password === confirmPassword;

    },

    /* Form Validation */

    validateForm(form) {

        const inputs = form.querySelectorAll("[required]");

        let valid = true;

        inputs.forEach(input => {

            if (!this.required(input.value)) {

                input.classList.add("is-invalid");

                valid = false;

            }

            else {

                input.classList.remove("is-invalid");

                input.classList.add("is-valid");

            }

        });

        return valid;

    },

    /* Reset Validation */

    reset(form) {

        form.querySelectorAll(".form-control").forEach(input => {

            input.classList.remove("is-valid");

            input.classList.remove("is-invalid");

        });

    }

};