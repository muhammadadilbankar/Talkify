import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        //todo: optimize this one later
        socket.on("newMessage", (newMessage) => {
            // const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            if (
                newMessage.senderId !== selectedUser._id &&
                newMessage.receiverId !== selectedUser._id
            ) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
