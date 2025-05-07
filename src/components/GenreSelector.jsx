const GenreSelector = ({ genres, onSelect }) => (
    <div className="genre-grid">
      {genres.map(genre => (
        <button 
          key={genre.id} 
          onClick={() => onSelect(genre.id)}
          className="genre-btn"
        >
          {genre.name}
        </button>
      ))}
    </div>
  );