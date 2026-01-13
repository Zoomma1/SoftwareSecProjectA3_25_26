import { useState } from "react";
import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import Modal from "../../components/Modal/Modal"; 
import ChallengesForm, { type ChallengeFormData } from "./ChallengeForm/ChallengeForm";
import './Challenges.css';

export default function Challenges() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = (data: ChallengeFormData) => {
    console.log("New Challenge Submitted:", data);
    // TODO: Send 'data' to your backend API here
    
    handleCloseModal();
  };

  return (
  <>
  
  <div className="body-container">
    <SearchBar />
    <h1 className="title">Challenges</h1>
    <div className="ChalengeGrid">

        <ChallengeCard 
          category="Web" 
          points={75} 
          title="Nom du challenge" 
          difficulty={3} 
          isResolved={true} 
        />
        <ChallengeCard 
          category="SQL Injection" 
          points={100} 
          title="Nom du challenge" 
          difficulty={5} 
          isResolved={false} 
        />
        <ChallengeCard 
          category="Web" 
          points={15} 
          title="Nom du challenge" 
          difficulty={1} 
          isResolved={false} 
        />
        <ChallengeCard 
          category="Web" 
          points={30} 
          title="Nom du challenge" 
          difficulty={2} 
          isResolved={true} 
        />
                <ChallengeCard 
          category="Web" 
          points={15} 
          title="Nom du challenge" 
          difficulty={1} 
          isResolved={false} 
        />
        <ChallengeCard 
          category="Web" 
          points={15} 
          title="Nom du challenge" 
          difficulty={1} 
          isResolved={true} 
        />

    </div>
    <button className="floating-add-button" onClick={handleOpenModal}>
      <img src="/icons/plus.svg" alt="Ajouter un challenge" className="img"/>
    </button>

    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
      <ChallengesForm onSubmit={handleFormSubmit} />
    </Modal>
  </div>
  </>
  );
}
