const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    // Obtener el id del artista
    const artistId = event.queryStringParameters.q;
    if (!artistId) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([])
      };
    }

    // Obtener credenciales de Spotify de variables de entorno
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Spotify credentials not set in environment variables.' })
      };
    }

    // Obtener access token de Spotify
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        }
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // Buscar albums de artista
    const spotifyResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=MX&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const albums = spotifyResponse.data.items.map(album => ({
      id: album.id,
      name: album.name,
      cover: album.images[0]?.url,
      release_date: album.release_date,
      total_tracks: album.total_tracks
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(albums)
    };
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
