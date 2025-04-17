import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL=import.meta.env.VITE_API_URL! 

type authTypes={
  authUser:{_id:string,profilePic:string,fullName:string,email:string,createdAt:string} | null
  isSigningUp:boolean
  isLoggingIn:boolean
  isUpdatingProfile:boolean
  isCheckingAuth:boolean
  checkAuth:()=>Promise<void>
  signup:(data: object)=>Promise<void>,
  login:(data: object)=>Promise<void>,
  logout:()=>Promise<void>,
  updateProfile:(data: object)=>Promise<void>,
  connectSocket:()=>void,
  disconnectSocket:()=>void,
  onlineUsers:Array<any>,
  socket: ReturnType<typeof io> | null,
}

export const useAuthStore=create<authTypes>((set,get)=>({
  authUser:null,
  isSigningUp:false,
  isLoggingIn:false,
  isUpdatingProfile:false,
  onlineUsers:[],
  isCheckingAuth:true,
  socket:null,
  checkAuth:async()=>{
    try {
      const res=await axiosInstance.get("/auth/check")
      // Set the authUser first
      set({authUser:res.data})
      
      // Then immediately connect socket if we have valid user data
      if (res.data && res.data._id) {
        // We call connectSocket directly - set() is synchronous in Zustand
        get().connectSocket();
      }
    } catch (error) {
      console.log('Error in checkAuth',error)
      set({authUser:null})
    } finally{
      set({isCheckingAuth:false})
    }
  },
  signup:async(data:object)=>{
    set({isSigningUp:true})
    try {
      const res=await axiosInstance.post("/auth/signup",data)
      toast.success("Account created successfully")
      set({authUser:res.data})
      get().connectSocket(); // Connect socket after successful signup
    } catch (error) {
      const err = error as any;
      console.error("Signup error:", error);
      toast.error(err.response?.data?.message || "Error creating account")
    }finally{
      set({isSigningUp:false})
    }
  },
  login: async (data: object) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      // Connect socket after successful login
      if (res.data && res.data._id) {
        get().connectSocket();
      }
    } catch (error) {
      const err = error as any;
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      const err = error as any;
      toast.error(err.response.data.message);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      const err= error as any;
      console.log("error in update profile:", error);
      toast.error(err.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket:()=>{
    const {authUser}=get()
    if(!authUser || !authUser._id) {
      console.log("Cannot connect socket: No authenticated user or missing ID");
      return;
    }
    
    if (get().socket?.connected) {
      console.log("Socket already connected");
      return;
    }
    
    console.log("Connecting socket for user:", authUser._id);
    const socket=io(BASE_URL,{
      query:{
        userId:authUser._id
      }
    })
    
    socket.on("connect", () => {
      console.log("Socket connected successfully with ID:", socket.id);
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    
    socket.connect()
    set({socket})
    
    socket.on("getOnlineUsers",(userIds)=>{
      console.log("Received online users:", userIds);
      set({onlineUsers:userIds})
    })
  },
  disconnectSocket: () => {
    if (get().socket) get().socket?.disconnect();
  },
}))