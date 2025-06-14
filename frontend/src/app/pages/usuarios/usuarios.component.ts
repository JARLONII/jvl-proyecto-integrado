import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { UsuarioService, Usuario } from '../../services/usuario.service'; //Servicio y la interfaz de usuario
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar modulos
  templateUrl: './usuarios.component.html' //Asignar html
})

export class UsuariosComponent implements OnInit {

  //ATRIBUTOS

  usuarios: Usuario[] = []; //Array para almacenar usuarios
  columnaOrden: keyof Usuario = 'id'; //Columna por la que se ordena
  ordenAscendente: boolean = true; //Orden ascendente o descendente
  filtroIds: string = ''; //Para almacenar los IDs introducidos por usuario

  filtroColumna: keyof Usuario = 'id'; //Columna seleccionada
  filtroValor: string = ''; //Valor a buscar

  editando: Usuario | null = null; //Usuario que se está editando
  editandoId: number | null = null; //ID dusuario que se está editando

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  rolUsuario: string = ''; //Rol del usuario autenticado, para mostrar u ocultar acciones

  //CONSTRUCTOR

  constructor(
    private usuarioService: UsuarioService, //Meter el servicio
    private auth: AuthService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar usuarios
  ngOnInit(): void {
    this.usuarioService.get().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
    const user = this.auth.getUser();
    this.rolUsuario = user?.rol || '';
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Usuario, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente; //solo invertir si no se quiere mantener
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true; //nuevo campo → empieza ascendente
    }

    this.usuarios.sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];

      if (valorA === null || valorA === undefined) return 1;
      if (valorB === null || valorB === undefined) return -1;

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return this.ordenAscendente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return this.ordenAscendente
        ? (valorA as any) - (valorB as any)
        : (valorB as any) - (valorA as any);
    });
  }


  //Filtrar
  filtrar(): void {
    this.usuarioService.get().subscribe({
      next: (data) => {
        let filtrados = data;

        //Filtrar por IDs si hay IDs
        const idArray = this.filtroIds
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
        if (idArray.length > 0) {
          filtrados = filtrados.filter(u => idArray.includes(u.id));
        }

        //Filtrar por columna si hay filtro de columna
        if (this.filtroValor.trim()) {
          const columna = this.filtroColumna;
          const valores = this.filtroValor
            .split(',')
            .map(v => v.trim().toLowerCase())
            .filter(v => v !== '');
          filtrados = filtrados.filter(usuario => {
            const campo = usuario[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.usuarios = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar usuarios:', err)
    });
  }

  //Limpiar el filtro
  verTodos(): void {
    this.filtroIds = ''; //Limpiar el campo de IDs
    this.filtroValor = ''; //Limpiar el campo de búsqueda

    this.usuarioService.get().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.ordenarPor(this.columnaOrden); //Reordena según el estado actual
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear usuarios con el archivo
  importar(): void {
    if (!this.archivoSeleccionado) {
      alert('Selecciona un archivo primero.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const contenido = JSON.parse(reader.result as string);

        //Validación básica
        if (!Array.isArray(contenido.usuarios)) {
          alert('El JSON debe tener una clave "usuarios" con un array.');
          return;
        }

        this.usuarioService.importar(contenido).subscribe({
          next: (response) => {
            console.log('Usuarios importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar usuarios:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar usuarios. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id dusuario
  editar(usuario: Usuario): void {
    this.editando = { ...usuario };
    this.editandoId = usuario.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos usuarios sin filtrar
      this.usuarioService.get().subscribe({
        next: (data) => {
          this.usuarios = data;
          this.ordenarPor(this.columnaOrden, true); //mantener el orden actual
        },
        error: (err) => console.error('Error al obtener usuarios:', err)
      });
    }
  }

  //Guardar los cambios de la fila editada
  guardarCambiosFila(): void {
    if (!this.editando) return;

    // Eliminar el campo password antes de actualizar
    const usuarioActualizado = { ...this.editando };
    delete usuarioActualizado.password;

    this.usuarioService.actualizar(usuarioActualizado).subscribe({
      next: () => {
        this.recargarTabla();
        this.editando = null;
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminar usuario
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id];  //Crear un array con el ID

      this.usuarioService.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Usuario eliminado con éxito');
          this.recargarTabla();  //Recargar usuarios con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert(`Hubo un error al eliminar usuario. Detalles: ${err.message || err}`);
        }
      });
    }
  }

}
