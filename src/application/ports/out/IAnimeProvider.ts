// src/application/ports/IAnimeProvider.ts

export interface AnimeSearchResult {
  id: string | null;
  title: string;
  url: string;
  image: string | null;
}

export interface IAnimeProvider {
  search(query: string): Promise<AnimeSearchResult[]>;
  getCatalog(page: number, genre?: string): Promise<AnimeSearchResult[]>;
  getAnimeInfo(url: string): Promise<any>;
  getEpisodeLinks(url: string): Promise<any>;
  resolveStream(urls: string[]): Promise<any>;
}
