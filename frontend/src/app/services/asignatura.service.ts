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

export interface Profesor {
  id: number;
  usuario_id: number;
  usuario?: Usuario;
}

export interface Asignatura {
  id: number;
  nombre: string;
  curso_id: number;
  profesor_id: number;
  curso?: Curso;
  profesor?: Profesor;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  private readonly apiUrl = `${API_URL}/asignaturas`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(this.apiUrl);
  }

  //Create
  importar(data: { asignaturas: Asignatura[] }): Observable<any> {
      return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(Asignatura: Asignatura): Observable<any> {
    return this.http.put(this.apiUrl, { asignaturas: [Asignatura] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
