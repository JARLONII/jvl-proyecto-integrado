import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // ajusta la ruta si es distinta

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  //Si el que accede al página es un estudiante, redirige a inicio
  canActivate(): boolean {
    const user = this.auth.getUser();
    if (!user || user.rol === 'estudiante') {
      this.router.navigate(['/inicio']);
      return false;
    }
    return true;
  }
}
