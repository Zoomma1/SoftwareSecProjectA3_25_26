import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Challenges from "./pages/Challenges.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Ranking from "./pages/Ranking.tsx";
import ChallengeDetail from "./pages/ChallengeDetail.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path="/" element={<Navigate to="/challenges" replace />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
