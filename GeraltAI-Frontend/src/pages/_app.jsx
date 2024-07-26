import 'focus-visible'
import '@/styles/tailwind.css'
import { GlobalContextProvider } from '@/context/globalContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <ToastContainer />
      <Component {...pageProps} />
    </GlobalContextProvider>
  )
}
