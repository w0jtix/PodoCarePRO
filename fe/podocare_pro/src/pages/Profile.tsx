import Navbar from "../components/Navbar"
import { ProfileDashboard } from "../components/Profile/ProfileDashboard"

const Profile = () => {
    return (
        <>
        <div className="container">
            <div className="display">
                <Navbar />
                <ProfileDashboard />
            </div>
        </div>
        </>
    )
}

export default Profile;