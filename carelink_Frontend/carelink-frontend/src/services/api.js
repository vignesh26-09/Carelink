//This file is a configuration Provider.
//1) Base url
//2)Content-Type
//3)Request Interceptor 
//4) Response Interceptor


import axios from "axios"
//Reusable Axios instance: For base url  and header.
const api =axios.create({
    baseURL:"http://localhost:1327/api",
    headers:{
        "Content-Type":"application/json",
    },
});
//Request Interceptor:
api.interceptors.request.use(
    (config)=>{
        const user =JSON.parse(localStorage.getItem("user"));
        if(user && user.token){
            config.headers.Authorization= `Bearer ${user.token}`;
        }
        return config;
    },
    (error)=> {
        return Promise.reject(error);
    }
);
//Response Interceptor:
api.interceptors.response.use(
    (response)=>response,
    (error)=>{
         if(error.response && error.response.status===401){
            localStorage.removeItem("user");
            window.location.href="/login";
         }
         return Promise.reject(error);
    }
);
export default api;
