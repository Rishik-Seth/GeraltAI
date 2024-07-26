import React, { createContext, useContext, useEffect } from 'react'
import axios from 'axios'

const GlobalContext = createContext()

export const GlobalContextProvider = ({ children }) => {
  const [isLogin, setIsLogin] = React.useState(false)
  const [userData, setUserData] = React.useState({})
  const [userDataLoadingStatus, setUserDataLoadingStatus] = React.useState('loading')
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      setIsLogin(true)
      axios
        .post(
          `${backendUrl}/attendance/me/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        .then((data) => {
          setUserData(data.data.data)
          setUserDataLoadingStatus('loaded')
        })
        .catch((data) => {
          setUserDataLoadingStatus('error')
        })
    } else {
      setIsLogin(false)
    }
  }, [])

  return (
    <GlobalContext.Provider value={{ isLogin, setIsLogin, userData,userDataLoadingStatus }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => {
  if (!useContext(GlobalContext)) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContextProvider'
    )
  }
  return useContext(GlobalContext)
}
