import "./SearchBar.css";


export default function SearchBar() {
  return (
    <div className="search-bar-container">
    <button className="Filter">
        <img src="/icons/Icon filter.svg" alt="Search" className="filter-icon"/>
    </button>
    <form className="search-bar" >
        <img src="/icons/Icon search.svg" alt="Search" className="search-icon"/>
        <input
            type="text"
            placeholder="Rechercher..."
        />  
    </form>
    </div>
  );
}
