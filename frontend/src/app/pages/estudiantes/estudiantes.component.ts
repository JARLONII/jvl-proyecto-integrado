import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { EstudianteService, Estudiante } from '../../services/estudiante.service'; //Servicio y la interfaz de estudiante
import { AuthService } from '../../services/auth.service'; //Servicio de autenticación

@Component({
  selector: 'app-estudiantes', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar modulos
  templateUrl: './estudiantes.component.html' //Asignar html
})

export class EstudiantesComponent implements OnInit {

  //ATRIBUTOS

  estudiantes: Estudiante[] = []; //Array para almacenar estudiantes
  columnaOrden: keyof Estudiante = 'id'; //Columna por la que se ordena
  ordenAscendente: boolean = true; //Orden ascendente o descendente
  filtroIds: string = ''; //Para almacenar los IDs introducidos porestudiante

  filtroColumna: keyof Estudiante = 'id'; //Columna seleccionada
  filtroValor: string = ''; //Valor a buscar

  editando: Estudiante | null = null; //Estudiante que se está editando
  editandoId: number | null = null; //ID del estudiante que se está editando

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  rolUsuario: string = ''; //Rol del usuario autenticado, para mostrar u ocultar acciones

  //CONSTRUCTOR

  constructor(
    private estudianteService: EstudianteService, //Meter el servicio
    private auth: AuthService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar estudiantes
  ngOnInit(): void {
    this.estudianteService.get().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.ordenarPor(this.columnaOrden); //Ordenar por la columna inicial
      },
      error: (err) => console.error('Error al obtener estudiantes:', err)
    });
    const user = this.auth.getUser();
    this.rolUsuario = user?.rol || '';
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Estudiante, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente;
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.estudiantes.sort((a, b) => {
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
    this.estudianteService.get().subscribe({
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
          filtrados = filtrados.filter(estudiante => {
            const campo = estudiante[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.estudiantes = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar estudiantes:', err)
    });
  }

  //Limpiar el filtro
  verTodos(): void {
    this.filtroIds = ''; //Limpiar el campo de IDs
    this.filtroValor = ''; //Limpiar el campo de búsqueda

    this.estudianteService.get().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.ordenarPor(this.columnaOrden); //Reordena según el estado actual
      },
      error: (err) => console.error('Error al obtener estudiantes:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear estudiantes con el archivo
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
        if (!Array.isArray(contenido.estudiantes)) {
          alert('El JSON debe tener una clave "estudiantes" con un array.');
          return;
        }

        this.estudianteService.importar(contenido).subscribe({
          next: (response) => {
            console.log('Estudiantes importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar estudiantes:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar estudiantes. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id del estudiante
  editar(estudiante: Estudiante): void {
    this.editando = { ...estudiante };
    this.editandoId = estudiante.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos estudiantes sin filtrar
      this.estudianteService.get().subscribe({
        next: (data) => {
          this.estudiantes = data;
          this.ordenarPor(this.columnaOrden, true); //mantener el orden actual
        },
        error: (err) => console.error('Error al obtener estudiantes:', err)
      });
    }
  }

  //Guardar los cambios de la fila editada
  guardarCambiosFila(): void {
    if (!this.editando) return;

    this.estudianteService.actualizar(this.editando).subscribe({
      next: () => {
        //En lugar de llamar a verTodos(), volvemos a aplicar el filtro si existe
        this.recargarTabla();
        this.editando = null;
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar estudiante:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminarestudiante
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id];  //Crear un array con el ID

      this.estudianteService.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Estudiante eliminado con éxito');
          this.recargarTabla();  //Recargar estudiantes con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar estudiante:', err);
          alert(`Hubo un error al eliminarestudiante. Detalles: ${err.message || err}`);
        }
      });
    }
  }

}
