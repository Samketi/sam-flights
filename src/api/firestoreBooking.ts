import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Passenger {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  nationality?: string;
}

export interface BookingData {
  userId: string;
  userEmail: string;
  flightId: string;

  // Flight details
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;

  // Passengers
  passengers: Passenger[];

  // Pricing
  totalPrice: number;
  currency: string;

  // Contact
  contactEmail: string;
  contactPhone: string;

  // Payment
  paymentStatus: "pending" | "completed" | "failed";
  paymentReference?: string;

  // Flight offer data (stored as JSON string)
  flightData: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  bookingReference: string;
  status: "confirmed" | "cancelled" | "pending";
}

// Generate a unique booking reference
const generateBookingReference = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let reference = "";
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK${reference}`;
};

// Create a new booking
export const createBooking = async (
  bookingData: Omit<
    BookingData,
    "createdAt" | "updatedAt" | "bookingReference"
  >,
): Promise<string> => {
  try {
    const bookingRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      bookingReference: generateBookingReference(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return bookingRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Get user's bookings
export const getUserBookings = async (
  userId: string,
): Promise<BookingData[]> => {
  try {
    const q = query(collection(db, "bookings"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const bookings: BookingData[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({ ...doc.data(), id: doc.id } as BookingData & {
        id: string;
      });
    });

    // Sort by createdAt in memory (newest first)
    return bookings.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// Update booking payment status
export const updateBookingPayment = async (
  bookingId: string,
  paymentStatus: "completed" | "failed",
  paymentReference: string,
): Promise<void> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      paymentStatus,
      paymentReference,
      status: paymentStatus === "completed" ? "confirmed" : "pending",
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating booking payment:", error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: "cancelled",
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};
