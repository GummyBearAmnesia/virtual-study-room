import axios from 'axios'

//const myBaseUrl = 'http://127.0.0.1:8000/';
const myBaseUrl = 'https://virtual-study-room-unly.onrender.com/api';
const AxiosInstance = axios.create({
    baseURL: myBaseUrl,
    timeout: 10000,
    headers: {
        "Content-Type":"application/json",
        accept: "application/json"
    }
}); 

export default AxiosInstance
