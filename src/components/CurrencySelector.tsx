import { useState, useRef, useEffect, type FC } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { ChevronDown } from "lucide-react";

const CurrencySelector: FC = () => {
  const { selectedCurrency, currencies, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold">{selectedCurrency.code}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            Select Currency
          </div>
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => {
                changeCurrency(currency.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                selectedCurrency.code === currency.code
                  ? "bg-blue-50 text-blue-600"
                  : ""
              }`}
            >
              <div>
                <div className="font-semibold">{currency.code}</div>
                <div className="text-xs text-gray-500">{currency.name}</div>
              </div>
              <span className="text-lg">{currency.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
