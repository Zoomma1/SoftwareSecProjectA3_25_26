import { Link } from 'react-router-dom';
import './ScoreRow.css';

type ScoreRowProps = {
  id?: string;
  rank: number;
  fullName: string;
  solved: number;
  score: number;
  compact?: boolean;
  onClick?: (id?: string) => void;
  isCurrentUser?: boolean;
};

export default function ScoreRow({ id, rank, fullName, solved, score, compact, onClick, isCurrentUser }: ScoreRowProps) {
  const content = (
    <div className={`score-row ${compact ? 'score-row--compact' : ''} ${isCurrentUser ? 'score-row--current' : ''}`}>
      <div className="score-row-left">
        {rank <= 3 ? (
          <div className="rankBadgeWrapper">
            {rank === 1 && (
              <img src="/icons/crown.svg" alt="Crown" className="scoreboard-crown" />
            )}
            <div className={`rankBadge${rank === 1 ? ' rankBadge--top' : ''}`}>
              <span className="rankNumber">{rank}</span>
            </div>
          </div>
        ) : (
          <span className="rankNumber">{rank}</span>
        )}
        <span className="playerName">
          {fullName}
          {isCurrentUser && " (Moi)"}
        </span>
      </div>

      <div className="score-row-mid">
        <span className="label">Challenges résolus</span>
        <span className="pipe">|</span>
        <span className="value">{solved}</span>
      </div>

      <div className="score-row-right">
        <span className="label">Score total</span>
        <span className="score">{score}pt</span>
      </div>
    </div>
  );

  // If a click handler is provided prefer that (allow parent to show profile inline)
  if (onClick && id) {
    return (
      <div className="score-row-link score-row-button" onClick={() => onClick(id)}>
        {content}
      </div>
    );
  }

  if (id) {
    return (
      <Link to={`/profile/${id}`} className="score-row-link">
        {content}
      </Link>
    );
  }

  return content;
}
