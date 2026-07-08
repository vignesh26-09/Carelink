import api from "./api";

const register =async (userData)=>{
    const response =await api.post("/auth/register" , userData);
    if(response.data){
        localStorage.setItem("user",JSON.stringify(response.data))

    }
    return response.data;
};

const login =async(userData)=>{
    const response =await api.post("/auth/login",userData);
    if(response.data){
         localStorage.setItem("user",JSON.stringify(response.data));
    }
    return response.data;
};

const authService ={
    register,login
};
export default authService;