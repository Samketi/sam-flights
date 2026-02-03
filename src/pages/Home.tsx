// src/pages/Home.tsx
import { useState, useEffect, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchAirports } from "../api/amadeus";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    url: "https://images.unsplash.com/photo-1436491865332-7a61a109c055?auto=format&fit=crop&q=80&w=2070",
    title: "Explore the World",
    sub: "Find the best deals on international flights.",
  },
  {
    url: "https://images.unsplash.com/photo-1500835595367-9917d4c50dd2?auto=format&fit=crop&q=80&w=2070",
    title: "Business in Style",
    sub: "Premium comfort for your corporate travels.",
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073",
    title: "Tropical Escapes",
    sub: "Direct flights to the most beautiful islands.",
  },
];

interface Airport {
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

const Home: FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Autocomplete
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Airport[]
  >([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Airport | null>(null);

  const[tripType, setTripType] = useState<"round-trip" | "one-way">(
    "round-trip",
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Debounced airport search
  useEffect(() => {
    if (origin.length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const results = await searchAirports(origin);
          setOriginSuggestions(results.slice(0, 5));
        } catch (error) {
          console.error("Error searching airports:", error);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setOriginSuggestions([]);
    }
  }, [origin]);

  useEffect(() => {
    if (destination.length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const results = await searchAirports(destination);
          setDestinationSuggestions(results.slice(0, 5));
        } catch (error) {
          console.error("Error searching airports:", error);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDestinationSuggestions([]);
    }
  }, [destination]);

 const handleSearch = (e: React.FormEvent) => {
   e.preventDefault();

   if (!selectedOrigin || !selectedDestination || !departureDate) {
     alert("Please fill in all required fields");
     return;
   }

   if (tripType === "round-trip" && !returnDate) {
     alert("Please select a return date for round-trip flights");
     return;
   }

   // Navigate to results page with search params
   const params = new URLSearchParams({
     origin: selectedOrigin.iataCode,
     destination: selectedDestination.iataCode,
     departureDate,
     tripType,
     adults: adults.toString(),
     ...(tripType === "round-trip" && returnDate && { returnDate }),
     ...(children > 0 && { children: children.toString() }),
     ...(infants > 0 && { infants: infants.toString() }),
   });

   navigate(`/flights?${params.toString()}`);
 };


  return (
    <div className="relative pb-20">
      {/* Banner - keep your existing code */}
      <div className="relative h-[500px] w-full overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].url})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-6xl font-bold mb-4"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl"
              >
                {slides[currentSlide].sub}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Flight Search Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Trip Type Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setTripType("round-trip")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                tripType === "round-trip"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Round Trip
            </button>
            <button
              type="button"
              onClick={() => {
                setTripType("one-way");
                setReturnDate(""); // Clear return date when switching to one-way
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                tripType === "one-way"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              One Way
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Origin with Autocomplete */}
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-gray-600">
                Departure
              </label>
              <input
                type="text"
                placeholder="From (City or Airport)"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setSelectedOrigin(null);
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {originSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {originSuggestions.map((airport) => (
                    <button
                      key={airport.iataCode}
                      type="button"
                      onClick={() => {
                        setSelectedOrigin(airport);
                        setOrigin(`${airport.name} (${airport.iataCode})`);
                        setOriginSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold">{airport.iataCode}</div>
                      <div className="text-sm text-gray-600">
                        {airport.name}, {airport.address.cityName}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination with Autocomplete */}
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-gray-600">
                Destination
              </label>
              <input
                type="text"
                placeholder="To (City or Airport)"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setSelectedDestination(null);
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {destinationSuggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {destinationSuggestions.map((airport) => (
                    <button
                      key={airport.iataCode}
                      type="button"
                      onClick={() => {
                        setSelectedDestination(airport);
                        setDestination(`${airport.name} (${airport.iataCode})`);
                        setDestinationSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold">{airport.iataCode}</div>
                      <div className="text-sm text-gray-600">
                        {airport.name}, {airport.address.cityName}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Return Date - Only show for round-trip */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Return Date{" "}
                {tripType === "one-way" && (
                  <span className="text-gray-400">(One-way)</span>
                )}
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || new Date().toISOString().split("T")[0]}
                disabled={tripType === "one-way"}
                className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  tripType === "one-way" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Passengers */}
            <div className="grid grid-cols-3 gap-4 lg:col-span-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Adults
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Children
                </label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Infants
                </label>
                <select
                  value={infants}
                  onChange={(e) => setInfants(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[0, 1, 2].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg active:scale-95"
              >
                Find Flights
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Trust Badges - keep your existing code */}
      <div className="max-w-7xl mx-auto px-4 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-blue-600 text-3xl mb-2">✈️</div>
          <h4 className="font-bold">600+ Airlines</h4>
          <p className="text-gray-500 text-sm">
            A vast selection of carriers worldwide.
          </p>
        </div>
        <div>
          <div className="text-blue-600 text-3xl mb-2">🛡️</div>
          <h4 className="font-bold">Secure Booking</h4>
          <p className="text-gray-500 text-sm">
            Your data is always protected.
          </p>
        </div>
        <div>
          <div className="text-blue-600 text-3xl mb-2">📞</div>
          <h4 className="font-bold">24/7 Support</h4>
          <p className="text-gray-500 text-sm">
            We're here to help anytime, anywhere.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
