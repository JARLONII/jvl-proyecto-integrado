import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { PerfilService, Usuario } from '../../services/perfil.service';

@Component({
  selector: 'app-perfil', //Nombre de la etiqueta
  templateUrl: './perfil.component.html', //Asignar HTML
  styleUrl: './perfil.component.css', //Asignar CSS
  standalone: true, //Hacer el componente independiente
  imports: [FormsModule, CommonModule] //Importar módulos necesarios
})
export class PerfilComponent implements OnInit {

  //ATRIBUTOS

  usuario: Usuario | null = null;

  //Campos para el formulario de edición
  editNombre = '';
  editApellidos = '';
  editPassword = '';
  editPasswordRepeat = '';
  editTelefono = '';
  editFechaNac = '';
  editDireccion = '';

  editMode = false;
  passwordMismatch = false;
  mensaje: string = '';

  //CONSTRUCTOR

  constructor(private perfilService: PerfilService) {}

  //MÉTODOS

  //Al iniciar el componente, cargar el perfil del usuario
  ngOnInit(): void {
    this.cargarUsuario();
  }

  //Método para cargar el usuario desde el perfilService
  cargarUsuario() {
    const user = this.perfilService.obtenerPerfil();
    console.log('Usuario obtenido del perfilService:', user);
    if (user) {
      this.usuario = user;
      this.editNombre = user.nombre;
      this.editApellidos = user.apellidos;
      this.editTelefono = user.telefono || '';
      this.editFechaNac = user.fecha_nac;
      this.editDireccion = user.direccion;
    } else {
      this.mensaje = 'No se ha podido cargar la información del perfil.';
    }
  }

  //Activare el formulario de edición
  activarEdicion() {
    this.editMode = true;
    this.editPassword = '';
    this.editPasswordRepeat = '';
    this.passwordMismatch = false;
    this.mensaje = '';
  }

  cancelarEdicion() {
    this.editMode = false;
    this.cargarUsuario();
  }

  guardarCambios() {
    if (!this.usuario) return;

    //Si uno de los dos campos de contraseña está relleno y el otro no, mostrar error
    if (
      (this.editPassword && !this.editPasswordRepeat) ||
      (!this.editPassword && this.editPasswordRepeat)
    ) {
      this.passwordMismatch = true;
      return;
    }

    //Si ambos están rellenos pero no coinciden, mostrar error
    if (this.editPassword && this.editPassword !== this.editPasswordRepeat) {
      this.passwordMismatch = true;
      return;
    }

    this.passwordMismatch = false;

    const datosActualizados: any = {
      id: this.usuario.id,
      nombre: this.editNombre,
      apellidos: this.editApellidos,
      telefono: this.editTelefono,
      fecha_nac: this.editFechaNac,
      direccion: this.editDireccion
    };

    if (this.editPassword) {
      datosActualizados.password = this.editPassword;
    }

    this.perfilService.actualizarPerfil(datosActualizados).subscribe({
      next: () => {
        this.mensaje = 'Perfil actualizado correctamente.';
        //Actualizar en localStorage para mantener consistencia
        const nuevoUsuario = { ...this.usuario, ...datosActualizados };
        localStorage.setItem('user', JSON.stringify(nuevoUsuario));
        this.usuario = nuevoUsuario;
        this.editMode = false;
      },
      error: () => {
        this.mensaje = 'Error al actualizar el perfil.';
      }
    });
  }
}
