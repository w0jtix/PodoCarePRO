import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
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
            <Route path="/my-company" element={<ProtectedRoute permissions={['ROLE_ADMIN']}><Business /></ProtectedRoute>}/>
            <Route path="/settings" element={<ProtectedRoute permissions={['ROLE_ADMIN']}><Settings /></ProtectedRoute>}/>
            <Route path="/no-access" element={<AccessDenied />}/>
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
