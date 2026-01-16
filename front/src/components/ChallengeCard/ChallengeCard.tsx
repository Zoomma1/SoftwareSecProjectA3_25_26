import { Link } from 'react-router-dom';
import './ChallengeCard.css';

interface ChallengeCardProps {
  id?: number;
  category: string;
  points: number;
  title: string;
  difficulty: number;
  isResolved: boolean;
  hideStatus?: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Web: '/icons/Icon Web.svg',
  Infra: '/icons/Icon Infra.svg',
  SupplyChain: '/icons/Icon SupplyChain.svg',
  Other: '/icons/Icon other.svg',
};

const ChallengeCard = ({ id, category, points, title, difficulty, isResolved, hideStatus }: ChallengeCardProps) => {
  const bgImage = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Other'];

  const to = id ? `/challenges/${id}` : "/challenges";

  return (
    <Link to={to} className="challenge-card-link">
    <div className="card-container">
      {/* Header avec catégorie et points */}
      <div className="card-header" style={{ backgroundImage: `url('${bgImage}')` }}>
        <span className="category-tag">{category}</span>
        <span className="points-text">{points} pt</span>
      </div>

      {/* Titre */}
      <h3 className="card-title">{title}</h3>

      <div className="card-footer">
        {/* Étoiles simplifiées en SVG natifs */}
        <div style={{ display: 'flex', gap: '2px', width: hideStatus ? '100%' : 'auto', justifyContent: hideStatus ? 'center' : 'flex-start' }}>
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
        {!hideStatus && <span
          className={`status-badge ${isResolved ? 'status-resolved' : 'status-unresolved'}`}
          style={isResolved ? { backgroundColor: "#dcfce7", color: "#15803d" } : undefined}
        >
          {isResolved ? 'Résolu' : 'Non résolu'}
        </span>}
      </div>
    </div>
    </Link>
  );
};

export default ChallengeCard;