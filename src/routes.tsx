import type { FC, JSX } from "react"
import { useAuth } from "./context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import FlightResults from "./pages/FlightResults";
import Booking from "./pages/booking/Booking";
import BookingConfirmation from "./pages/booking/BookingConfirmation";
import MyBookings from "./pages/booking/MyBookings";
import About from "./pages/About";
import Contact from "./pages/Contact";

interface ProtectedRoutesProps{
    children: JSX.Element
}

const ProtectedRoute:FC<ProtectedRoutesProps> = ({children})=>{
    const {user, loading} = useAuth();

    if(loading) return <p>Loading ...</p>
    if(!user){
      return (
        
          <Home/>
        
      )
    }

    return children;
}

const AppRoutes = () =>{
    return (
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flights" element={<FlightResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    );
}

export default AppRoutes;