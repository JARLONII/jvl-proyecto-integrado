import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './url'; //Importar URL de la API

export interface Curso {
  id: number;
  nombre: string;
  nivel: string;
  anio_academico: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly apiUrl = `${API_URL}/cursos`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  //Create
  importar(data: { cursos: Curso[] }): Observable<any> {
      return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(Curso: Curso): Observable<any> {
    return this.http.put(this.apiUrl, { cursos: [Curso] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
