import { jwtDecode } from "jwt-decode";

export const isExpired = (token) => {
  try {
    const decoded = jwtDecode(token); 
    const now = Math.floor(Date.now() / 1000); 
    return decoded.exp < now; 
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
};
