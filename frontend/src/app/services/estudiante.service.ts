import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './url'; //Importar URL de la API

//Interfaces necesarias para mostrar la información de la tabla
export interface Usuario {
  id: number;
  nombre: string;
}

export interface Curso {
  id: number;
  nombre: string;
}

export interface Estudiante {
  id: number;
  usuario_id: number;
  curso_id: number;
  usuario?: Usuario;
  curso?: Curso;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private readonly apiUrl = `${API_URL}/estudiantes`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.apiUrl);
  }

  //Create
  importar(data: { estudiantes: Estudiante[] }): Observable<any> {
      return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(Estudiante: Estudiante): Observable<any> {
    return this.http.put(this.apiUrl, { estudiantes: [Estudiante] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
