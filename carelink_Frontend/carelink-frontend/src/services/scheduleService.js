import api from "./api";

/**
 * Get available slots for a doctor
 */
const getAvailableSlots = async (doctorId) => {
    const response = await api.get(`/schedule/slots/${doctorId}`);
    return response.data;
};

/**
 * Create a new availability slot
 */
const createSlot = async (slotData) => {
    const params = new URLSearchParams(slotData);

    const response = await api.post(
        `/schedule/slots?${params.toString()}`
    );

    return response.data;
};

/**
 * Get slots of the logged-in doctor
 */
const getMySlots = async () => {
    const response = await api.get("/schedule/my");
    return response.data;
};

const scheduleService = {
    getAvailableSlots,
    createSlot,
    getMySlots,
};

export default scheduleService;