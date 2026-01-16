import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { AuthService } from "../Service/AuthService";

type FormState = {
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function calculateStrength(pwd: string): number {
  let score = 0;
  if (!pwd) return 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = [
    { label: "8 caractères minimum", met: form.password.length >= 8 },
    { label: "Une majuscule", met: /[A-Z]/.test(form.password) },
    { label: "Une minuscule", met: /[a-z]/.test(form.password) },
    { label: "Un chiffre", met: /[0-9]/.test(form.password) },
  ];

  const canSubmit = useMemo(() => {
    const hasUpperCase = /[A-Z]/.test(form.password);
    const hasLowerCase = /[a-z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);

    return (
      form.lastName.trim() &&
      form.firstName.trim() &&
      isEmailValid(form.email) &&
      form.password.length >= 8 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      form.confirmPassword.length >= 8 &&
      form.password === form.confirmPassword
    );
  }, [form]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.lastName.trim()) e.lastName = "Nom requis";
    if (!form.firstName.trim()) e.firstName = "Prénom requis";
    if (!form.email.trim()) e.email = "Email requis";
    else if (!isEmailValid(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    else if (form.password.length < 8) e.password = "8 caractères minimum";
    else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = "Doit contenir majuscule, minuscule et chiffre";
    if (!form.confirmPassword) e.confirmPassword = "Confirmation requise";
    else if (form.confirmPassword.length < 8) e.confirmPassword = "8 caractères minimum";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      e.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    return e;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const eMap = validate();
    if (Object.keys(eMap).length) {
      setErrors(eMap);
      return;
    }

    setIsSubmitting(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(form.password.trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      await AuthService.register({
        email: form.email.trim(),
        password: hashedPassword,
        username: `${form.firstName.trim()} ${form.lastName.trim()}`,
        fullname: `${form.firstName.trim()} ${form.lastName.trim()}`,
      });

      localStorage.setItem("fullName", fullName);

      // Auto-login and redirect to challenges
      await AuthService.login({
        email: form.email.trim(),
        password: hashedPassword,
      });
      navigate("/challenges");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="authPage">
      <div className="authCard authRegister">
        <div className="authLeft">
          <div className="authIllustration">
            <img
              src="/register-illustration.png"
              alt="Illustration register"
              className="authIllustrationImg"
            />
          </div>
        </div>

        {/* Colonne droite (form) */}
        <div className="authRight authRegisterForm">
          <div className="authTitleRow">
            <h1 className="authTitle">S'inscrire</h1>
            <div className="authLogoInline" aria-hidden />
          </div>

          <form onSubmit={onSubmit} className="authForm" noValidate>
            <div className="authRow2">
              <Field
                label="Nom"
                placeholder="Nom"
                value={form.lastName}
                error={errors.lastName}
                onChange={(v) => setField("lastName", v)}
              />
              <Field
                label="Prénom"
                placeholder="Prénom"
                value={form.firstName}
                error={errors.firstName}
                onChange={(v) => setField("firstName", v)}
              />
            </div>

            <Field
              label="Email"
              placeholder="votre@email.com"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(v) => setField("email", v)}
            />

            <PasswordField
              label="Mot de passe"
              value={form.password}
              error={errors.password}
              show={showPwd}
              onToggle={() => setShowPwd((s) => !s)}
              onChange={(v) => setField("password", v)}
              strength={calculateStrength(form.password)}
            />

            <div style={{ marginTop: "8px", marginBottom: "16px", fontSize: "0.85rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {passwordRequirements.map((req, i) => (
                <div key={i} style={{ color: req.met ? "#22c55e" : "#64748b", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }}>
                  <span style={{ fontSize: "1.1em" }}>{req.met ? "✓" : "○"}</span>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>

            <PasswordField
              label="Confirmation mot de passe"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              show={showConfirmPwd}
              onToggle={() => setShowConfirmPwd((s) => !s)}
              onChange={(v) => setField("confirmPassword", v)}
            />

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="authPrimaryBtn"
              style={{ opacity: !canSubmit || isSubmitting ? 0.6 : 1, cursor: !canSubmit || isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Création..." : "S'inscrire"}
            </button>

            <p className="authBottomText">
              J'ai déjà un compte ?{" "}
              <Link to="/login" className="authInlineLink">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  const { label, placeholder, value, error, type = "text", onChange } = props;

  return (
    <div className="authField">
      <label className="authLabel">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="authInput"
      />
      {error ? <div className="authError">{error}</div> : null}
    </div>
  );
}

function PasswordField(props: {
  label: string;
  value: string;
  error?: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  strength?: number;
}) {
  const { label, value, error, show, onToggle, onChange, strength } = props;

  // Determine color based on strength (0-5)
  const getStrengthColor = (s: number) => {
    if (s <= 2) return "#ef4444"; // Red
    if (s === 3) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  const strengthPercent = Math.min(100, Math.max(0, ((strength || 0) / 5) * 100));

  return (
    <div className="authField">
      <label className="authLabel">{label}</label>
      <div className="authPasswordWrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder="••••••••••"
          onChange={(e) => onChange(e.target.value)}
          className="authInput authInputPassword"
        />

        <button type="button" onClick={onToggle} className="authEyeBtn" aria-label="toggle password">
          <img
            src={show ? "/icons/eye-off.svg" : "/icons/eye.svg"}
            alt={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="authEyeIcon"
          />
        </button>
      </div>

      {strength !== undefined && value.length > 0 && (
        <div style={{ marginTop: "8px", height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${strengthPercent}%`,
              background: getStrengthColor(strength || 0),
              transition: "width 0.3s ease, background-color 0.3s ease"
            }}
          />
        </div>
      )}

      {error ? <div className="authError">{error}</div> : null}
    </div>
  );
}
