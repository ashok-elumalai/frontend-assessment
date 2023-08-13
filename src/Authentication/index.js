import axios from "axios";

// initiating API's - to connect mock server
const mockApi = axios.create({
  baseURL: "https://mocki.io/v1" 
});

export default mockApi;