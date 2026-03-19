import BusinessDashboard from "../components/Business/BusinessDashboard";
import Navbar from "../components/Navbar"


const Business = () => {
    return (
        <>
            <div className="container">
            <div className="display">
                <Navbar/>
                <BusinessDashboard />
            </div>
            </div>
        </>
    )
}

export default Business;