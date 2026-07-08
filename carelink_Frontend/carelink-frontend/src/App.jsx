import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Login from "./components/login";
import Register from "./components/register";
import DoctorList from "./components/doctors/DoctorList";
import AppointmentList from "./components/appointments/AppointmentList";
import DoctorConsultation from "./components/doctors/DoctorConsultations";
import DoctorSchedule from "./components/doctors/DoctorSchedule";
import ManageDoctors from "./components/admin/ManageDoctors";
import ManagePatients from "./components/admin/ManagePatients";

function Home() {
    return (
        <>
            <h1>CareLink Healthcare Management System</h1>
            <p>Frontend is running successfully.</p>
        </>
    );
}

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctors" element={<DoctorList />} />
                <Route path="/appointments" element={<AppointmentList />} />
            </Routes>
        </>
    );
}

export default App;