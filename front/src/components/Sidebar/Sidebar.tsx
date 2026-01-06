import { Link, NavLink, Outlet } from "react-router-dom";
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

        <NavLink to="/challenges" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <div className="sidebar-section">Challenges</div>
        </NavLink>
        
        <NavLink to="/ranking" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <div className="sidebar-section">Ranking</div>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <div className="sidebar-section">Profile</div>
        </NavLink>

        <div className="sidebar-section">
          <button className="sidebar-button" onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
