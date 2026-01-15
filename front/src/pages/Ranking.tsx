import { useState, useEffect } from "react";
import ScoreRow from "../components/ScoreRow/ScoreRow";
import Modal from "../components/Modal/Modal";
import ProfileModalContent from "../components/ProfileModalContent/ProfileModalContent";
import "./Ranking.css";
import { AuthService } from "../Service/AuthService";
import { UserModel } from "../types/User";
import { UserService } from "../Service/UserService";

type RankingPlayer = {
  id: string;
  rank: number;
  fullName: string;
  solved: number;
  score: number;
};

// Compute dense ranks: equal scores share the same rank; ranks increase by 1
function computeRanks(list: Omit<RankingPlayer, "rank">[]): RankingPlayer[] {
  // sort by score desc, then by solved desc to stabilize order
  const sorted = [...list].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.solved - a.solved;
  });

  const result: RankingPlayer[] = [];
  let currentRank = 0;
  let lastScore: number | null = null;

  for (const item of sorted) {
    if (lastScore === null || item.score !== lastScore) {
      currentRank += 1;
      lastScore = item.score;
    }
    result.push({ ...item, rank: currentRank });
  }

  return result;
}

export default function Ranking() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [players, setPlayers] = useState<RankingPlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load users from backend if available, otherwise use fallbackData
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const resp = await AuthService.apiCall("/users");
        if (resp && resp.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("fullName");
          window.location.href = "/login";
          return;
        }
        if (!resp || !resp.ok) throw new Error("no users endpoint");
        const data = await resp.json();

        // Expecting array of users
        if (!Array.isArray(data)) throw new Error("unexpected users response");

        const mapped = data.map((u: any) => {
          const user = UserModel.fromApi(u).toPlain();
          return {
            id: user.id ?? "",
            fullName: user.fullname ?? user.username ?? "Utilisateur",
            solved: Array.isArray(user.completedChallenges) ? user.completedChallenges.length : 0,
            score: typeof user.totalChallengePoints === "number" ? user.totalChallengePoints : 0,
          } as Omit<RankingPlayer, "rank">;
        });

        try {
          const currentUser = await UserService.loadCurrentUser();
          const userData = (currentUser as any).data || currentUser;
          if (userData?.id) setCurrentUserId(userData.id);
        } catch (e) {
          console.warn("Ranking: failed to load current user", e);
        }

        if (!mounted) return;

        setPlayers(computeRanks(mapped));
      } catch (e) {
        console.warn("Ranking: failed to load users", e);
        if (!mounted) return;
        setPlayers([]);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const openProfile = (id?: string) => {
    if (!id) return;
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const closeProfile = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };
  return (
    <div className="rankingLayout">
      <main className="rankingPage">
        <h1 className="rankingTitle">Scoreboard</h1>

        <div className="rankingListWrapper">
          <section className="rankingList">
            {players.map((p) => (
              <ScoreRow
                key={p.id}
                id={p.id}
                rank={p.rank}
                fullName={p.fullName}
                solved={p.solved}
                score={p.score}
                onClick={openProfile}
                isCurrentUser={p.id === currentUserId}
              />
            ))}
          </section>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeProfile}>
          {selectedUserId ? (
            <ProfileModalContent userId={selectedUserId} onClose={closeProfile} />
          ) : null}
        </Modal>

      </main>
    </div>
  );
}
