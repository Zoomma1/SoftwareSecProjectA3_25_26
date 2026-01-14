import { useState, useEffect } from "react";
import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import Modal from "../../components/Modal/Modal"; 
import ChallengesForm, { type ChallengeFormData } from "./ChallengeForm/ChallengeForm";
import './Challenges.css';

export default function Challenges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  useDisableBodyScroll();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = (data: ChallengeFormData) => {
    console.log("New Challenge Submitted:", data);
    // TODO: Send 'data' to your backend API here
    
    handleCloseModal();
  };

  // sample data generator to create many challenge cards for scrollbar testing
  const sampleChallenges = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    category: i % 5 === 0 ? "SQL Injection" : "Web",
    points: 10 + (i % 10) * 10,
    title: `Challenge de test ${i + 1}`,
    difficulty: (i % 5) + 1,
    isResolved: i % 3 === 0,
  }));

  return (
    <>
      <div className="body-container">
        <SearchBar value={query} onChange={setQuery} />
        <h1 className="title">Challenges</h1>
        <div className="challengeListWrapper">
          <div className="ChalengeGrid">
            {sampleChallenges
              .filter((c) =>
                c.title.toLowerCase().includes(query.trim().toLowerCase())
              )
              .map((c) => (
              <ChallengeCard
                key={c.id}
                category={c.category}
                points={c.points}
                title={c.title}
                difficulty={c.difficulty}
                isResolved={c.isResolved}
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
