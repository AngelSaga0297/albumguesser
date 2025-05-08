import { useState, useEffect } from 'react';
import ArtistCard from './components/ArtistCard';
import Loading from './components/Loading';
import AlbumGuesser from './components/AlbumGuesser';
import AlbumGuesserSongsList from './components/AlbumGuesser-SongsList';

function App() {
  const [gameMode, setGameMode] = useState('covers'); // 'covers' o 'songs'
  const [showGameModeModal, setShowGameModeModal] = useState(false);
  const [selectedArtistForModal, setSelectedArtistForModal] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [error, setError] = useState(null);

// Función para buscar artistas
// const searchArtists = async () => {
//   try {
//     setLoading(true);
//     const response = await fetch(`/api/search/artists?q=${encodeURIComponent(searchQuery)}`);
//     const data = await response.json();
//     setArtists(data);
//   } catch (err) {
//     setError('Error al buscar artistas');
//     console.error(err);
//   } finally {
//     setLoading(false);
//   }
// };

// Función para obtener álbumes del artista
const fetchArtistAlbums = async (artistId) => {
  try {
    setLoadingAlbums(true);
    const response = await fetch(`/api/artists/${artistId}/albums?include_tracks=true`);
    const data = await response.json();
    setAlbums(data);
  } catch (err) {
    setError('Error al cargar álbumes');
    console.error(err);
  } finally {
    setLoadingAlbums(false);
  }
};

  // Obtener géneros al cargar
  // useEffect(() => {
  //   const fetchGenres = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch('/api/browse/genres');
        
  //       // Verifica el tipo de contenido primero
  //       const contentType = response.headers.get('content-type');
  //       if (!contentType || !contentType.includes('application/json')) {
  //         const text = await response.text();
  //         throw new Error(`Respuesta inesperada: ${text.slice(0, 100)}`);
  //       }
    
  //       const data = await response.json();
  //       console.log('Datos recibidos:', data);
  //       setGenres(data);
  //     } catch (err) {
  //       console.error('Error completo:', {
  //         message: err.message,
  //         stack: err.stack,
  //         response: err.response
  //       });
  //       setError(`Error al cargar géneros: ${err.message}`);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchGenres();
  // }, []);

  // Obtener álbumes cuando se selecciona un género
  useEffect(() => {
    if (!selectedGenre) return;

    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/browse/genres/${selectedGenre}/albums`);
        const data = await response.json();
        setAlbums(data);
      } catch (err) {
        setError('Error al cargar álbumes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [selectedGenre]);

  // Agrega este useEffect para búsqueda dinámica
useEffect(() => {
  const timerId = setTimeout(() => {
    if (searchQuery.trim().length > 2) { // Solo busca si hay al menos 3 caracteres
      searchArtists();
    }
  }, 500); // Retraso de 500ms

  return () => clearTimeout(timerId); // Limpia el timer al desmontar o cambiar
}, [searchQuery]);

// Actualiza la función searchArtists para cancelar peticiones anteriores
const searchArtists = async () => {
  try {
    setLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;
    
    const response = await fetch(`/artists?q=${encodeURIComponent(searchQuery)}`, { signal });
    const data = await response.json();
    setArtists(data);
  } catch (err) {
    if (err.name !== 'AbortError') {
      setError('Error al buscar artistasss');
      console.error(err);
    }
  } finally {
    setLoading(false);
  }
};

  if (loadingAlbums) return (
    <Loading />
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 to-sky-950 p-6">
      {!selectedArtist ? (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-blue-500 text-center mb-8">Album Guesser</h1>
          <h3 className="text-3xl font-bold text-white text-center mb-8">Buscar Artistas</h3>
          
          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del artista (al menos 3 caracteres)"
                className="w-full p-3 text-lg border rounded-lg text-white bg-white/10 backdrop-blur-sm"
              />
              {loading && (
                <div className="absolute right-3 top-3.5">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              onClick={searchArtists}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:contrast-150 cursor-pointer"
            >
              Buscar
            </button>
          </div>
          {loading && (
            <div className="flex items-center justify-center mb-8f">
              <div className="border-2 border-white border-t-transparent rounded-full w-16 h-16 animate-spin mx-2"></div>
              <div className="text-2xl font-bold text-white">Cargando...</div>
            </div> 
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {artists.map(artist => (
              <ArtistCard 
                key={artist.id}
                artist={artist}
                onSelect={(artist) => {
                  setSelectedArtistForModal(artist);
                  setShowGameModeModal(true);
                }}
              />
            ))}
          </div>
          {showGameModeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold text-center text-balance text-white mb-4">
                Selecciona modo de juego para {selectedArtistForModal?.name}
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSelectedArtist(selectedArtistForModal);
                    fetchArtistAlbums(selectedArtistForModal.id);
                    setGameMode('covers');
                    setShowGameModeModal(false);
                  }}
                  className="bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-500 cursor-pointer"
                >
                  Adivinar por portadas
                </button>
                <button
                  onClick={() => {
                    setSelectedArtist(selectedArtistForModal);
                    fetchArtistAlbums(selectedArtistForModal.id);
                    setGameMode('songs');
                    setShowGameModeModal(false);
                  }}
                  className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-500 cursor-pointer"
                >
                  Adivinar por canciones
                </button>
                <button
                  onClick={() => setShowGameModeModal(false)}
                  className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-500 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      ) : gameMode === 'covers' ? (
        <AlbumGuesser 
          albums={albums}
          onRestart={() => setAlbums([...albums])}
          onNewArtist={() => {
            setSelectedArtist(null);
            setAlbums([]);
            setGameMode('covers');
          }}
         />
      ) : (
        <AlbumGuesserSongsList 
          albums={albums}
          onRestart={() => setAlbums([...albums])}
          onNewArtist={() => {
            setSelectedArtist(null);
            setAlbums([]);
            setGameMode('covers');
          }}
         />
      )}
    </div>
  );
}

export default App;