import { useState, useEffect } from "react";
import { UserService } from "../Service/UserService";
import Sidebar from "../components/Sidebar/Sidebar";
import ChallengeCard from "../components/ChallengeCard/ChallengeCard";
import "./Profile.css";
import Input from "../components/Input/Input";
import ScoreRow from "../components/ScoreRow/ScoreRow";
import { ChallengeService, type Challenge } from "../Service/ChallengeService";

const DIFFICULTY_MAP: Record<string, { points: number; level: number }> = {
  VERY_EASY: { points: 20, level: 1 },
  EASY: { points: 40, level: 2 },
  MEDIUM: { points: 60, level: 3 },
  HARD: { points: 80, level: 4 },
  VERY_HARD: { points: 100, level: 5 },
};

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";

    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Demo data: 18 challenges with first 6 resolved
const challenges = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  category: "Web",
  points: 75,
  title: `Nom du challenge ${i + 1}`,
  difficulty: (i % 5) + 1,
  isResolved: i < 6, // first 6 resolved, rest not
}));

type UserModel = {
  fullName: string;
  email: string;
  solved: number;
  score: number;
};

export default function Profile() {
  const [showResolved, setShowResolved] = useState(false);
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  

  useEffect(() => {
      ChallengeService.getLatest()
        .then((data) => {
          if (Array.isArray(data)) {
            setChallenges(data);
          }
        })
        .catch((err) => console.error("Erreur chargement challenges:", err));
    }, []);
  

  useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      // 1) tentative fullName depuis cache (set au register)
      const cachedFullName = localStorage.getItem("fullName");

      // 2) tentative fullName depuis JWT
      const token = localStorage.getItem("token");
      const payload = token ? decodeJwtPayload(token) : null;
      const jwtFullName =
        payload?.fullname || payload?.fullName || payload?.name || null;

      // 3) appel /users/me pour email + stats
      const model = await UserService.loadCurrentUser();
      if (!mounted) return;

      const data: any = (model as any)?.data ?? model;
      if (!data) {
        setLoadError("Aucune donnée utilisateur");
        return;
      }

      const email = data.email || "";
      const solved = data.completedChallenges?.length ?? 0;
      const score = data.totalChallengePoints ?? 0;

      // IMPORTANT: username = email chez toi => on ne l’utilise pas comme nom
      const displayName =
        cachedFullName ||
        jwtFullName ||
        "Utilisateur";

      setUser({
        fullName: displayName,
        email,
        solved,
        score,
      });
    } catch (e) {
      console.warn("Profile: failed to load current user", e);
      if (mounted) setLoadError("Impossible de charger l’utilisateur");
    } finally {
      if (mounted) setIsLoading(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, []);

  const filteredChallenges = challenges.filter((c) =>
    showResolved ? c.isResolved : !c.isResolved
  );

  return (
    <div className="profileLayout">
      <Sidebar />
      <main className="profilePage">
        <h1 className="profileTitle">Mon profil</h1>
        <section className="profileGrid">
          <div className="profileLeft">
            <div className="profileCard">
              <div className="profileAvatarWrapper">
                <div className="profileAvatar" />
              </div>
              <div className="profileName">
                {isLoading ? "Chargement..." : loadError ? "Utilisateur" : user?.fullName}
              </div>
              <div className="profileInfo">
                <div className="profileInfoTitle">Information</div>
                <div className="profileInfoLabel">Email</div>
                <Input
                  className="authInput"
                  type="email"
                  value={isLoading || loadError ? "" : user?.email ?? ""}
                  readOnly
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="profileIllustration">
              <img src="/Illustration profile page.svg" alt="Profile Illustration" />
            </div>
          </div>

          <div className="profileRight">
            <div className="profileStatsBanner">
              <ScoreRow
              rank={1}
              fullName={user?.fullName ?? "Utilisateur"}
              solved={user?.solved ?? 0}
              score={user?.score ?? 0}
              compact
            />
            </div>

            <div className="profileChallengesWrapper">
              <div className="profileHeaderRow">
                <h2 className="profileChallengesTitle">Challenges</h2>
                <div className="profileTabsWrapper">
                  <div className="profileTabs">
                    <div
                      className="profileTabSlider"
                      style={{
                        transform: showResolved ? "translateX(0%)" : "translateX(100%)"
                      }}
                    />
                    <button
                      className={"profileTab" + (showResolved ? " profileTabActive" : "")}
                      onClick={() => setShowResolved(true)}
                    >
                      Résolu
                    </button>
                    <button
                      className={"profileTab" + (!showResolved ? " profileTabActive" : "")}
                      onClick={() => setShowResolved(false)}
                    >
                      Non résolu
                    </button>
                  </div>
                </div>
              </div>

              <div className="profileChallengesGrid">
                {filteredChallenges.map((c) => (
                  <ChallengeCard 
                  key={c.id}
                  category={c.category}
                  points={DIFFICULTY_MAP[c.difficulty]?.points || 0}
                  title={c.title}
                  difficulty={DIFFICULTY_MAP[c.difficulty]?.level || 0}
                  isResolved={c.isResolved ?? false} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
