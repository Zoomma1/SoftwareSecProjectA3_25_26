import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { ChallengeService, type Challenge } from "../Service/ChallengeService";
import { UserService } from "../Service/UserService";
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
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [data, userModel] = await Promise.all([
          ChallengeService.getById(Number(id)),
          UserService.loadCurrentUser(),
        ]);

        if (!mounted) return;

        const userData = (userModel as any)?.data ?? userModel;
        const completedChallenges: any[] = Array.isArray(userData?.completedChallenges) ? userData.completedChallenges : [];
        if (completedChallenges.some((cId) => Number(cId) === Number(data.id))) {
          data.isResolved = true;
        }

        setChallenge(data);
        if (data.isResolved && data.solution) {
          setSolution(data.solution);
        } else {
          setSolution("");
        }
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

  const handleValidate = async () => {
    if (!challenge) return;
    setIsSubmitting(true);
    setValidationResult(null);

    try {
      const success = await ChallengeService.validate(challenge.id, solution);
      if (success == true) {
        fireConfetti();
        setValidationResult({ success: true, message: "Bravo ! Challenge validé avec succès." });
        setChallenge((prev) => (prev ? { ...prev, isResolved: true } : null));
        await UserService.loadCurrentUser();
      } else if (success == false) {
        setValidationResult({ success: false, message: "Mauvaise réponse. Réessayez !" });
      }
    } catch (err: any) {
      setValidationResult({ success: false, message: err.message || "Erreur lors de la validation." });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <h2 className="challenge-title">{challenge.title} <span className={`status-badge ${challenge.isResolved ? 'resolved' : ''}`}>{challenge.isResolved ? 'Résolu' : 'Non résolu'}</span></h2>
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
                <textarea
                  className="solution-box"
                  placeholder="Entrez votre réponse ici..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  disabled={isSubmitting || challenge.isResolved}
                />
              </div>

              {validationResult && (
                <div style={{ marginBottom: "1rem", color: validationResult.success ? "#22c55e" : "#ef4444", fontWeight: 500 }}>
                  {validationResult.message}
                </div>
              )}

              <div className="challenge-actions">
                <button className="btn btn-primary" onClick={handleValidate} disabled={isSubmitting || challenge.isResolved}>
                  {isSubmitting ? "Validation..." : (challenge.isResolved ? "Déjà validé" : "Valider")}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Quitter</button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; vRotation: number; opacity: number }[] = [];
  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

  // Create particles
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p) => {
      if (p.opacity > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.vx *= 0.96; // Air resistance
        p.vy *= 0.96;
        p.rotation += p.vRotation;
        p.opacity -= 0.008;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      window.removeEventListener("resize", resize);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  };

  animate();
}