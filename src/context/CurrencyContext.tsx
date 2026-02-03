import {
  createContext,
  useContext,
  useState,
  useEffect,
  type FC,
  type ReactNode,
} from "react";

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  currencies: Currency[];
  changeCurrency: (code: string) => void;
  convertPrice: (price: number, fromCurrency: string) => number;
  formatPrice: (price: number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0],
  );
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {},
  );

  // Fetch exchange rates (you can use a free API like exchangerate-api.com)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Using a free API - you might want to use a more reliable one in production
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/USD`,
        );
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        // Fallback rates if API fails
        setExchangeRates({
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          ZAR: 18.5,
          NGN: 1580,
          KES: 129,
          JPY: 149,
          CAD: 1.36,
          AUD: 1.52,
        });
      }
    };

    fetchRates();
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const changeCurrency = (code: string) => {
    const currency = currencies.find((c) => c.code === code);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem("selectedCurrency", code);
    }
  };

  const convertPrice = (
    price: number,
    fromCurrency: string = "USD",
  ): number => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[selectedCurrency.code]) {
      return price;
    }

    // Convert to USD first, then to target currency
    const priceInUSD = price / exchangeRates[fromCurrency];
    return priceInUSD * exchangeRates[selectedCurrency.code];
  };

  const formatPrice = (price: number, fromCurrency: string = "USD"): string => {
    const convertedPrice = convertPrice(price, fromCurrency);
    return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem("selectedCurrency");
    if (saved) {
      const currency = currencies.find((c) => c.code === saved);
      if (currency) setSelectedCurrency(currency);
    }
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        currencies,
        changeCurrency,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
