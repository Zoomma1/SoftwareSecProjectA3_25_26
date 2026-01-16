import { useEffect, useState } from "react";
import { AuthService } from "../../Service/AuthService";
import { ChallengeService, type Challenge } from "../../Service/ChallengeService";
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

const DIFFICULTY_MAP: Record<string, { points: number; level: number }> = {
  VERY_EASY: { points: 20, level: 1 },
  EASY: { points: 40, level: 2 },
  MEDIUM: { points: 60, level: 3 },
  HARD: { points: 80, level: 4 },
  VERY_HARD: { points: 100, level: 5 },
};

export default function ProfileModalContent({ userId }: Props) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [challengesList, setChallengesList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resp, challengesData] = await Promise.all([
          AuthService.apiCall(`/users/${userId}`),
          ChallengeService.getLatest(),
        ]);

        if (!resp || !resp.ok) {
          setUser(null);
        } else {
          const data = await resp.json();
          if (mounted) setUser(data);
        }

        if (mounted && Array.isArray(challengesData)) {
          setChallengesList(challengesData);
        }
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

  const completedIds = user?.completedChallenges || [];
  const resolvedChallenges = challengesList.filter((c) =>
    completedIds.some((id: any) => {
      const compId = typeof id === "object" ? id.id : id;
      return Number(compId) === Number(c.id);
    })
  );

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
            ) : resolvedChallenges.length > 0 ? (
              resolvedChallenges.map((c) => <ChallengeCard                 
                key={c.id}
                id={c.id}
                category={c.category}
                points={DIFFICULTY_MAP[c.difficulty]?.points || 0}
                title={c.title}
                difficulty={DIFFICULTY_MAP[c.difficulty]?.level || 0}
                isResolved={true}
                hideStatus />)
            ) : (
              <div>Aucun challenge disponible</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
