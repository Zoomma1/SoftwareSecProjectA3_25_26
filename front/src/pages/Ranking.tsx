import Sidebar from "../components/Sidebar/Sidebar";
import ScoreRow from "../components/ScoreRow/ScoreRow";
import "./Ranking.css";

type RankingPlayer = {
  id: string;
  rank: number;
  fullName: string;
  solved: number;
  score: number;
};

const rankingData: RankingPlayer[] = [
  { id: "1", rank: 1, fullName: "Nom, Prénom", solved: 42, score: 750 },
  { id: "2", rank: 2, fullName: "Nom, Prénom", solved: 30, score: 675 },
  { id: "3", rank: 3, fullName: "Nom, Prénom", solved: 14, score: 235 },
  { id: "4", rank: 4, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "5", rank: 5, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "6", rank: 6, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "7", rank: 7, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "8", rank: 8, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "9", rank: 9, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "10", rank: 10, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "11", rank: 11, fullName: "Nom, Prénom", solved: 1, score: 75 },
  { id: "12", rank: 12, fullName: "Nom, Prénom", solved: 1, score: 75 },
];

export default function Ranking() {
  return (
    <div className="rankingLayout">
      <main className="rankingPage">
        <h1 className="rankingTitle">Scoreboard</h1>

        <div className="rankingListWrapper">
          <section className="rankingList">
            {rankingData.map((p) => (
              <ScoreRow
                key={p.id}
                rank={p.rank}
                fullName={p.fullName}
                solved={p.solved}
                score={p.score}
              />
            ))}
          </section>
        </div>

      </main>
    </div>
  );
}
