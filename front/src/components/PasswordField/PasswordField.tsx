interface PasswordFieldProps {
  label: string;
  value: string;
  error?: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  strength?: number;
}

export default function PasswordField({
  label,
  value,
  error,
  show,
  onToggle,
  onChange,
  strength,
}: PasswordFieldProps) {
  const getStrengthColor = (s: number) => {
    switch (s) {
      case 0:
      case 1:
        return "#ef4444"; // Red
      case 2:
        return "#f59e0b"; // Orange
      case 3:
        return "#3b82f6"; // Blue
      case 4:
        return "#22c55e"; // Green
      default:
        return "#e2e8f0";
    }
  };

  const getStrengthLabel = (s: number) => {
    switch (s) {
      case 0:
      case 1:
        return "Faible";
      case 2:
        return "Moyen";
      case 3:
        return "Fort";
      case 4:
        return "Très fort";
      default:
        return "";
    }
  };

  return (
    <div className="authField">
      <label className="authLabel">{label}</label>
      <div className="authPasswordWrap" style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="authInput authInputPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          style={{ paddingRight: "40px" }}
        />
        <button
          type="button"
          className="authEyeBtn"
          onClick={onToggle}
          aria-label={show ? "Masquer" : "Afficher"}
          style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <img
            src={show ? "/icons/eye-off.svg" : "/icons/eye.svg"}
            alt=""
            style={{ width: "20px", height: "20px", opacity: 0.6 }}
          />
        </button>
      </div>

      {strength !== undefined && value.length > 0 && (
        <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(strength / 4) * 100}%`, backgroundColor: getStrengthColor(strength), transition: "all 0.3s ease" }} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 500, color: getStrengthColor(strength), minWidth: "55px", textAlign: "right" }}>
            {getStrengthLabel(strength)}
          </span>
        </div>
      )}
      {error && <div className="authError">{error}</div>}
    </div>
  );
}