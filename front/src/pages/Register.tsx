import { useMemo, useState } from "react";
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

  const canSubmit = useMemo(() => {
    return (
      form.lastName.trim() &&
      form.firstName.trim() &&
      isEmailValid(form.email) &&
      form.password.length >= 8 &&
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
    if (!form.confirmPassword) e.confirmPassword = "Confirmation requise";
    else if (form.confirmPassword.length < 8) e.confirmPassword = "8 caractères minimum";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      e.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const eMap = validate();
    if (Object.keys(eMap).length) {
      setErrors(eMap);
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.register({
        email: form.email.trim(),
        password: form.password.trim(),
        username: form.email.trim().toLowerCase(),
        fullname: `${form.firstName.trim()} ${form.lastName.trim()}`,
      });

      // MVP: redirection login
      navigate("/login");
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
            />

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
}) {
  const { label, value, error, show, onToggle, onChange } = props;

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

      {error ? <div className="authError">{error}</div> : null}
    </div>
  );
}
