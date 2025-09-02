import apiClient from "@/utils/api-client";

// pridani pritele (odeslani zadosti)
export const addFriendApi = async (user2Id) => {
  try {
    const response = await apiClient.post("/friends/add", {user2Id});
    return response.data;
  } catch (error) {
    console.error("Error in addFriendApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

// zruseni odeslane zadosti o pratelstvi
export const cancelFriendRequestApi = async (friendId) => {
  try {
    const response = await apiClient.delete(`/friends/cancel/${friendId}`);
    return response.data;
  } catch (error) {
    console.error("Error in cancelFriendRequestApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

// odstraneni uzivatele z pratel
export const deleteFriendApi = async (friendId) => {
  try {
    const response = await apiClient.delete(`/friends/${friendId}`);
    return response.data;
  } catch (error) {
    console.error("Error in deleteFriendApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

// akceptovani prijate zadosti o pratelstvi
export const acceptFriendRequestApi = async (friendId) => {
  try {
    const response = await apiClient.patch(`/friends/accept/${friendId}`);
    return response.data;
  } catch (error) {
    console.error("Error in acceptFriendRequestApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

// ziska seznam vsech odeslanych zadosti o pratelstvi
export const getSentFriendRequestsApi = async () => {
  try {
    const response = await apiClient.get("/friends/requests/sent");
    return response.data;
  } catch (error) {
    console.error("Error in getSentFriendRequestsApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

// ziska seznam vsech prijatych zadosti o pratelstvi
export const getReceivedFriendRequestsApi = async () => {
  try {
    const response = await apiClient.get("/friends/requests/received");
    return response.data;
  } catch (error) {
    console.error("Error in getReceivedFriendRequestsApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

// ziska seznam vsech pratel
export const getAllFriendsApi = async () => {
  try {
    const response = await apiClient.get("/friends");
    return response.data;
  } catch (error) {
    console.error("Error in getAllFriendsApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};


