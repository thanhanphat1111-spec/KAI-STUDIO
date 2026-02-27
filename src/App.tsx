import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Confirm from "./pages/Confirm"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/confirm/:id" element={<Confirm />} />
      </Routes>
    </BrowserRouter>
  )
}
