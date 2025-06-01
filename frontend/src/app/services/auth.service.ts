import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from './url'; //Importar URL de la API

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${API_URL}`;
  private readonly TOKEN_KEY = 'access_token';

  constructor(private http: HttpClient) {}

  //Registrar al usuario que se logea
  login(credentials: { email: string, password: string }) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(`${this.api}/login`, credentials, { headers });
  }


  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
