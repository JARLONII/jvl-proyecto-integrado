import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './url'; //Importar URL de la API

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
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
export class PerfilService {
  private readonly apiUrl = `${API_URL}/usuarios`; //Ruta de la tabla en la API

  constructor(private http: HttpClient) {}

  //Obtener la información del usuario autenticado de la tabla usuarios
  obtenerPerfil(): Usuario | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  //Guardar los cambios de la información del usuario
  actualizarPerfil(usuario: Partial<Usuario> & { id: number }): Observable<any> {
    return this.http.put(this.apiUrl, { usuarios: [usuario] });
  }
}
