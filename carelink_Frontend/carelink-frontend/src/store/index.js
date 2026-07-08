import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import appointmentReducer from "./slices/appointmentSlice";
import doctorReducer from "./slices/doctorSlice";
import scheduleReducer from "./slices/scheduleSlice";
import patientReducer from "./slices/patientSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointments: appointmentReducer,
        doctors: doctorReducer,
        schedule: scheduleReducer,
        patients: patientReducer,
    },
});