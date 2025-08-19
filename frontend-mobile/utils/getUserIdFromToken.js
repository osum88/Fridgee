import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = (token) => {
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    return decoded.id;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
