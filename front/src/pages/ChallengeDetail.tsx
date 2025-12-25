import { useParams } from "react-router-dom";

export default function ChallengeDetail() {
  const { id } = useParams();
  return <h1>Challenge detail: {id}</h1>;
}
