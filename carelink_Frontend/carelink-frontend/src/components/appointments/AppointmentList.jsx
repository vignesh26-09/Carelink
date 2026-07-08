import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    getMyAppointments,
    getAllAppointments,
    cancelAppointment,
} from "../../store/slices/appointmentSlice";

import SearchFilterBar from "../common/SearchFilterBar";

function AppointmentList() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    const {
        items,
        isLoading,
        searchQuery,
        filterStatus,
    } = useSelector((state) => state.appointments);

    useEffect(() => {
        if (user?.role === "CLINIC_ADMIN") {
            dispatch(getAllAppointments());
        } else {
            dispatch(getMyAppointments());
        }
    }, [dispatch, user]);

    const handleCancel = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (confirmed) {
            dispatch(cancelAppointment(id));
        }
    };

    const filteredAppointments = items.filter((appointment) => {
        const matchesSearch =
            appointment.reasonForVisit
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesStatus =
            filterStatus === "ALL" ||
            appointment.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (!isLoading && items.length === 0) {
        return <h3>No appointments found.</h3>;
    }

    return (
        <div>
            <h2>Appointment List</h2>

            <SearchFilterBar
                filterOptions={[
                    "CONFIRMED",
                    "PENDING",
                    "CANCELLED",
                    "COMPLETED",
                ]}
            />

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                            <td>{appointment.id}</td>

                            <td>
                                {appointment.reasonForVisit}
                            </td>

                            <td>{appointment.status}</td>

                            <td>
                                {appointment.status !==
                                    "CANCELLED" &&
                                    appointment.status !==
                                        "COMPLETED" && (
                                        <button
                                            onClick={() =>
                                                handleCancel(
                                                    appointment.id
                                                )
                                            }
                                        >
                                            Cancel
                                        </button>
                                    )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AppointmentList;