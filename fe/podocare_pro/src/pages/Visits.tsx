import Navbar from "../components/Navbar";
import VisitDashboard from "../components/Visit/VisitDashboard";

const Visits = () => {
    return(
        <>
                <div className="container">
                    <div className="display">
                        <Navbar/>
                        <VisitDashboard />
                    </div>
                </div>
                </>
    )
}
export default Visits;