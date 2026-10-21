import axios from "axios";

// axios.create -- creates a reusable HTTP Client
// baseURL prevent us from repeatuing the backend address in every request
// headers -- tells Django that we are sending JSON data
const api = axios.create({ 
    baseURL: "http://127.0.0.1:8001/api/",
    headers:{
        "Content-Type" :"application/json",
    },
});

export default api;