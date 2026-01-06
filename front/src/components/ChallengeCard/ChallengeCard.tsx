import './ChallengeCard.css';

interface ChallengeCardProps {
  category: string;
  points: number;
  title: string;
  difficulty: number;
  isResolved: boolean;
}

const ChallengeCard = ({ category, points, title, difficulty, isResolved }: ChallengeCardProps) => {
  return (
    <div className="card-container">
      {/* Header avec catégorie et points */}
      <div className="card-header">
        <span className="category-tag">{category}</span>
        <span className="points-text">{points} pt</span>
      </div>

      {/* Titre */}
      <h3 className="card-title">{title}</h3>

      {/* Footer avec Étoiles et Statut */}
      <div className="card-footer">
        {/* Étoiles simplifiées en SVG natifs */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={star <= difficulty ? "#fbbf24" : "none"}
              stroke={star <= difficulty ? "#fbbf24" : "#e2e8f0"}
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>

        {/* Badge de statut */}
        <span className={`status-badge ${isResolved ? 'status-resolved' : 'status-unresolved'}`}>
          {isResolved ? 'Résolu' : 'Non résolu'}
        </span>
      </div>
    </div>
  );
};

export default ChallengeCard;