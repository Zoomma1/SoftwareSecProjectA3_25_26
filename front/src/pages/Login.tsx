import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Input from "../components/Input/Input";
import { AuthService } from "../Service/AuthService";

const LOCKOUT_DURATION = 60;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("remember_email") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => !!localStorage.getItem("remember_email"));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(() => {
    const lockoutUntil = localStorage.getItem("auth_lockout_until");
    if (lockoutUntil) {
      const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/challenges");
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lockoutUntil = localStorage.getItem("auth_lockout_until");
      if (lockoutUntil) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
        setLockoutTimer(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          localStorage.removeItem("auth_lockout_until");
          localStorage.removeItem("auth_attempts");
        }
      } else {
        setLockoutTimer(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockoutTimer > 0) return;

    setIsSubmitting(true);
    try {
      await AuthService.login({ email, password });

      if (remember) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      localStorage.removeItem("auth_attempts");
      localStorage.removeItem("auth_lockout_until");
      navigate("/challenges");
    } catch (err: any) {
      const attempts = parseInt(localStorage.getItem("auth_attempts") || "0", 10) + 1;
      localStorage.setItem("auth_attempts", attempts.toString());
      if (attempts >= 5) {
        localStorage.setItem("auth_lockout_until", (Date.now() + LOCKOUT_DURATION * 1000).toString());
        setLockoutTimer(LOCKOUT_DURATION);
        setError("Trop de tentatives. Compte bloqué pour 1 minute.");
      } else {
        const remaining = 5 - attempts;
        setError(`${err.message || "Erreur lors de la connexion"} (${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""})`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        {/* LEFT */}
        <div className="authLeft">
          <div className="authLogo" aria-hidden />

          <h1 className="authTitle">Se connecter</h1>
          <p className="authSubtitle">Prêt à faire des challenges ?</p>

          <form className="authForm" onSubmit={onSubmit}>
            <label className="authLabel">
              Email
              <Input
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="authLabel">
              Mot de passe
              <div className="authPasswordWrap">
                <Input
                  className="authInput authInputPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="authEyeBtn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  title={showPassword ? "Masquer" : "Afficher"}
                >
                    {/* svg icons from public/icons */}
                    <img
                      src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                      alt={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="authEyeIcon"
                    />
                </button>
              </div>
            </label>

            <div className="authRowBetween">
              <label className="authCheckbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            {error && <div className="authError" style={{ marginBottom: "1rem" }}>{error}</div>}

            <button
              className="authPrimaryBtn"
              type="submit"
              disabled={isSubmitting || lockoutTimer > 0}
              style={{ opacity: isSubmitting || lockoutTimer > 0 ? 0.7 : 1, position: "relative", overflow: "hidden" }}
            >
              {lockoutTimer > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${(lockoutTimer / LOCKOUT_DURATION) * 100}%`,
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    transition: "width 1s linear",
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>
                {lockoutTimer > 0 ? `Réessayer dans ${lockoutTimer}s` : (isSubmitting ? "Connexion..." : "Se connecter")}
              </span>
            </button>

            <p className="authBottomText">
              Je n’ai pas de compte ?{" "}
              <Link className="authInlineLink" to="/register">
                Créer un compte
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT */}
        <div className="authRight">
          <div className="authIllustration">
            <img
              src="/auth-illustration.png"
              alt="Illustration sécurité"
              className="authIllustrationImg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
