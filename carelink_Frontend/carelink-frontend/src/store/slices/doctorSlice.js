import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import doctorService from "../../services/doctorService";

const initialState = {
    items: [],
    isLoading: false,
    isError: false,
    message: "",
};

// Get Doctors
export const getDoctors = createAsyncThunk(
    "doctors/getAll",
    async (_, thunkAPI) => {
        try {
            return await doctorService.getDoctors();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch doctors";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete Doctor
export const deleteDoctor = createAsyncThunk(
    "doctors/delete",
    async (id, thunkAPI) => {
        try {
            await doctorService.deleteDoctor(id);
            return id;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to delete doctor";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

const doctorSlice = createSlice({
    name: "doctors",

    initialState,

    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "";
        },
    },

    extraReducers: (builder) => {
        builder

            // GET DOCTORS
            .addCase(getDoctors.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(getDoctors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })

            .addCase(getDoctors.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.items = [];
            })

            // DELETE DOCTOR
            .addCase(deleteDoctor.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (doctor) => doctor.id !== action.payload
                );
            });
    },
});

export const { reset } = doctorSlice.actions;

export default doctorSlice.reducer;