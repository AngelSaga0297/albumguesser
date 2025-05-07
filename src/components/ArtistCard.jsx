import PropTypes from 'prop-types';

const ArtistCard = ({ artist, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(artist)}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-1 shadow-lg cursor-pointer
      transition-all hover:scale-[1.03] hover:shadow-xl hover:ring-2 hover:ring-cyan-500/50 group
      relative overflow-hidden"
    >
      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent 
      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {artist.image && (
        <img 
          src={artist.image} 
          alt={artist.name}
          className="w-full h-40 object-cover rounded-t-lg mb-3 transition-all 
          group-hover:brightness-110"
        />
      )}
      
      <div className="px-3 pb-3">
        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
          {artist.name}
        </h3>
        <p className="text-sm text-gray-400 group-hover:text-cyan-300 transition-colors">
          {artist.genres.slice(0, 3).join(' • ')}
        </p>
      </div>
    </div>
  );
};

ArtistCard.propTypes = {
  artist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onSelect: PropTypes.func.isRequired
};

export default ArtistCard;