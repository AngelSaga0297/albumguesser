const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    // Obtener el id del album
    const albumId = event.queryStringParameters.q;
    if (!albumId) {
      return {
        statusCode: 200,
        body: JSON.stringify([])
      };
    }

    // Obtener credenciales de Spotify de variables de entorno
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
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

    // Buscar tracks del album
    const spotifyResponse = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=0`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const tracks = spotifyResponse.data.items.map(track => ({
      id: track.id,
      name: track.name,
      duration_ms: track.duration_ms,
      track_number: track.track_number
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(tracks)
    };
  } catch (error) {
    console.error('Error searching tracks:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
