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

function App() {
  return (
    <AlertProvider>
      <UserProvider>
      <Router>
        <Routes>
          <Route element={<Main />}>
            <Route path="/" element={<Warehouse />} />
            <Route path="/zamowienia" element={<Orders />} />
            <Route path="/profile" element={<Profile />}/>
            <Route path="/cennik" element={<PriceList />}/>
            <Route path="/wizyty" element={<Visits />}/>
            <Route path="/uslugi" element={<Services />}/>
            <Route path="/klienci" element={<Clients />}/>
            <Route path="/ustawienia" element={<Settings />}/>
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
