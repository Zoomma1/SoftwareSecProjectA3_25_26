import { Link, Outlet } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const handleLogout = async () => {
    //TODO: implement logout functionality
  };

  return (
    <>
      <nav className="sidebar-nav">
        
        <Link to="/challenges">
          <div className="authLogo" aria-hidden></div>
        </Link>

        <div className="sidebar-section">
          <Link to="/challenges" className="sidebar-link">Challenges</Link>
        </div>
        <div className="sidebar-section">
          <Link to="/ranking" className="sidebar-link">Ranking</Link>
        </div>
        <div className="sidebar-section">
          <Link to="/profile" className="sidebar-link">Profile</Link>
        </div>

        <div className="sidebar-section">
          <button className="sidebar-button" onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
