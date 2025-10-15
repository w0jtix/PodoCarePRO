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
            <Route path="/uslugi" element={<Services />}/>
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
