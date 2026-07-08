import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getDoctors } from "../../store/slices/doctorSlice";
import AppointmentForm from "../appointments/AppointmentForm";
import EmptyState from "../common/EmptyState";

function DoctorList() {
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.doctors);

    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        dispatch(getDoctors());
    }, [dispatch]);

    if (items.length === 0) {
        return (
            <EmptyState message="No doctors available at the moment." />
        );
    }

    return (
        <div className="doctor-list">

            {items.map((doctor) => (
                <div
                    key={doctor.id}
                    className="doctor-card"
                >
                    <h3>{doctor.account.email}</h3>

                    <button
                        onClick={() => setSelectedDoctor(doctor)}
                    >
                        Book Appointment
                    </button>
                </div>
            ))}

            {selectedDoctor && (
                <AppointmentForm
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                />
            )}

        </div>
    );
}

export default DoctorList;