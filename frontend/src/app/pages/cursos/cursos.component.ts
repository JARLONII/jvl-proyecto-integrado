import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { CursoService, Curso } from '../../services/curso.service'; //Servicio y la interfaz de curso
import { AuthService } from '../../services/auth.service'; //Servicio de autenticación


@Component({
  selector: 'app-cursos', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar modulos
  templateUrl: './cursos.component.html' //Asignar html
})

export class CursosComponent implements OnInit {

  //ATRIBUTOS

  cursos: Curso[] = []; //Array para almacenar cursos
  columnaOrden: keyof Curso = 'id'; //Columna por la que se ordena
  ordenAscendente: boolean = true; //Orden ascendente o descendente
  filtroIds: string = ''; //Para almacenar los IDs introducidos por curso

  filtroColumna: keyof Curso = 'id'; //Columna seleccionada
  filtroValor: string = ''; //Valor a buscar

  editando: Curso | null = null; //Curso que se está editando
  editandoId: number | null = null; //ID dcurso que se está editando

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  rolUsuario: string = ''; //Rol del usuario autenticado, para mostrar u ocultar acciones

  //CONSTRUCTOR

  constructor(
    private cursoService: CursoService, //Meter el servicio
    private auth: AuthService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar cursos
  ngOnInit(): void {
    this.cursoService.get().subscribe({
      next: (data) => {
        this.cursos = data;
        this.ordenarPor(this.columnaOrden); //Ordenar por la columna inicial
      },
      error: (err) => console.error('Error al obtener cursos:', err)
    });
    const user = this.auth.getUser();
    this.rolUsuario = user?.rol || '';
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Curso, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente;
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.cursos.sort((a, b) => {
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
    this.cursoService.get().subscribe({
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
          filtrados = filtrados.filter(curso => {
            const campo = curso[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.cursos = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar cursos:', err)
    });
  }

  //Limpiar el filtro
  verTodos(): void {
    this.filtroIds = ''; //Limpiar el campo de IDs
    this.filtroValor = ''; //Limpiar el campo de búsqueda

    this.cursoService.get().subscribe({
      next: (data) => {
        this.cursos = data;
        this.ordenarPor(this.columnaOrden); //Reordena según el estado actual
      },
      error: (err) => console.error('Error al obtener cursos:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear cursos con el archivo
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
        if (!Array.isArray(contenido.cursos)) {
          alert('El JSON debe tener una clave "cursos" con un array.');
          return;
        }

        this.cursoService.importar(contenido).subscribe({
          next: (response) => {
            console.log('Cursos importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar cursos:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar cursos. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id dcurso
  editar(curso: Curso): void {
    this.editando = { ...curso };
    this.editandoId = curso.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos cursos sin filtrar
      this.cursoService.get().subscribe({
        next: (data) => {
          this.cursos = data;
          this.ordenarPor(this.columnaOrden, true); //mantener el orden actual
        },
        error: (err) => console.error('Error al obtener cursos:', err)
      });
    }
  }

  //Guardar los cambios de la fila editada
  guardarCambiosFila(): void {
    if (!this.editando) return;

    this.cursoService.actualizar(this.editando).subscribe({
      next: () => {
        //En lugar de llamar a verTodos(), volvemos a aplicar el filtro si existe
        this.recargarTabla();
        this.editando = null;
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar curso:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminar curso
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id];  //Crear un array con el ID

      this.cursoService.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Curso eliminado con éxito');
          this.recargarTabla();  //Recargar cursos con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar curso:', err);
          alert(`Hubo un error al eliminar curso. Detalles: ${err.message || err}`);
        }
      });
    }
  }

}
