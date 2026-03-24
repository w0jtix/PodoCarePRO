import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Login from "./pages/Login";
import { AlertProvider } from "./components/Alert/AlertProvider";
import { Main } from "./layouts/Main";
import { UserProvider } from "./components/User/UserProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Warehouse = lazy(() => import("./pages/Warehouse"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const Services = lazy(() => import("./pages/Services"));
const PriceList = lazy(() => import("./pages/PriceList"));
const Clients = lazy(() => import("./pages/Clients"));
const Settings = lazy(() => import("./pages/Settings"));
const Visits = lazy(() => import("./pages/Visits"));
const Business = lazy(() => import("./pages/Business"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const CashRegistry = lazy(() => import("./pages/CashRegistry"));

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
        <Suspense fallback={null}>
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
        </Suspense>
      </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
