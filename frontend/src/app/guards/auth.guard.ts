import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  //Metodo que se activa cada vez que se accede a una página
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getUser();

    //Si el usuario no está autenticado, redirigir a la página de login
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    //Obtener rol
    const allowedRoles = route.data['roles'] as string[];

    //Comprobar si el usuario tiene un rol permitido, si no, redirige a la página de inicio
    if (allowedRoles && !allowedRoles.includes(user.rol)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
