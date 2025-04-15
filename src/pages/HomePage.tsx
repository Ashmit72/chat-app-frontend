import { useEffect } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { Loader } from "lucide-react"
import { Navigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useChatStore } from "../store/useChatStore"
import NoChatSelected from "../components/NoChatSelected"
import ChatContainer from "../components/ChatContainer"
import Sidebar from "../components/Sidebar"

const HomePage = () => {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers}=useAuthStore()
  const {selectedUser}=useChatStore()
  useEffect(()=>{
  checkAuth()
  },[checkAuth])
  console.log(onlineUsers)

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
       <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <Navigate to="/login" />
    )
    
  }

  return (
    <>
     <Navbar/>
    <div className="h-screen bg-base-200" >
    <div className="flex items-center justify-center pt-20 px-4">
      <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
        <div className="flex h-full rounded-lg overflow-hidden">
          <Sidebar/>
          {!selectedUser?<NoChatSelected/>:<ChatContainer/>}
        </div>
      </div>
    </div>
    </div>
    </>
  )
}
export default HomePage