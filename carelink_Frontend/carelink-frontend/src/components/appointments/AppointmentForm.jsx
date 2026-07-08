import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    getSlots,
    reset,
} from "../../store/slices/scheduleSlice";

import {
    bookAppointment,
    reset as appointmentReset,
} from "../../store/slices/appointmentSlice";

function AppointmentForm({ doctor, onClose }) {
    const dispatch = useDispatch();

    const [slotId, setSlotId] = useState("");
    const [reason, setReason] = useState("");

    const { slots } = useSelector((state) => state.schedule);

    const {
        isLoading,
        isSuccess,
        isError,
        message,
    } = useSelector((state) => state.appointments);

    useEffect(() => {
        dispatch(getSlots(doctor.id));
    }, [dispatch, doctor.id]);

    useEffect(() => {
        if (isError) {
            alert(message);
        }

        if (isSuccess) {
            alert("Appointment booked successfully!");
            dispatch(appointmentReset());
            onClose();
        }
    }, [
        isError,
        isSuccess,
        message,
        dispatch,
        onClose,
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!slotId) {
            alert("Please select a time slot");
            return;
        }

        dispatch(
            bookAppointment({
                slotId,
                reason,
            })
        );
    };

    return (
        <div className="modal">

            <div className="modal-content">

                <button onClick={onClose}>
                    ×
                </button>

                <h2>
                    Book with Dr. {doctor.account.email}
                </h2>

                <form onSubmit={handleSubmit}>

                    <div>
                        <label htmlFor="slotId">
                            Select Time Slot *
                        </label>

                        <select
                            id="slotId"
                            value={slotId}
                            onChange={(e) =>
                                setSlotId(e.target.value)
                            }
                        >
                            <option value="">
                                Select a Slot
                            </option>

                            {slots.map((slot) => (
                                <option
                                    key={slot.id}
                                    value={slot.id}
                                >
                                    {slot.startTime}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="reason">
                            Reason for Visit *
                        </label>

                        <textarea
                            id="reason"
                            placeholder="Describe your symptoms..."
                            value={reason}
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!slotId || isLoading}
                    >
                        Confirm Booking
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AppointmentForm;