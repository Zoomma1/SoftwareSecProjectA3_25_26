import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";

export default function ChallengeDetail() {
  const { id } = useParams();
  return (
  <>
    <Sidebar />
    <h1>Challenge detail: {id}</h1>
  </>
  );
}