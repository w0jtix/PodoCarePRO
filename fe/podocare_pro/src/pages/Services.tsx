import Navbar from "../components/Navbar";
import ServicesDashboard from "../components/Services/ServicesDashboard";

const Services = () => {
    return(
        <>
            <div className="container">
                <div className="display">
                    <Navbar />
                    <ServicesDashboard />
                </div>
            </div>
        </>
    )
}

export default Services;