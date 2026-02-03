import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { CurrencyProvider } from "./context/CurrencyContext";

const App = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
