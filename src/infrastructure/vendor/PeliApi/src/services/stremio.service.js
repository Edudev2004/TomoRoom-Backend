const axios = require("axios");

const BASE_URL = "https://v3-cinemeta.strem.io";
const VIDSRC = "https://vidsrc.me";

async function searchContent(query) {
  try {
    const encoded = encodeURIComponent(query);
    const [moviesRes, seriesRes] = await Promise.all([
      axios.get(`${BASE_URL}/catalog/movie/top/search=${encoded}.json`, { timeout: 10000 }).catch(() => ({ data: { metas: [] } })),
      axios.get(`${BASE_URL}/catalog/series/top/search=${encoded}.json`, { timeout: 10000 }).catch(() => ({ data: { metas: [] } }))
    ]);

    const metas = [...(moviesRes.data.metas || []), ...(seriesRes.data.metas || [])];
    
    return metas.map(meta => ({
      id: meta.id,
      slug: meta.id,
      title: meta.name,
      poster: meta.poster,
      rating: meta.imdbRating || null,
      year: meta.year || meta.releaseInfo,
      type: meta.type === "series" ? "series" : "movie",
      url: meta.id
    }));
  } catch (error) {
    return [];
  }
}

async function getContentInfo(slug, type = "movie") {
  const url = `${BASE_URL}/meta/${type === 'series' ? 'series' : 'movie'}/${slug}.json`;
  const { data } = await axios.get(url, { timeout: 10000 });
  const meta = data.meta;

  if (!meta) throw new Error("Contenido no encontrado");

  const seasons = [];
  
  if (type === "series" && meta.videos) {
    const seasonMap = {};
    for (const vid of meta.videos) {
      if (!seasonMap[vid.season]) {
        seasonMap[vid.season] = {
          number: vid.season,
          name: `Temporada ${vid.season}`,
          episodes: []
        };
      }
      seasonMap[vid.season].episodes.push({
        number: vid.episode,
        title: vid.name,
        url: `${slug}:${vid.season}:${vid.episode}`,
        thumbnail: vid.thumbnail,
        description: vid.description
      });
    }
    for (const s of Object.values(seasonMap)) {
      seasons.push(s);
    }
    seasons.sort((a, b) => a.number - b.number);
  }

  const servers = type === "movie" ? [
    {
      server: "VidSrc",
      title: "VidSrc HD",
      url: `${VIDSRC}/embed/movie?imdb=${slug}`
    }
  ] : [];

  return {
    id: slug,
    slug,
    title: meta.name,
    originalTitle: meta.name,
    synopsis: meta.description,
    poster: meta.poster,
    rating: meta.imdbRating,
    year: meta.year || meta.releaseInfo,
    genres: (meta.genres || []).map(g => ({ name: g, slug: g.toLowerCase() })),
    cast: meta.cast || [],
    directors: meta.director || [],
    type,
    url: slug,
    seasons,
    servers
  };
}

module.exports = { searchContent, getContentInfo };
