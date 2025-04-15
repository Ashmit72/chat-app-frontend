import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "./useAuthStore"

type ChatTypes = {
  messages: Array<any>
  users: Array<any>
  selectedUser: { _id: string; profilePic: string; fullName: string } | null
  isUsersLoading: boolean
  isMessagesLoading: boolean
  getUsers: () => Promise<void>
  getMessages: (userId: string) => Promise<void>
  setSelectedUser: (selectedUser: { _id: string; profilePic: string; fullName: string } | null) => void
  sendMessage: (data: { text: string; image: string | null }) => Promise<void>,
  subscribeToMessages: () => void,
  unsubscribeFromMessages: () => void
}

export const useChatStore = create<ChatTypes>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  
  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get("/message/users")
      set({ users: res.data })
    } catch (error) {
      const err = error as any
      toast.error(err.response?.data?.message || "Failed to load users")
    } finally {
      set({ isUsersLoading: false })
    }
  },
  
  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`/message/${userId}`)
      set({ messages: res.data })
    } catch (error) {
      const err = error as any
      toast.error(err.response?.data?.message || "Failed to load messages")
    } finally {
      set({ isMessagesLoading: false })
    }
  },
  
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  
  sendMessage: async (data: { text: string; image: string | null }) => {
    const { selectedUser, messages } = get()
    
    if (!selectedUser?._id) {
      toast.error("No recipient selected")
      return
    }
    
    try {
      // Process the image data if it exists
      let processedData: any = { text: data.text }
      
      if (data.image) {
        // Extract the base64 data without the prefix
        const imageData = data.image.split(",")[1]
        processedData.image = imageData
      }
      
      console.log("Sending message to:", selectedUser._id)
      console.log("Message data:", { hasText: !!processedData.text, hasImage: !!processedData.image })
      
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, processedData)
      
      set({ messages: [...messages, res.data] })
    } catch (error) {
      const err = error as any
      console.error("Send message error:", err)
      toast.error(err.response?.data?.message || "Failed to send message")
    }
  },
  subscribeToMessages: () => {
    const {selectedUser}=get()
    if (!selectedUser) return 
    const socket=useAuthStore.getState().socket
    socket?.on("newMessage", (message: { text: string; senderId: string; createdAt: string; image?: string }) => {
      const isMessageSentFromSelectedUser=message.senderId===selectedUser._id
      if (!isMessageSentFromSelectedUser) return
      set({
      messages: [...get().messages, message]
      })
    })
  },
  unsubscribeFromMessages: () => {
    const socket=useAuthStore.getState().socket
    socket?.off("newMessage")
  }
}))