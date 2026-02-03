// src/pages/FlightResults.tsx
// This updated version properly displays both outbound AND return flights for round trips
// Key changes:
// 1. Added isRoundTrip detection based on tripType and returnDate
// 2. FlightCard now shows BOTH outbound and return itineraries separately
// 3. Each itinerary is clearly labeled (OUTBOUND / RETURN)
// 4. Total price shown is for the complete round trip

import { useState, useEffect, useMemo, type FC } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  searchFlights,
  type FlightOffer,
  type FlightSearchResponse,
} from "../api/amadeus";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import LoginRequiredModal from "../components/Loginrequiredmodal";
import { useAuth } from "../context/AuthContext";

const FlightResults: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  // Search parameters
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const tripType = searchParams.get("tripType") || "round-trip";
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");
  const infants = parseInt(searchParams.get("infants") || "0");

  const isRoundTrip = tripType === "round-trip" && returnDate;

  // State
  const [loading, setLoading] = useState(true);
  const [flightData, setFlightData] = useState<FlightSearchResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"price" | "duration">("price");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch flights
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await searchFlights({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate,
          returnDate: returnDate || undefined,
          adults,
          children: children || undefined,
          infants: infants || undefined,
        });

        setFlightData(response);
      } catch (err: any) {
        console.error("Error fetching flights:", err);
        setError(
          err.response?.data?.errors?.[0]?.detail ||
            "Failed to fetch flights. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination && departureDate) {
      fetchFlights();
    }
  }, [
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
    children,
    infants,
  ]);

  // Calculate number of stops for a flight
  const getNumberOfStops = (flight: FlightOffer): number => {
    return flight.itineraries[0].segments.length - 1;
  };

  // Get all unique airlines
  const availableAirlines = useMemo(() => {
    if (!flightData) return [];
    const airlines = new Set<string>();
    flightData.data.forEach((flight) => {
      flight.validatingAirlineCodes.forEach((code) => airlines.add(code));
    });
    return Array.from(airlines).map((code) => ({
      code,
      name: flightData.dictionaries.carriers[code] || code,
    }));
  }, [flightData]);

  // Get all unique stop options
  const availableStops = useMemo(() => {
    if (!flightData) return [];
    const stops = new Set<number>();
    flightData.data.forEach((flight) => {
      stops.add(getNumberOfStops(flight));
    });
    return Array.from(stops).sort((a, b) => a - b);
  }, [flightData]);

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    if (!flightData) return [];
    let filtered = [...flightData.data];

    if (maxPrice !== null) {
      filtered = filtered.filter(
        (flight) => parseFloat(flight.price.total) <= maxPrice,
      );
    }

    if (selectedStops.length > 0) {
      filtered = filtered.filter((flight) =>
        selectedStops.includes(getNumberOfStops(flight)),
      );
    }

    if (selectedAirlines.length > 0) {
      filtered = filtered.filter((flight) =>
        flight.validatingAirlineCodes.some((code) =>
          selectedAirlines.includes(code),
        ),
      );
    }

    if (sortBy === "price") {
      filtered.sort(
        (a, b) => parseFloat(a.price.total) - parseFloat(b.price.total),
      );
    } else {
      filtered.sort((a, b) => {
        const durationA = parseDuration(a.itineraries[0].duration);
        const durationB = parseDuration(b.itineraries[0].duration);
        return durationA - durationB;
      });
    }

    return filtered;
  }, [flightData, maxPrice, selectedStops, selectedAirlines, sortBy]);

  // Generate price graph data
  const priceGraphData = useMemo(() => {
    if (filteredFlights.length === 0) return [];
    const priceRanges: { [key: string]: number } = {};
    const minPrice = Math.min(
      ...filteredFlights.map((f) => parseFloat(f.price.total)),
    );
    const maxPriceValue = Math.max(
      ...filteredFlights.map((f) => parseFloat(f.price.total)),
    );
    const rangeSize = (maxPriceValue - minPrice) / 10;
    const currency = filteredFlights[0]?.price.currency || "USD";

    filteredFlights.forEach((flight) => {
      const price = parseFloat(flight.price.total);
      const rangeIndex = Math.floor((price - minPrice) / rangeSize);
      const rangeLabel = formatPrice(
        Math.round(minPrice + rangeIndex * rangeSize),
        currency,
      );
      priceRanges[rangeLabel] = (priceRanges[rangeLabel] || 0) + 1;
    });

    return Object.entries(priceRanges)
      .map(([range, count]) => ({
        range,
        count,
        price: parseInt(range.replace(/[^0-9]/g, "")),
      }))
      .sort((a, b) => a.price - b.price);
  }, [filteredFlights, formatPrice]);

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = match?.[1] ? parseInt(match[1]) : 0;
    const minutes = match?.[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
  };

  const formatDuration = (duration: string): string => {
    const totalMinutes = parseDuration(duration);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleBookFlight = (flight: FlightOffer) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    sessionStorage.setItem(
      "selectedFlight",
      JSON.stringify({
        flight,
        dictionaries: flightData?.dictionaries,
        searchParams: {
          origin,
          destination,
          departureDate,
          returnDate,
          tripType,
          adults,
          children,
          infants,
        },
      }),
    );
    navigate("/booking");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for the best flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {origin} → {destination}
                {isRoundTrip && (
                  <span className="text-blue-600"> (Round Trip)</span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                {formatDate(departureDate)}
                {returnDate && ` - ${formatDate(returnDate)}`} •{" "}
                {adults + children + infants} passenger
                {adults + children + infants > 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Modify Search
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            <p className="text-gray-600">
              {filteredFlights.length} flight
              {filteredFlights.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-600">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price" | "duration")
                }
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="price">Lowest Price</option>
                <option value="duration">Shortest Duration</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - keeping existing filter code */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                {(maxPrice !== null ||
                  selectedStops.length > 0 ||
                  selectedAirlines.length > 0) && (
                  <button
                    onClick={() => {
                      setMaxPrice(null);
                      setSelectedStops([]);
                      setSelectedAirlines([]);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Price:{" "}
                  {maxPrice
                    ? formatPrice(
                        maxPrice,
                        flightData?.data[0]?.price.currency || "USD",
                      )
                    : "Any"}
                </label>
                <input
                  type="range"
                  min={
                    flightData
                      ? Math.min(
                          ...flightData.data.map((f) =>
                            parseFloat(f.price.total),
                          ),
                        )
                      : 0
                  }
                  max={
                    flightData
                      ? Math.max(
                          ...flightData.data.map((f) =>
                            parseFloat(f.price.total),
                          ),
                        )
                      : 1000
                  }
                  value={
                    maxPrice ||
                    (flightData
                      ? Math.max(
                          ...flightData.data.map((f) =>
                            parseFloat(f.price.total),
                          ),
                        )
                      : 1000)
                  }
                  onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Stops Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Number of Stops
                </label>
                <div className="space-y-2">
                  {availableStops.map((stops) => (
                    <label
                      key={stops}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStops.includes(stops)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStops([...selectedStops, stops]);
                          } else {
                            setSelectedStops(
                              selectedStops.filter((s) => s !== stops),
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {stops === 0
                          ? "Non-stop"
                          : `${stops} stop${stops > 1 ? "s" : ""}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Airlines Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Airlines
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableAirlines.map((airline) => (
                    <label
                      key={airline.code}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAirlines.includes(airline.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAirlines([
                              ...selectedAirlines,
                              airline.code,
                            ]);
                          } else {
                            setSelectedAirlines(
                              selectedAirlines.filter(
                                (a) => a !== airline.code,
                              ),
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {airline.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Graph */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Price Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={priceGraphData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Flight Cards */}
            <AnimatePresence mode="popLayout">
              {filteredFlights.map((flight, index) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  dictionaries={flightData!.dictionaries}
                  onBook={() => handleBookFlight(flight)}
                  formatTime={formatTime}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  getNumberOfStops={getNumberOfStops}
                  index={index}
                  isRoundTrip={tripType==="round-trip"}
                />
              ))}
            </AnimatePresence>

            {filteredFlights.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No flights match your filters
                </p>
                <button
                  onClick={() => {
                    setMaxPrice(null);
                    setSelectedStops([]);
                    setSelectedAirlines([]);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Flight Card Component - NOW SHOWS BOTH OUTBOUND AND RETURN
interface FlightCardProps {
  flight: FlightOffer;
  dictionaries: any;
  onBook: () => void;
  formatTime: (date: string) => string;
  formatDate: (date: string) => string;
  formatDuration: (duration: string) => string;
  getNumberOfStops: (flight: FlightOffer) => number;
  index: number;
  isRoundTrip: boolean;
}

const FlightCard: FC<FlightCardProps> = ({
  flight,
  dictionaries,
  onBook,
  formatTime,
  formatDate,
  formatDuration,
  index,
  isRoundTrip,
}) => {
  const [expanded, setExpanded] = useState(false);
  const outbound = flight.itineraries[0];
  const returnFlight = isRoundTrip ? flight.itineraries[1] : null;
  const outboundStops = outbound.segments.length - 1;
  const returnStops = returnFlight ? returnFlight.segments.length - 1 : 0;
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        {/* OUTBOUND FLIGHT */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
              OUTBOUND
            </div>
            <img
              src={`https://images.kiwi.com/airlines/64/${outbound.segments[0].carrierCode}.png`}
              alt={dictionaries.carriers[outbound.segments[0].carrierCode]}
              className="w-6 h-6"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/24";
              }}
            />
            <span className="font-semibold text-gray-800 text-sm">
              {dictionaries.carriers[outbound.segments[0].carrierCode]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(outbound.segments[0].departure.at)}
              </div>
              <div className="text-sm text-gray-600">
                {outbound.segments[0].departure.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(outbound.segments[0].departure.at)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {formatDuration(outbound.duration)}
              </div>
              <div className="flex items-center justify-center mb-1">
                <div className="h-px bg-gray-300 flex-1"></div>
                <Plane className="w-4 h-4 text-gray-400 mx-2" />
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <div className="text-xs text-gray-500">
                {outboundStops === 0
                  ? "Non-stop"
                  : `${outboundStops} stop${outboundStops > 1 ? "s" : ""}`}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(
                  outbound.segments[outbound.segments.length - 1].arrival.at,
                )}
              </div>
              <div className="text-sm text-gray-600">
                {
                  outbound.segments[outbound.segments.length - 1].arrival
                    .iataCode
                }
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(
                  outbound.segments[outbound.segments.length - 1].arrival.at,
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RETURN FLIGHT (if round trip) */}
        {isRoundTrip && returnFlight && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  RETURN
                </div>
                <img
                  src={`https://images.kiwi.com/airlines/64/${returnFlight.segments[0].carrierCode}.png`}
                  alt={
                    dictionaries.carriers[returnFlight.segments[0].carrierCode]
                  }
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/24";
                  }}
                />
                <span className="font-semibold text-gray-800 text-sm">
                  {dictionaries.carriers[returnFlight.segments[0].carrierCode]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(returnFlight.segments[0].departure.at)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {returnFlight.segments[0].departure.iataCode}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(returnFlight.segments[0].departure.at)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    {formatDuration(returnFlight.duration)}
                  </div>
                  <div className="flex items-center justify-center mb-1">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <Plane className="w-4 h-4 text-gray-400 mx-2 transform rotate-180" />
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {returnStops === 0
                      ? "Non-stop"
                      : `${returnStops} stop${returnStops > 1 ? "s" : ""}`}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(
                      returnFlight.segments[returnFlight.segments.length - 1]
                        .arrival.at,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      returnFlight.segments[returnFlight.segments.length - 1]
                        .arrival.iataCode
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(
                      returnFlight.segments[returnFlight.segments.length - 1]
                        .arrival.at,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Price & Book Section */}
        <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(
                parseFloat(flight.price.total),
                flight.price.currency,
              )}
            </div>
            <div className="text-sm text-gray-500">
              Total for {isRoundTrip ? "round trip" : "one way"}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              {expanded ? "Less details" : "More details"}
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onBook}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 overflow-hidden"
            >
              <h4 className="font-semibold mb-4">Outbound Flight Segments</h4>
              <div className="space-y-4 mb-6">
                {outbound.segments.map((segment, idx) => (
                  <div key={idx} className="flex items-start gap-4 text-sm">
                    <div className="flex-shrink-0 w-16 text-gray-600">
                      {dictionaries.carriers[segment.carrierCode]}{" "}
                      {segment.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">
                          {segment.departure.iataCode}{" "}
                          {formatTime(segment.departure.at)}
                        </span>
                        <span className="text-gray-600">
                          {formatDuration(segment.duration)}
                        </span>
                        <span className="font-semibold">
                          {segment.arrival.iataCode}{" "}
                          {formatTime(segment.arrival.at)}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {dictionaries.aircraft[segment.aircraft.code] ||
                          segment.aircraft.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isRoundTrip && returnFlight && (
                <>
                  <h4 className="font-semibold mb-4">Return Flight Segments</h4>
                  <div className="space-y-4">
                    {returnFlight.segments.map((segment, idx) => (
                      <div key={idx} className="flex items-start gap-4 text-sm">
                        <div className="flex-shrink-0 w-16 text-gray-600">
                          {dictionaries.carriers[segment.carrierCode]}{" "}
                          {segment.number}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold">
                              {segment.departure.iataCode}{" "}
                              {formatTime(segment.departure.at)}
                            </span>
                            <span className="text-gray-600">
                              {formatDuration(segment.duration)}
                            </span>
                            <span className="font-semibold">
                              {segment.arrival.iataCode}{" "}
                              {formatTime(segment.arrival.at)}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            {dictionaries.aircraft[segment.aircraft.code] ||
                              segment.aircraft.code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FlightResults;
