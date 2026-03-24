import Navbar from '../components/Navbar'
import CashLedgerDashboard from '../components/CashLedger/CashLedgerDashboard'

const CashRegistry = () => {
  return (
    <>
        <div className="container">
            <div className="display">
                <Navbar />
                <CashLedgerDashboard />
            </div>
        </div>
    </>
  )
}

export default CashRegistry;