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

export interface Asignatura {
  id: number;
  nombre: string;
}

export interface Matricula {
  id: number;
  estudiante_id: number;
  asignatura_id: number;
  estudiante?: Estudiante;
  asignatura?: Asignatura;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private readonly apiUrl = `${API_URL}/matriculas`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(this.apiUrl);
  }

  //Create
  importar(data: { matriculas: Matricula[] }): Observable<any> {
      return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(Matricula: Matricula): Observable<any> {
    return this.http.put(this.apiUrl, { matriculas: [Matricula] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
