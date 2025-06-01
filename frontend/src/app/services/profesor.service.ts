import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './url'; //Importar URL de la API

//Interfaces necesarias para mostrar la información de la tabla
export interface Usuario {
  id: number;
  nombre: string;
}

export interface Profesor {
  id: number;
  usuario_id: number;
  usuario?: Usuario;
  departamento: string
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private readonly apiUrl = `${API_URL}/profesors`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.apiUrl);
  }

  //Create
  importar(data: { profesors: Profesor[] }): Observable<any> {
      return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(Profesor: Profesor): Observable<any> {
    return this.http.put(this.apiUrl, { profesors: [Profesor] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
