import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './url'; //Importar URL de la API

//Interfaces necesarias para mostrar la información de la tabla
export interface Usuario {
  id: number;
  nombre: string;
}

export interface Estudiante {
  id: number;
  usuario_id: number;
  usuario?: Usuario;
}

export interface Curso {
  id: number;
  nombre: string;
}

export interface Profesor {
  id: number;
  usuario_id: number;
}

export interface Asignatura {
  id: number;
  nombre: string;
  curso_id: number;
  profesor_id: number;
  curso?: Curso;
  profesor?: Profesor;
}

export interface Matricula {
  id: number;
  estudiante_id: number;
  asignatura_id: number;
  estudiante?: Estudiante;
  asignatura?: Asignatura;
}

export interface Nota {
  id: number;
  matricula_id: number;
  matricula?: Matricula;
  evaluacion: string
  nota: number;
  observaciones: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotaService {
  private readonly apiUrl = `${API_URL}/notas`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Nota[]> {
    return this.http.get<Nota[]>(this.apiUrl);
  }

  //Create
  importar(data: { notas: Nota[] }): Observable<any> {
      return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(Nota: Nota): Observable<any> {
    return this.http.put(this.apiUrl, { notas: [Nota] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
