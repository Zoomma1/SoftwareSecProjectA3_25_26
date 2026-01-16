import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Input from "../components/Input/Input";
import { AuthService } from "../Service/AuthService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await AuthService.login({ email, password });
      navigate("/challenges");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
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
            {error && <div className="authError" style={{ marginBottom: "1rem" }}>{error}</div>}
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

            <button className="authPrimaryBtn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
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
