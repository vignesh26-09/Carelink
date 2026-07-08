import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import patientService from "../../services/patientService";

const initialState = {
    items: [],
    isLoading: false,
    isError: false,
    message: "",
};

// Get Patients
export const getPatients = createAsyncThunk(
    "patients/getAll",
    async (_, thunkAPI) => {
        try {
            return await patientService.getPatients();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch patients";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete Patient
export const deletePatient = createAsyncThunk(
    "patients/delete",
    async (id, thunkAPI) => {
        try {
            await patientService.deletePatient(id);
            return id;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to delete patient";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

const patientSlice = createSlice({
    name: "patients",

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

            // GET PATIENTS
            .addCase(getPatients.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(getPatients.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })

            .addCase(getPatients.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.items = [];
            })

            // DELETE PATIENT
            .addCase(deletePatient.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (patient) => patient.id !== action.payload
                );
            });
    },
});

export const { reset } = patientSlice.actions;

export default patientSlice.reducer;