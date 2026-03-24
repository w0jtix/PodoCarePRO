import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Warehouse from "./pages/Warehouse";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import { AlertProvider } from "./components/Alert/AlertProvider";
import { Main } from "./layouts/Main";
import Profile from "./pages/Profile";
import { UserProvider } from "./components/User/UserProvider";
import Services from "./pages/Services";
import PriceList from "./pages/PriceList";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Visits from "./pages/Visits";
import Business from "./pages/Business";
import AccessDenied from "./pages/AccessDenied";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CashRegistry from "./pages/CashRegistry";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (isMobile) {
    return (
      <div className="display flex justify-center align-items-center height-max width-max">
        <div className="flex-column align-items-center g-1">
          <h1 className="access-denied-title">Desktop only</h1>
          <p className="access-denied-text">Please open this app on a desktop device.</p>
        </div>
      </div>
    );
  }

  return (
    <AlertProvider>
      <UserProvider>
      <Router>
        <Routes>
            <Route element={<Main />}>
              <Route path="/" element={<Warehouse />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />}/>
              <Route path="/pricelist" element={<PriceList />}/>
              <Route path="/visits" element={<Visits />}/>
              <Route path="/services" element={<Services />}/>
              <Route path="/clients" element={<Clients />}/>
              <Route path="/cash-ledger" element={<CashRegistry />} />
              <Route path="/my-company" element={<ProtectedRoute permissions={['ROLE_ADMIN']}><Business /></ProtectedRoute>}/>
              <Route path="/settings" element={<ProtectedRoute permissions={['ROLE_ADMIN']}><Settings /></ProtectedRoute>}/>
              <Route path="/no-access" element={<AccessDenied />}/>
              <Route path="*" element={<AccessDenied />}/>
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
      </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
