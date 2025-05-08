import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const AlbumGuesser = ({ albums: initialAlbums, onRestart, onNewArtist }) => {
  const [albums, setAlbums] = useState(initialAlbums);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [guessedAlbums, setGuessedAlbums] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Solo buscar tracks si albums tiene elementos y el currentIndex es válido
    if (!albums || albums.length === 0 || !albums[currentIndex] || !albums[currentIndex].id) {
      setTracks([]);
      setLoadingTracks(false);
      return;
    }
    const fetchTracks = async () => {
      try {
        setLoadingTracks(true);
        const response = await fetch(`/.netlify/functions/tracks?q=${albums[currentIndex].id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await response.json();
        setTracks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading tracks:', error);
        setTracks([]);
      } finally {
        setLoadingTracks(false);
      }
    };
    fetchTracks();
  }, [albums, currentIndex]);

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
        <div className="flex justify-start mb-4">
          <button
              onClick={onNewArtist}
              className="bg-cyan-500 text-xl text-black px-8 py-2 rounded-lg cursor-pointer hover:bg-cyan-600 hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
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
        {loadingTracks ? (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
            ) : (
            <div className="w-full h-full flex flex-col items-center p-4">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    Canciones del álbum
                </h3>

                <div className="w-full max-w-6xl flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-2 sm:p-4">
                    {tracks.map(track => (
                        <div 
                        key={track.id} 
                        className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/60 transition-colors h-full"
                        >
                        <div className="flex items-center gap-3 h-full w-auto">
                            <span className="text-gray-400 font-mono text-base sm:text-lg w-8 text-right">
                            {track.track_number}.
                            </span>
                            <div className="flex-1 min-w-0 w-auto">
                            <p className="text-white font-medium text-balance text-sm sm:text-base">
                                {track.name}
                            </p>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        )}
        </div>
      {/* Área de adivinanza */}
      <div className="bg-gray-900 p-4 border-t border-gray-800 flex flex-col justify-center items-center sticky bottom-0">
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
        <div className="p-4 text-white flex gap-40">
          <span>Álbumes restantes: {albums.length}</span>
          <span>Puntuación: {score}</span>
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