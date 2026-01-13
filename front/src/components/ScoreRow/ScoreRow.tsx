import React from 'react';
import './ScoreRow.css';

type ScoreRowProps = {
  id?: string;
  rank: number;
  fullName: string;
  solved: number;
  score: number;
  compact?: boolean;
};

export default function ScoreRow({ rank, fullName, solved, score, compact }: ScoreRowProps) {
  return (
    <div className={`score-row ${compact ? 'score-row--compact' : ''}`}>
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
        <span className="playerName">{fullName}</span>
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
}
