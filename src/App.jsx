import { Outlet } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <Analytics />
      <Outlet />
    </>
  )
}

export default App
