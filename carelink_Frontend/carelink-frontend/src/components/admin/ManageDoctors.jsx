import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    getDoctors,
    deleteDoctor,
} from "../../store/slices/doctorSlice";

import EmptyState from "../common/EmptyState";

function ManageDoctors() {
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.doctors);

    useEffect(() => {
        dispatch(getDoctors());
    }, [dispatch]);

    const handleRemove = (id) => {
        if (window.confirm("Are you sure you want to remove this doctor?")) {
            dispatch(deleteDoctor(id));
        }
    };

    return (
        <div>
            <h2>Manage Doctors</h2>

            {items.length === 0 ? (
                <EmptyState message="No doctors found." />
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((doctor) => (
                            <tr key={doctor.id}>
                                <td>{doctor.fullName}</td>
                                <td>{doctor.account.email}</td>
                                <td>{doctor.specialization}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleRemove(doctor.id)
                                        }
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ManageDoctors;