import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";
import Input from "../components/Input/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: brancher API login ici
    console.log({ email, password, remember });
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

              {/* route /forgot-password (create page if missing) */}
              <Link to="/forgot-password" className="authLinkBtn">
                Mot de passe oublié ?
              </Link>
            </div>

            <button className="authPrimaryBtn" type="submit">
              Se connecter
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
