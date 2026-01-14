import "./SearchBar.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search-bar-container">
      <button className="Filter">
        <img src="/icons/Icon filter.svg" alt="Search" className="filter-icon" />
      </button>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        role="search"
      >
        <img src="/icons/Icon search.svg" alt="Search" className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Rechercher"
        />
      </form>
    </div>
  );
}
