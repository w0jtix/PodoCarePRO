import ClientsDashboard from "../components/Clients/ClientsDashboard";
import Navbar from "../components/Navbar";

const Clients = () => {
    return(
        <>
        <div className="container">
            <div className="display">
                <Navbar/>
                <ClientsDashboard />
            </div>
        </div>
        </>
    )
} 
export default Clients;