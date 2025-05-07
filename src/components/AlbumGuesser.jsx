import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const AlbumGuesser = ({ albums: initialAlbums, onRestart, onNewArtist }) => {
  const [albums, setAlbums] = useState(initialAlbums);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [guessedAlbums, setGuessedAlbums] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\(.*?(deluxe|remaster|edition|version).*?\)/gi, "")
      .replace(/\s+/g, " ").trim()
      .toLowerCase();
  };

  const getSuggestions = (input) => {
    const inputValue = normalizeText(input).trim();
    const inputLength = inputValue.length;

    return inputLength === 0 
      ? [] 
      : albums.filter(album => {
          const albumName = normalizeText(album.name);
          return albumName.includes(inputValue);
        }).slice(0, 5);
  };

  const onChange = (e) => {
    const value = e.target.value;
    setGuess(value);
    if (value.length > 3) {
      setSuggestions(getSuggestions(value));
    } else {
      setSuggestions([]);
    }
  };

  const onKeyDown = (e) => {
    // Tecla arriba
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : 0);
    }
    // Tecla abajo
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : suggestions.length - 1
      );
    }
    // Tecla enter
    else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      setGuess(suggestions[activeSuggestion].name);
      setSuggestions([]);
    }
    // Tecla enter sin sugerencias
    else if (e.key === 'Enter') {
      checkGuess();
    }
  };

  const onSuggestionClick = (suggestion) => {
    setGuess(suggestion.name);
    setSuggestions([]);
  };

  const checkGuess = () => {
    const currentAlbum = albums[currentIndex];
    const normalizedGuess = normalizeText(guess);
    const normalizedAlbumName = normalizeText(currentAlbum.name);
    
    if (normalizedGuess === normalizedAlbumName) {
      console.log('Correcto');
      setShowSuccess(true);
      
      // Primero actualizar la lista de álbumes acertados
      const newGuessedAlbums = [...guessedAlbums, currentAlbum.id];
      setGuessedAlbums(newGuessedAlbums);
      
      // Filtrar álbumes no acertados
      const remainingAlbums = albums.filter(a => !newGuessedAlbums.includes(a.id));
      setAlbums(remainingAlbums);
      
      // Actualizar puntuación
      setScore(score + 1);
      
      // Resetear guess y sugerencias
      setGuess('');
      setSuggestions([]);
      
      // Actualizar índice sólo si hay álbumes restantes
      if (remainingAlbums.length > 0) {
        setCurrentIndex(prev => prev >= remainingAlbums.length - 1 ? 0 : prev + 1);
      }
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (albums.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="text-white items-center justify-center text-center text-2xl">
          <div className="font-bold text-4xl text-cyan-300 mb-2">¡Felicidades!</div> Has adivinado todos los álbumes.
        </div>
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="bg-cyan-600 text-xl text-white px-8 py-2 rounded-lg cursor-pointer hover:contrast-150"
          >
            Jugar de nuevo
          </button>
          <button
            onClick={onNewArtist}
            className="bg-cyan-600 text-xl text-white px-8 py-2 rounded-lg cursor-pointer hover:contrast-150"
          >
            Buscar otro artista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Animación de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 flex bg-gray-700/50 items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500/90 text-white p-6 rounded-full shadow-xl animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Álbum a pantalla completa */}
      <div className="flex-1 flex items-center justify-center bg-transparent relative">
        <img 
          src={albums[currentIndex].cover} 
          alt={albums[currentIndex].name}
          className="max-w-full max-h-[80vh] object-contain shadow-2xl shadow-slate-950 mb-6"
          style={{
            transition: 'opacity 0.3s ease',
          }}
        />
        
        {/* Controles de navegación */}
        <button 
          onClick={() => setCurrentIndex(prev => (prev - 1 + albums.length) % albums.length)}
          className="absolute left-4 top-1/2 bg-black/50 text-white p-2 rounded-full cursor-pointer"
        >
          &larr;
        </button>
        <button 
          onClick={() => setCurrentIndex(prev => (prev + 1) % albums.length)}
          className="absolute right-4 top-1/2 bg-black/50 text-white p-2 rounded-full cursor-pointer"
        >
          &rarr;
        </button>
      </div>

      {/* Área de adivinanza */}
      <div className="bg-gray-900 p-4 flex flex-col items-center">
        <div className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            value={guess}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="¿Qué álbum es este?"
            className="flex-1 p-3 rounded-lg bg-gray-800 text-white"
          />
          <button
            onClick={checkGuess}
            className="bg-cyan-600 text-white px-4 rounded-lg cursor-pointer hover:contrast-150"
          >
            Adivinar
          </button>
          {suggestions.length > 0 && (
            <ul className="absolute bottom-24 bg-gray-500 p-2 rounded-lg w-full max-w-md">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={suggestion.id} 
                  className={`p-2 cursor-pointer ${activeSuggestion === index ? 'bg-gray-300' : ''}`}
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 text-white">
          Álbumes restantes: {albums.length} | Puntuación: {score}
        </div>
      </div>
    </div>
  );
};

AlbumGuesser.propTypes = {
  albums: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired
    })
  ).isRequired,
  onRestart: PropTypes.func.isRequired,
  onNewArtist: PropTypes.func.isRequired
};

export default AlbumGuesser;