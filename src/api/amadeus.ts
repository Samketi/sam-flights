// src/api/amadeus.ts
import axios from "axios";

const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
const AMADEUS_BASE_URL = "https://test.api.amadeus.com/v2";

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Get OAuth token
async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_API_KEY,
      client_secret: AMADEUS_API_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000;
  console.log("Token",accessToken)
  return accessToken??"";
}

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  nonStop?: boolean;
  maxPrice?: number;
}

export interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      duration: string;
    }>;
  }>;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  dictionaries: {
    carriers: Record<string, string>;
    aircraft: Record<string, string>;
    locations: Record<string, any>;
  };
}

export async function searchFlights(
  params: FlightSearchParams,
): Promise<FlightSearchResponse> {
  const token = await getAccessToken();

  const queryParams = new URLSearchParams({
    originLocationCode: params.originLocationCode,
    destinationLocationCode: params.destinationLocationCode,
    departureDate: params.departureDate,
    adults: params.adults.toString(),
    max: "50", // Get more results for better filtering
  });

  if (params.returnDate) {
    queryParams.append("returnDate", params.returnDate);
  }
  if (params.children) {
    queryParams.append("children", params.children.toString());
  }
  if (params.infants) {
    queryParams.append("infants", params.infants.toString());
  }
  if (params.travelClass) {
    queryParams.append("travelClass", params.travelClass);
  }
  if (params.nonStop !== undefined) {
    queryParams.append("nonStop", params.nonStop.toString());
  }
  if (params.maxPrice) {
    queryParams.append("maxPrice", params.maxPrice.toString());
  }

  const response = await axios.get(
    `${AMADEUS_BASE_URL}/shopping/flight-offers?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

// Airport autocomplete
export async function searchAirports(keyword: string): Promise<any[]> {
  const token = await getAccessToken();

  const response = await axios.get(
    `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${keyword}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}
