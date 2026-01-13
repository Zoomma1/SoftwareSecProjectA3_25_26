import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChallengeCard from "../components/ChallengeCard/ChallengeCard";
import "./Profile.css";
import Input from "../components/Input/Input";
import ScoreRow from "../components/ScoreRow/ScoreRow";

const user = {
  fullName: "Nom Prénom",
  email: "email@gmail.com",
  solved: 6,
  score: 75,
};

// Demo data: 18 challenges with first 6 resolved
const challenges = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  category: "Web",
  points: 75,
  title: `Nom du challenge ${i + 1}`,
  difficulty: (i % 5) + 1,
  isResolved: i < 6, // first 6 resolved, rest not
}));

export default function Profile() {
  const [showResolved, setShowResolved] = useState(false);

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
                <button className="profileEditBtn">
                  <img src="/icons/edit.svg" alt="Edit" />
                </button>
              </div>
              <div className="profileName">{user.fullName}</div>
              <div className="profileInfo">
                <div className="profileInfoTitle">Information</div>
                <div className="profileInfoLabel">Email</div>
                <Input
                  className="authInput"
                  type="email"
                  value={user.email}
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
              <ScoreRow rank={1} fullName={user.fullName} solved={user.solved} score={user.score} compact />
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
                  <ChallengeCard key={c.id} {...c} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
