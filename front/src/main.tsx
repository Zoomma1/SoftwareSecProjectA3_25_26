import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import Challenges from "./pages/Challenges/Challenges.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Ranking from "./pages/Ranking.tsx";
import ChallengeDetail from "./pages/ChallengeDetail.tsx";
import "./index.css";
import Sidebar from "./components/Sidebar/Sidebar.tsx";
import { AuthProvider } from "./Service/AuthContext.tsx";
import Profile from "./pages/Profile.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MemoryRouter>
      <AuthProvider>
          <Routes>
            <Route element={<Sidebar />}>
            <Route path="/" element={<Navigate to="/challenges" replace />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/profile" element={<Profile/>} />
            </Route>
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
      </AuthProvider>
    </MemoryRouter>
  </React.StrictMode>
);
