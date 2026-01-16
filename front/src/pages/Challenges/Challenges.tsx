import { useState, useEffect } from "react";
import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import Modal from "../../components/Modal/Modal"; 
import ChallengesForm, { type ChallengeFormData } from "./ChallengeForm/ChallengeForm";
import CustomSelect from "../../components/CustomSelect/CustomSelect.tsx";
import { ChallengeService, type Challenge } from "../../Service/ChallengeService";
import { UserService } from "../../Service/UserService";
import './Challenges.css';

const DIFFICULTY_MAP: Record<string, { points: number; level: number }> = {
  VERY_EASY: { points: 20, level: 1 },
  EASY: { points: 40, level: 2 },
  MEDIUM: { points: 60, level: 3 },
  HARD: { points: 80, level: 4 },
  VERY_HARD: { points: 100, level: 5 },
};

const CATEGORIES = ["Web", "Infra", "SupplyChain", "Other"];

const CATEGORY_LABELS: Record<string, string> = {
  Web: "Web",
  Infra: "Infrastructure",
  SupplyChain: "Supply Chain",
  Other: "Autre",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  VERY_EASY: "Très facile",
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
  VERY_HARD: "Très difficile",
};

export default function Challenges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  useDisableBodyScroll();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = async (data: ChallengeFormData) => {
    try {
      // Security: Validate file size to prevent DoS
      if (data.files && data.files.length > 0) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        for (const file of data.files) {
          if (file.size > MAX_SIZE) {
            alert(`Le fichier "${file.name}" est trop volumineux (max 5MB).`);
            return;
          }
        }
      }

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("solution", data.answer);
      formData.append("category", data.category);
      formData.append("difficulty", data.difficulty);

      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          formData.append("multipleFiles", file);
        });
      }

      await ChallengeService.createWithFiles(formData);

      // Reset filters to trigger a refresh via useEffect
      setSelectedCategory("");
      setSelectedDifficulty("");
      handleCloseModal();
    } catch (err) {
      console.error("Erreur création challenge:", err);
      alert("Une erreur est survenue lors de la création du challenge.");
    }
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        let data: Challenge[] = [];
        if (selectedCategory === "Other") {
          const sourceData = selectedDifficulty
            ? await ChallengeService.getByDifficulty(selectedDifficulty)
            : await ChallengeService.getLatest();
          data = sourceData.filter((c) => !["Web", "Infra", "SupplyChain"].includes(c.category));
        } else if (selectedCategory && selectedDifficulty) {
          const catData = await ChallengeService.getByCategory(selectedCategory);
          data = catData.filter((c) => c.difficulty === selectedDifficulty);
        } else if (selectedCategory) {
          data = await ChallengeService.getByCategory(selectedCategory);
        } else if (selectedDifficulty) {
          data = await ChallengeService.getByDifficulty(selectedDifficulty);
        } else {
          data = await ChallengeService.getLatest();
        }

        try {
          const userModel = await UserService.loadCurrentUser();
          const userData = (userModel as any)?.data ?? userModel;
          const completedChallenges: any[] = Array.isArray(userData?.completedChallenges) ? userData.completedChallenges : [];

          data = data.map((c) => ({
            ...c,
            isResolved: completedChallenges.some((id) => Number(id) === Number(c.id)),
          }));
        } catch (e) {
          console.warn("Failed to load user data for challenges", e);
        }

        if (Array.isArray(data)) {
          setChallenges(data);
        }
      } catch (err) {
        console.error("Erreur chargement challenges:", err);
      }
    };

    fetchChallenges();
  }, [selectedCategory, selectedDifficulty]);

  return (
    <>
      <div className="body-container">
        <div className="filters-container">
          <CustomSelect
            options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] || c }))}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Toutes les catégories"
          />
          <CustomSelect
            options={Object.keys(DIFFICULTY_MAP).map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] || d }))}
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            placeholder="Toutes les difficultés"
          />
          <CustomSelect
            options={[
              { value: "solved", label: "Résolu" },
              { value: "unsolved", label: "Non résolu" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Tous les statuts"
          />
          <button className="Filter" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
            <img 
              src="/icons/Icon Sort.svg" 
              alt="Sort" 
              className="filter-icon" 
              style={{ transform: sortOrder === 'desc' ? 'scaleY(-1)' : 'none', transition: 'transform 0.3s' }}
            />
          </button>
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <h1 className="title">Challenges</h1>
        <div className="challengeListWrapper">
          <div className="ChallengeGrid">
            {challenges
              .filter((c) => {
                if (!c.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
                if (filterStatus === "solved" && !c.isResolved) return false;
                if (filterStatus === "unsolved" && c.isResolved) return false;
                return true;
              })
              .sort((a, b) => {
                const levelA = DIFFICULTY_MAP[a.difficulty]?.level || 0;
                const levelB = DIFFICULTY_MAP[b.difficulty]?.level || 0;
                return sortOrder === 'asc' ? levelA - levelB : levelB - levelA;
              })
              .map((c) => (
              <ChallengeCard
                key={c.id}
                id={c.id}
                category={c.category}
                points={DIFFICULTY_MAP[c.difficulty]?.points || 0}
                title={c.title}
                difficulty={DIFFICULTY_MAP[c.difficulty]?.level || 0}
                isResolved={c.isResolved ?? false}
              />
            ))}
          </div>
        </div>
        <button className="floating-add-button" onClick={handleOpenModal}>
          <img src="/icons/plus.svg" alt="Ajouter un challenge" className="img" />
        </button>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <ChallengesForm onSubmit={handleFormSubmit} />
        </Modal>
      </div>
    </>
  );
}

// Disable global page scroll while this component is mounted so only the
// `.challengeListWrapper` shows a scrollbar.
// This uses a mount/unmount effect to restore previous state.
function useDisableBodyScroll() {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous || "";
    };
  }, []);
}
