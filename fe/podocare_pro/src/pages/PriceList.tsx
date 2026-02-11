import Navbar from "../components/Navbar";
import PriceListDashboard from "../components/PriceList/PriceListDashboard";

const PriceList = () => {
    return(
        <>
            <div className="container">
                <div className="display">
                    <Navbar/>
                    <PriceListDashboard />
                </div>
            </div>
        </>
    )
}

export default PriceList;