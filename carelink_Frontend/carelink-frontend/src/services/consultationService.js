import api from "./api";

// start consultation:
const startConsultation = async(appointmentId)=>{
    const response = await api.post('/consultations/${appointmentId}/start');
    return response.data;
};

//Finalize a consultation:
const finalizeConsultation = async(appointmentId, data)=>{
    const params = new URLSearchParams();
    params.append("diagnosis",data.diagnosis);
    params.append("medicationsJson",JSON.stringify(data.medicationsJson));
    const response = await api.post(`/consultations/${appointmentId}/finalize?${params.toString()}`);
    return response.data;
};

const consultationService ={
    startConsultation,finalizeConsultation
};

export default consultationService;