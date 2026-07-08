import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import scheduleService from "../../services/scheduleService";

const initialState = {
    slots: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
};

// Get Available Slots
export const getSlots = createAsyncThunk(
    "schedule/getSlots",
    async (doctorId, thunkAPI) => {
        try {
            return await scheduleService.getAvailableSlots(doctorId);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch slots";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create Slot
export const createSlot = createAsyncThunk(
    "schedule/createSlot",
    async (slotData, thunkAPI) => {
        try {
            return await scheduleService.createSlot(slotData);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to create slot";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get My Slots
export const getMySlots = createAsyncThunk(
    "schedule/getMySlots",
    async (_, thunkAPI) => {
        try {
            return await scheduleService.getMySlots();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch your slots";

            return thunkAPI.rejectWithValue(message);
        }
    }
);

const scheduleSlice = createSlice({
    name: "schedule",

    initialState,

    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },
    },

    extraReducers: (builder) => {
        builder

            // GET AVAILABLE SLOTS
            .addCase(getSlots.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(getSlots.fulfilled, (state, action) => {
                state.isLoading = false;
                state.slots = action.payload;
            })

            .addCase(getSlots.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // CREATE SLOT
            .addCase(createSlot.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(createSlot.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })

            .addCase(createSlot.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // GET MY SLOTS
            .addCase(getMySlots.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(getMySlots.fulfilled, (state, action) => {
                state.isLoading = false;
                state.slots = action.payload;
            })

            .addCase(getMySlots.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = scheduleSlice.actions;

export default scheduleSlice.reducer;