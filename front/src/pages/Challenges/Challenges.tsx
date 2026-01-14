import { useState, useEffect } from "react";
import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import Modal from "../../components/Modal/Modal"; 
import ChallengesForm, { type ChallengeFormData } from "./ChallengeForm/ChallengeForm";
import { ChallengeService, type Challenge } from "../../Service/ChallengeService";
import './Challenges.css';

const DIFFICULTY_MAP: Record<string, { points: number; level: number }> = {
  VERY_EASY: { points: 20, level: 1 },
  EASY: { points: 40, level: 2 },
  MEDIUM: { points: 60, level: 3 },
  HARD: { points: 80, level: 4 },
  VERY_HARD: { points: 100, level: 5 },
};

export default function Challenges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  useDisableBodyScroll();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  console.log("Local storage token:", localStorage.getItem("token"));

  const handleFormSubmit = async (data: ChallengeFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", "TTitre");
      formData.append("description", "description");
      formData.append("solution", "solution");
      formData.append("category", "Web");
      formData.append("difficulty", "MEDIUM");
      if (data.files) {
        console.log("Files:", data.files);
        data.files.forEach((file) => {
          console.log("here");
          formData.append("multipleFiles", file);
        });
      }

      await ChallengeService.createWithFiles(formData);

      // Refresh the list and close modal
      const updatedList = await ChallengeService.getLatest();
      if (Array.isArray(updatedList)) {
        setChallenges(updatedList);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Erreur création challenge:", err);
      alert("Une erreur est survenue lors de la création du challenge.");
    }
  };

  useEffect(() => {
    ChallengeService.getLatest()
      .then((data) => {
        if (Array.isArray(data)) {
          setChallenges(data);
        }
      })
      .catch((err) => console.error("Erreur chargement challenges:", err));
  }, []);

  return (
    <>
      <div className="body-container">
        <SearchBar value={query} onChange={setQuery} />
        <h1 className="title">Challenges</h1>
        <div className="challengeListWrapper">
          <div className="ChalengeGrid">
            {challenges
              .filter((c) =>
                c.title.toLowerCase().includes(query.trim().toLowerCase())
              )
              .map((c) => (
              <ChallengeCard
                key={c.id}
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
