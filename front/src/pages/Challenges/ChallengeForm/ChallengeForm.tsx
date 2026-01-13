import { useState, type ChangeEvent, type FormEvent, type SetStateAction} from "react";
import "./ChallengeForm.css";
import Input from "../../../components/Input/Input.tsx";
import Button from "../../../components/Button/Button.tsx";

export interface ChallengeFormData {
  title: string;
  difficulty: number;
  points: number;
  description: string;
  files: File[];
  answer: string;
}

interface ChallengeFormProps {
  onSubmit: (data: ChallengeFormData) => void;
}

export default function ChallengesForm({ onSubmit }: ChallengeFormProps) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [answer, setAnswer] = useState("");

  const points = difficulty * 20;


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ title, difficulty, points, description, files, answer });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files!);
      setFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset value to allow selecting the same file again if needed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>

      <h2>Créer un nouveau challenge</h2>

      <label className="form-label">Titre</label>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Titre du challenge..."
        maxLength={30}
      />

      <label className="form-label">Difficulté du challenge</label>
      <div className="difficulty-container">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setDifficulty(star)}
              className={`star ${star <= difficulty ? "filled" : ""}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="points-display">{points} pts</span>
      </div>

      <label className="form-label">Description</label>
      <Input
        as="textarea"
        placeholder="Description du challenge..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        required
        className="form-textarea"
      />

      <label className="form-label">Importer le challenge</label>
      <input
        id="fileUpload"
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden-file-input"
      />
      <label htmlFor="fileUpload" className="file-upload-link">
        Ajouter des fichiers
      </label>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, index) => (
            <li key={index}>
              {f.name}
              <span className="remove-file" onClick={() => removeFile(index)}>
                &times;
              </span>
            </li>
          ))}
        </ul>
      )}

      <label className="form-label">Réponse</label>
      <Input
        type="text"
        value={answer}
        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setAnswer(e.target.value)}
        required
        placeholder="Réponse du challenge..."
      />
      <Button
        type="submit"
        disabled={!title || !description || !answer || difficulty === 0 || files.length === 0}
      >
        Post Challenge
      </Button>
    </form>
  );
}
