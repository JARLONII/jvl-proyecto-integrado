import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  rolUsuario: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    //Obtener el rol de usuario
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.rolUsuario = user.rol;
    }
  }

  //Al cerrar sesión, se elimina el token y se redirige al login
  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['']);
  }

}
