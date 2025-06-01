import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { ProfesorService, Profesor } from '../../services/profesor.service'; //Servicio y la interfaz de profesor
import { AuthService } from '../../services/auth.service'; // Servicio de autenticación

@Component({
  selector: 'app-profesors', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar modulos
  templateUrl: './profesors.component.html' //Asignar html
})

export class ProfesorsComponent implements OnInit {

  //ATRIBUTOS

  profesors: Profesor[] = []; //Array para almacenar profesores
  columnaOrden: keyof Profesor = 'id'; //Columna por la que se ordena
  ordenAscendente: boolean = true; //Orden ascendente o descendente
  filtroIds: string = ''; //Para almacenar los IDs introducidos por profesor

  filtroColumna: keyof Profesor = 'id'; //Columna seleccionada
  filtroValor: string = ''; //Valor a buscar

  editando: Profesor | null = null; //Profesor que se está editando
  editandoId: number | null = null; //ID dprofesor que se está editando

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  rolUsuario: string = ''; // Rol del usuario autenticado, para mostrar u ocultar acciones

  //CONSTRUCTOR

  constructor(
    private profesorService: ProfesorService, //Meter el servicio
    private auth: AuthService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar profesores
  ngOnInit(): void {
    this.profesorService.get().subscribe({
      next: (data) => {
        this.profesors = data;
        this.ordenarPor(this.columnaOrden); //Ordenar por la columna inicial
      },
      error: (err) => console.error('Error al obtener profesors:', err)
    });
    const user = this.auth.getUser();
    this.rolUsuario = user?.rol || '';
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Profesor, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente;
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.profesors.sort((a, b) => {
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
    this.profesorService.get().subscribe({
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
          filtrados = filtrados.filter(profesor => {
            const campo = profesor[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.profesors = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar profesors:', err)
    });
  }

  //Limpiar el filtro
  verTodos(): void {
    this.filtroIds = ''; //Limpiar el campo de IDs
    this.filtroValor = ''; //Limpiar el campo de búsqueda

    this.profesorService.get().subscribe({
      next: (data) => {
        this.profesors = data;
        this.ordenarPor(this.columnaOrden); //Reordena según el estado actual
      },
      error: (err) => console.error('Error al obtener profesors:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear profesors con el archivo
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
        if (!Array.isArray(contenido.profesors)) {
          alert('El JSON debe tener una clave "profesors" con un array.');
          return;
        }

        this.profesorService.importar(contenido).subscribe({
          next: (response) => {
            console.log('Profesors importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar profesors:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar profesors. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id dprofesor
  editar(profesor: Profesor): void {
    this.editando = { ...profesor };
    this.editandoId = profesor.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos profesores sin filtrar
      this.profesorService.get().subscribe({
        next: (data) => {
          this.profesors = data;
          this.ordenarPor(this.columnaOrden, true); //mantener el orden actual
        },
        error: (err) => console.error('Error al obtener profesors:', err)
      });
    }
  }

  //Guardar los cambios de la fila editada
  guardarCambiosFila(): void {
    if (!this.editando) return;

    this.profesorService.actualizar(this.editando).subscribe({
      next: () => {
        //En lugar de llamar a verTodos(), volvemos a aplicar el filtro si existe
        this.recargarTabla();
        this.editando = null;
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar profesor:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminar profesor
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id];  //Crear un array con el ID

      this.profesorService.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Profesor eliminado con éxito');
          this.recargarTabla();  //Recargar profesores con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar profesor:', err);
          alert(`Hubo un error al eliminar profesor. Detalles: ${err.message || err}`);
        }
      });
    }
  }

}
