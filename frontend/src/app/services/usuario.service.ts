import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './url'; //Importar URL de la API

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nac: string;
  direccion: string;
  rol: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${API_URL}/usuarios`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Read
  get(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  //Create
  importar(data: { usuarios: Usuario[] }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  //Update
  actualizar(usuario: Usuario): Observable<any> {
    return this.http.put(this.apiUrl, { usuarios: [usuario] });
  }

  //Delete
  eliminar(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }
}
