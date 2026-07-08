import api from "./api";// imports configuration of raw Axios Library. Used to make HTTP requests.
//Get all appointments:
const getMyAppointment =async()=>{
  const response =await api.get("/appointments/my");
  return response.data;
};

//Book an appointment:
const bookappointment = async(bookingData)=>{
    const response =await api.post("/appointments/book", bookingData);
    return response.data;
};

//Cancel an appointment:
const cancelAppointment = async (id) => {
    const response = await api.put(`/appointments/cancel/${id}`);
    return response.data;
};


//Get all appointments:
const getAllAppointments = async ()=>{
    const response = await api.get("/appointments");
    return response.data;
};

const appointmentService ={
    getMyAppointment,
    bookappointment,
    cancelAppointment,
    getAllAppointments
};

export default appointmentService;//