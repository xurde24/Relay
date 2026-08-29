"use client"

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, {Toaster} from 'react-hot-toast'

export const user_service="http://localhost:5000"
export const chat_service="http://localhost:5002"

export interface User{
    _id:string;
    name:string;
    email:string
}

export interface Chat{
    _id:string;
    users:string[];
    latestMessage:{
        text:string;
        sender:string
    }
    createdAt:string;
    updatedAt:string;
    unseenCount?:number
}

export interface Chats{
    _id:string;
    user:User;
    chat:Chat
}

interface AppContextType{
    user:User|null;
    loading:boolean;
    isAuth:boolean;
    setUser:React.Dispatch<React.SetStateAction<User|null>>
    setIsAuth:React.Dispatch<React.SetStateAction<boolean>>
    logoutUser:()=>Promise <void> 
    fetchUser:()=>Promise<void>
    fetchChats:()=>Promise <void>
    fetchUsers:()=>Promise <void>
    chats:Chats[]|null
    users:User[]|null;
    setUsers:React.Dispatch<React.SetStateAction<User[]|null>>
    setChats:React.Dispatch<React.SetStateAction<Chats[]|null>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps{
    children:ReactNode
}

export const AppProvider:React.FC<AppProviderProps>=({children})=>{
    const [user,setUser]=useState<User|null>(null)
    const [isAuth,setIsAuth]=useState(false)
    const [loading,setLoading]=useState(true)
    async function fetchUser() {
        
    const mounted=true
            try {
                const token=Cookies.get("token")
                const {data}=await axios.get(`${user_service}/api/v1/profile`,{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
                if(!mounted) return
                setUser(data)
                setIsAuth(true)
                setLoading(false)
            } catch (error) {
                console.log(error)
                if(!mounted) return
                setLoading(false)
            }
        }

   
    async function logoutUser() {
        Cookies.remove("token")
        setUser(null)
        setIsAuth(false)
        toast.success("User Logged out")
    }

    const [chats,setChats]=useState<Chats[] | null>(null);
    async function fetchChats() {
        const token=Cookies.get("token")
        try {
            const {data} =await axios.get(`${chat_service}/api/v1/chat/all`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            setChats(data.chats)
        } catch (error) {
            console.log(error)
        }
    }

    const [users,setUsers]=useState<User[] | null>(null)
    async function fetchUsers() {
        const token=Cookies.get("token")
        try{
            const {data}=await axios.get(`${user_service}/api/v1/user/all`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            setUsers(data)
        }
        catch(error){
            console.log(error)
        }
    }

     useEffect(()=>{
        const timer = setTimeout(() => {
            void fetchUser();
            void fetchChats();
            void fetchUsers()
        }, 0);

        return () => clearTimeout(timer);
    },[])


    return <AppContext.Provider value={{user,setUser,isAuth,setIsAuth,loading,logoutUser,fetchUser,fetchChats,fetchUsers,chats,users,setUsers,setChats}}>{children}<Toaster></Toaster></AppContext.Provider>
}



export const useAppData=(): AppContextType=>{
    const context=useContext(AppContext)
    if(!context){
        throw new Error("useappdata must be used within appprovider")
    }
    return context
};