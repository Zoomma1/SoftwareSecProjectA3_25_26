import { useEffect, useState } from "react";
import { AuthService } from "../../Service/AuthService";
import ScoreRow from "../ScoreRow/ScoreRow";
import ChallengeCard from "../ChallengeCard/ChallengeCard";
import "../../pages/Profile.css";

type Props = {
  userId: string;
  onClose?: () => void;
};

type ApiUser = {
  fullName?: string;
  username?: string;
  email?: string;
  completedChallenges?: any[];
  totalChallengePoints?: number;
};

export default function ProfileModalContent({ userId }: Props) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await AuthService.apiCall(`/users/${userId}`);
        if (!resp || !resp.ok) {
          setUser(null);
          return;
        }
        const data = await resp.json();
        if (!mounted) return;
        setUser(data);
      } catch (e) {
        console.warn("ProfileModalContent: failed to load user", e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const solved = user?.completedChallenges?.length ?? 0;
  const score = user?.totalChallengePoints ?? 0;

  function getDisplayName(u: ApiUser | null) {
    if (!u) return "Utilisateur";
    return (
      u.fullName || u.username || (u.email ? u.email.split("@")[0] : "Utilisateur")
    );
  }

  const challenges = (user?.completedChallenges ?? []).map((c: any, i: number) => ({
    id: c.id ?? i,
    category: c.category ?? "",
    points: c.points ?? (c.value ?? 0),
    title: c.title ?? c.name ?? "Challenge",
    difficulty: c.difficulty ?? 1,
    isResolved: true,
  }));

  return (
    <div className="profileModalContent">
      <div className="profileRight">
        <div className="profileStatsBanner">
          <ScoreRow
            rank={0}
            fullName={loading ? "Chargement..." : getDisplayName(user)}
            solved={solved}
            score={score}
            compact
          />
        </div>

        <div className="profileChallengesWrapper">
          <div className="profileHeaderRow">
            <h2 className="profileChallengesTitle">Challenges</h2>
          </div>

          <div className="profileChallengesGrid">
            {loading ? (
              <div>Chargement...</div>
            ) : challenges.length > 0 ? (
              challenges.map((c) => <ChallengeCard key={c.id} {...c} />)
            ) : (
              <div>Aucun challenge disponible</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
