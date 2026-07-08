import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import api from "../../services/api";
import consultationService from "../../services/consultationService";

import {
    getMyAppointments,
    cancelAppointment,
} from "../../store/slices/appointmentSlice";

import EmptyState from "../common/EmptyState";

function DoctorConsultations() {
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.appointments);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState("");
    const [medicationsJson, setMedicationsJson] = useState("");

    useEffect(() => {
        dispatch(getMyAppointments());
    }, [dispatch]);

    const handleApprove = async (id) => {
        try {
            await api.post(`/consultations/${id}/approve`);
            dispatch(getMyAppointments());
        } catch (error) {
            alert(error.response?.data || "Approval failed");
        }
    };

    const handleCancel = (id) => {
        if (window.confirm("Cancel this appointment?")) {
            dispatch(cancelAppointment(id));
        }
    };

    const handleStart = async (id) => {
        try {
            await consultationService.startConsultation(id);
            dispatch(getMyAppointments());
        } catch (error) {
            alert(error.response?.data || "Unable to start consultation");
        }
    };

    const handleFinalize = async (e) => {
        e.preventDefault();

        try {
            await consultationService.finalizeConsultation(
                selectedAppointment.id,
                {
                    diagnosis,
                    medicationsJson,
                }
            );

            alert("Consultation finalized successfully");

            setSelectedAppointment(null);
            setDiagnosis("");
            setMedicationsJson("");

            dispatch(getMyAppointments());
        } catch (error) {
            alert(error.response?.data || "Finalization failed");
        }
    };

    return (
        <div>

            <h2>Consultation Management</h2>

            {items.length === 0 ? (
                <EmptyState message="No appointments scheduled." />
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>
                                    {appointment.patient.fullName}
                                </td>

                                <td>
                                    {appointment.status}
                                </td>

                                <td>

                                    {appointment.status === "PENDING" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleApprove(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleCancel(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    {appointment.status === "CONFIRMED" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleStart(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Start Session
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleCancel(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    {appointment.status === "IN_PROGRESS" && (
                                        <button
                                            onClick={() =>
                                                setSelectedAppointment(
                                                    appointment
                                                )
                                            }
                                        >
                                            Finalize
                                        </button>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {selectedAppointment && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>Finalize Consultation</h3>

                        <form onSubmit={handleFinalize}>

                            <div>
                                <label htmlFor="diagnosis">
                                    Diagnosis
                                </label>

                                <textarea
                                    id="diagnosis"
                                    value={diagnosis}
                                    onChange={(e) =>
                                        setDiagnosis(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label htmlFor="medications">
                                    Medications (JSON/Text)
                                </label>

                                <textarea
                                    id="medications"
                                    value={medicationsJson}
                                    onChange={(e) =>
                                        setMedicationsJson(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <button type="submit">
                                Finalize Consultation
                            </button>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default DoctorConsultations;