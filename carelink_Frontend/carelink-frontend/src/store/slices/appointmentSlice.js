import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appointmentService from "../../services/appointmentService";

const initialState = {
    items: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
    searchQuery: "",
    filterStatus: "ALL",
};

// Get My Appointments
export const getMyAppointments = createAsyncThunk(
    "appointments/getAll",
    async (_, thunkAPI) => {
        try {
            return await appointmentService.getMyAppointments();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch appointments";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Book Appointment
export const bookAppointment = createAsyncThunk(
    "appointments/book",
    async (bookingData, thunkAPI) => {
        try {
            return await appointmentService.bookAppointment(bookingData);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to book appointment";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Cancel Appointment
export const cancelAppointment = createAsyncThunk(
    "appointments/cancel",
    async (id, thunkAPI) => {
        try {
            await appointmentService.cancelAppointment(id);
            return id;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to cancel appointment";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

const appointmentSlice = createSlice({
    name: "appointments",

    initialState,

    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },

        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },

        setFilterStatus: (state, action) => {
            state.filterStatus = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder

            // GET MY APPOINTMENTS
            .addCase(getMyAppointments.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(getMyAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.items = action.payload;
            })

            .addCase(getMyAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // BOOK APPOINTMENT
            .addCase(bookAppointment.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(bookAppointment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.items.push(action.payload);
            })

            .addCase(bookAppointment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // CANCEL APPOINTMENT
            .addCase(cancelAppointment.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(cancelAppointment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;

                state.items = state.items.filter(
                    (item) => item.id !== action.meta.arg
                );
            })

            .addCase(cancelAppointment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const {
    reset,
    setSearchQuery,
    setFilterStatus,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;