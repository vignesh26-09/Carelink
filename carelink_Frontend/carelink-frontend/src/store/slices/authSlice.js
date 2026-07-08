import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
const user = JSON.parse(localStorage.getItem("user"))

const initialState = {
    user: user || null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

export const register = createAsyncThunk("auth/register",
    async(userData, thunkAPI) =>{
        try{
            return await authService.register(userData);
        }catch(error){
            const message = error.response?.data?.message || error.message || "Registration failed";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const login = createAsyncThunk("auth/login",
    async(userData, thunkAPI) =>{
        try{
            return await authService.login(userData);
        }catch(error){
            const message=error.response?.data?.message || error.message || "Login failed";
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },

        logout: (state) => {
            localStorage.removeItem("user");
            state.user = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // REGISTER
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })

            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })

            // LOGIN
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })

            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            });
    },
});

export const { logout, reset } = authSlice.actions;

export default authSlice.reducer;