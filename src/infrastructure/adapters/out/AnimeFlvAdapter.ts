// src/infrastructure/adapters/AnimeFlvAdapter.ts

import { IAnimeProvider, AnimeSearchResult } from '../../../application/ports/out/IAnimeProvider';

// Importamos el router multi-proveedor original de la cuarentena
const animeMultiService = require('../../vendor/anime1v-api/src/services/anime.service.js');
const animeAv1Service = require('../../vendor/anime1v-api/src/services/animeav1.service.js');

export class AnimeFlvAdapter implements IAnimeProvider {
  async search(query: string): Promise<AnimeSearchResult[]> {
    try {
      const response = await animeMultiService.searchAnime(query);
      return response.data.results.map((item: any) => ({
        id: item.slug || null,
        title: item.title,
        url: item.url,
        image: item.image,
        provider: item.provider
      }));
    } catch (error: any) {
      console.error("Error en AnimeFlvAdapter al buscar:", error);
      throw new Error(`No se pudo obtener datos: ${error.message}`);
    }
  }

  async getCatalog(page: number, genre?: string): Promise<AnimeSearchResult[]> {
    try {
      // Catalog usa animeav1 por defecto en la API original para un listado mas unificado
      const response = await animeAv1Service.getCatalog(page, genre);
      
      return response.data.results.map((item: any) => ({
        id: item.slug || null,
        title: item.title,
        url: item.url,
        image: item.image
      }));
    } catch (error: any) {
      console.error("Error en AnimeFlvAdapter al obtener catálogo:", error);
      throw new Error(`No se pudo obtener el catálogo de AnimeFLV: ${error.message}`);
    }
  }

  async getAnimeInfo(url: string): Promise<any> {
    try {
      const response = await animeMultiService.getAnimeInfo(url);
      return response.data;
    } catch (error: any) {
      throw new Error(`No se pudo obtener la información del anime: ${error.message}`);
    }
  }

  async getEpisodeLinks(url: string): Promise<any> {
    try {
      const response = await animeMultiService.getEpisodeLinks(url);
      return response.data;
    } catch (error: any) {
      throw new Error(`No se pudieron obtener los enlaces del episodio: ${error.message}`);
    }
  }

  async resolveStream(urls: string[]): Promise<any> {
    const { resolveEmbedUrl } = require('../../vendor/anime1v-api/src/utils/resolvers');
    const resolvePromises = urls.map(async (url) => {
      try {
        const directUrl = await resolveEmbedUrl(url);
        if (directUrl && directUrl !== url) {
          let server = "unknown";
          if (url.includes("voe")) server = "voe";
          else if (url.includes("tape")) server = "streamtape";
          else if (url.includes("wish") || url.includes("playnix") || url.includes("medix") || url.includes("awish")) server = "streamwish";
          else if (url.includes("vidhide")) server = "vidhide";
          else if (url.includes("dood")) server = "doodstream";

          return {
            success: true,
            server,
            mediaType: directUrl.includes(".m3u8") ? "hls" : "mp4",
            streamUrl: directUrl,
            resolvedFrom: url
          };
        }
      } catch (err: any) {
        console.warn(`[RESOLVE CASCADE] Fallo en ${url}: ${err.message}`);
      }
      throw new Error("No se pudo resolver");
    });

    try {
      return await Promise.any(resolvePromises);
    } catch (err) {
      throw new Error("No se pudo obtener el enlace de streaming directo en ningún servidor");
    }
  }
}
