import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import Sidebar from "../../components/Sidebar/Sidebar";
import './Challenges.css';

export default function Challenges() {

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
    <button className="floating-add-button" onClick={() => {}}>
      <img src="/icons/plus.svg" alt="Ajouter un challenge" className="img"/>
    </button>
  </div>
  </>
  );
}
