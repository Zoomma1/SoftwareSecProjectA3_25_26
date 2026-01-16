import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { ChallengeService, type Challenge } from "../Service/ChallengeService";
import "./ChallengeDetail.css";

const DIFFICULTY_MAP: Record<string, { points: number; level: number }> = {
  VERY_EASY: { points: 20, level: 1 },
  EASY: { points: 40, level: 2 },
  MEDIUM: { points: 60, level: 3 },
  HARD: { points: 80, level: 4 },
  VERY_HARD: { points: 100, level: 5 },
};

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ChallengeService.getById(Number(id));
        if (!mounted) return;
        setChallenge(data);
      } catch (e: any) {
        if (!mounted) return;
        console.error("Failed to load challenge", e);
        setError(e?.message || "Erreur lors du chargement");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id]);

  const filledStars = (() => {
    if (!challenge) return 0;
    const level = DIFFICULTY_MAP[challenge.difficulty]?.level ?? 0;
    return level;
  })();

  const points = challenge ? (DIFFICULTY_MAP[challenge.difficulty]?.points ?? 0) : 0;

  return (
    <div className="challenge-page">
      <Sidebar />

      <main className="challenge-main">
        <h1 className="page-heading">Challenge details</h1>

        <div className="challenge-card">
          {loading && <div>Chargement...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}

          {!loading && challenge && (
            <>
              <div className="challenge-header">
                <div className="category-pill">{challenge.category}</div>
              </div>

              <div className="challenge-top-row">
                <div>
                  <h2 className="challenge-title">{challenge.title} <span className="status-badge">{challenge.isResolved ? 'Résolu' : 'Non résolu'}</span></h2>
                </div>

                <div className="challenge-meta">
                  <div style={{ display: 'flex', gap: 6 }} className="stars" aria-hidden>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={star <= filledStars ? "#fbbf24" : "none"}
                        stroke={star <= filledStars ? "#fbbf24" : "#e2e8f0"}
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <div className="points">{points} pt</div>
                </div>
              </div>

              <div className="challenge-desc">
                <div dangerouslySetInnerHTML={{ __html: challenge.description || '' }} />
              </div>

              <div className="solution-area">
                <textarea className="solution-box" placeholder="Entrez votre réponse ici..." defaultValue={challenge.solution ?? ''} />
              </div>

              <div className="challenge-actions">
                <button className="btn btn-primary">Valider</button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/challenges')}>Quitter</button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}