import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: Array.isArray(res.data) ? res.data : [] });
        } catch (error) {
            console.error("Failed to load users:", error);
            toast.error(error?.response?.data?.message || "Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        if (!userId) return;

        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            console.log("Fetched messages:", res.data);

            if (!Array.isArray(res.data)) {
                throw new Error("Invalid response format");
            }

            set({ messages: res.data, isMessagesLoading: false });
        } catch (error) {
            console.error("Error fetching messages:", error);
            set({ messages: [], isMessagesLoading: false });
            toast.error(error?.response?.data?.message || "Failed to fetch messages");
        }
    },


    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser?._id) return;

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            console.log("Sent message response:", res.data); // 👈 Log what you get

            // Defensive: ensure messages is always an array
            set({ messages: [...(messages || []), res.data] });
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error(error?.response?.data?.message || "Failed to send message");
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
