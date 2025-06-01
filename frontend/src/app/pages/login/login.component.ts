import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

//Importar servicios
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login', //Nombre de la etiqueta
  standalone: true, //Hacer el componente independiente
  imports: [FormsModule, CommonModule], //Importar modulos necesarios
  templateUrl: './login.component.html', //Asignar html
  styleUrl: './login.component.css' //Asignar css
})

export class LoginComponent {

  //ATRIBUTOS

  email: string = '';
  password: string = '';
  error: string = '';
  userRole: string = '';
  mostrarPassword: boolean = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  //METODOS

  //Método para iniciar sesión
  iniciarSesion(form: NgForm) {
    //Si los datos son inválidos muestra un error
    if (form.invalid) {
      this.error = 'Por favor, completa todos los campos.';
      return;
    }

    //Si son válidos guarda el token de usuario
    this.auth.login(form.value).subscribe(
      (res: any) => {
        this.auth.saveToken(res.access_token);
        this.auth.saveUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userRole = res.user.rol;
        this.error = '';

        this.router.navigate(['/inicio']);
      },
      (err) => {
        this.error = 'Email o contraseña incorrectos.';
      }
    );
  }

  funcionMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
