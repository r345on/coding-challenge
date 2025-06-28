import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom, map} from 'rxjs';
import {InputType} from '../app';

export type FilmUrl = 'string';

export interface SearchQuery {
  query: string;
  type: InputType
}

export interface Film {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  starships: string[];
  characters: string[];
  vehicles: string[];
  url: string;
  marked?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StarWarsService {

  private readonly API_URL = 'https://swapi.py4e.com/api';

  constructor(private http: HttpClient) {

  }

  public getAllFilms(): Promise<Film[]> {
    return lastValueFrom(this.http.get<{
      results: any[]
    }>(this.API_URL.concat('/films')).pipe(map(res => res.results)));
  }

  public search(query: SearchQuery): Promise<FilmUrl[]> {
    let type = query.type === 'people' ? query.type : query.type + 's';
    return lastValueFrom(this.http.get<{
      results: any
    }>(`${this.API_URL}/${type}/?search=${query.query}`).pipe(map(res => res.results),
      map(results => results.length ? results[0].films : [])));
  }
}
