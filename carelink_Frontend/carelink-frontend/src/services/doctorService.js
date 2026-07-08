// doctorService.js
import api from "./api";

const getDoctors = async () => {
    const response = await api.get("/doctors");
    return response.data;
};

const deleteDoctor = async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
};

export default {
    getDoctors,
    deleteDoctor,
};