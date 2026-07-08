import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    getMySlots,
    createSlot,
} from "../../store/slices/scheduleSlice";

function DoctorSchedule() {
    const dispatch = useDispatch();

    const { slots, isLoading, isSuccess } = useSelector(
        (state) => state.schedule
    );

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
        dispatch(getMySlots());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            dispatch(getMySlots());
        }
    }, [isSuccess, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();

        let start = startTime;
        let end = endTime;

        if (start.length === 16) {
            start += ":00";
        }

        if (end.length === 16) {
            end += ":00";
        }

        dispatch(
            createSlot({
                start,
                end,
            })
        );
    };

    return (
        <div>
            <h2>My Schedule</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="startTime">
                        Start Time
                    </label>

                    <input
                        id="startTime"
                        type="datetime-local"
                        min="2024-01-01T00:00"
                        max="2100-12-31T23:59"
                        value={startTime}
                        onChange={(e) =>
                            setStartTime(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="endTime">
                        End Time
                    </label>

                    <input
                        id="endTime"
                        type="datetime-local"
                        min="2024-01-01T00:00"
                        max="2100-12-31T23:59"
                        value={endTime}
                        onChange={(e) =>
                            setEndTime(e.target.value)
                        }
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                >
                    Add Slot
                </button>

            </form>

            <hr />

            <h3>Available Slots</h3>

            <table>
                <thead>
                    <tr>
                        <th>Start Time</th>
                        <th>End Time</th>
                    </tr>
                </thead>

                <tbody>
                    {slots.map((slot) => (
                        <tr key={slot.id}>
                            <td>{slot.startTime}</td>
                            <td>{slot.endTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DoctorSchedule;