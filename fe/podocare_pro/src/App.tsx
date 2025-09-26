import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Warehouse from "./pages/Warehouse";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import { AlertProvider } from "./components/Alert/AlertProvider";
import { Main } from "./layouts/Main";

function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>
          <Route element={<Main />}>
            <Route path="/" element={<Warehouse />} />
            <Route path="/zamowienia" element={<Orders />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
