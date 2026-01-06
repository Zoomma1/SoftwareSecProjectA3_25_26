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
          <img src="/icons/Icon challenges.svg" alt="Challenges" className="sidebar-icon sidebar-icon-default" />
          <img src="/icons/Icon challenges purple.svg" alt="Challenges" className="sidebar-icon sidebar-icon-active" />
          <span>Challenges</span>
        </NavLink>
        
        <NavLink to="/ranking" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <img src="/icons/Icon Scoreboard.svg" alt="Scoreboard" className="sidebar-icon sidebar-icon-default" />
          <img src="/icons/Icon Scoreboard purple.svg" alt="Scoreboard" className="sidebar-icon sidebar-icon-active" />
          <span>Scoreboard</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <img src="/icons/Icon Profil.svg" alt="Profil" className="sidebar-icon sidebar-icon-default" />
          <img src="/icons/Icon Profil purple.svg" alt="Profil" className="sidebar-icon sidebar-icon-active" />
          <span>Profil</span>
        </NavLink>

        <button className="sidebar-button" onClick={handleLogout}>
          <img src="/icons/Icon deconnexion.svg" alt="Déconnexion" className="sidebar-icon sidebar-icon-default" />
          <img src="/icons/Icon deconnexion purple.svg" alt="Déconnexion" className="sidebar-icon sidebar-icon-active" />
          <span>Déconnexion</span>
        </button>
      </nav>
      <Outlet />
    </>
  );
}
