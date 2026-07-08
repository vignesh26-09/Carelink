// patientService.js
import api from "./api";

const getPatients = async () => {
    const response = await api.get("/patients");
    return response.data;
};

const deletePatient = async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
};

export default {
    getPatients,
    deletePatient,
};