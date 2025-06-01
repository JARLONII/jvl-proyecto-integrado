import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { MatriculaService, Matricula } from '../../services/matricula.service'; //Servicio y la interfaz de matricula

@Component({
  selector: 'app-matriculas', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar modulos
  templateUrl: './matriculas.component.html' //Asignar html
})

export class MatriculasComponent implements OnInit {

  //ATRIBUTOS

  matriculas: Matricula[] = []; //Array para almacenar matriculas
  columnaOrden: keyof Matricula = 'id'; //Columna por la que se ordena
  ordenAscendente: boolean = true; //Orden ascendente o descendente
  filtroIds: string = ''; //Para almacenar los IDs introducidos por matricula

  filtroColumna: keyof Matricula = 'id'; //Columna seleccionada
  filtroValor: string = ''; //Valor a buscar

  editando: Matricula | null = null; //Matricula que se está editando
  editandoId: number | null = null; //ID dmatricula que se está editando

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  //CONSTRUCTOR

  constructor(
    private matriculaService: MatriculaService //Meter el servicio
  ) {}

  //METODOS

  //Al iniciar el componente, cargar matriculas
  ngOnInit(): void {
    this.matriculaService.get().subscribe({
      next: (data) => {
        this.matriculas = data;
      },
      error: (err) => console.error('Error al obtener matriculas:', err)
    });
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Matricula, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente; //solo invertir si no se quiere mantener
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true; //nuevo campo → empieza ascendente
    }

    this.matriculas.sort((a, b) => {
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
    this.matriculaService.get().subscribe({
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
          filtrados = filtrados.filter(matricula => {
            const campo = matricula[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.matriculas = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar matriculas:', err)
    });
  }

  //Limpiar el filtro
  verTodos(): void {
    this.filtroIds = ''; //Limpiar el campo de IDs
    this.filtroValor = ''; //Limpiar el campo de búsqueda

    this.matriculaService.get().subscribe({
      next: (data) => {
        this.matriculas = data;
        this.ordenarPor(this.columnaOrden); //Reordena según el estado actual
      },
      error: (err) => console.error('Error al obtener matriculas:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear matriculas con el archivo
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
        if (!Array.isArray(contenido.matriculas)) {
          alert('El JSON debe tener una clave "matriculas" con un array.');
          return;
        }

        this.matriculaService.importar(contenido).subscribe({
          next: (response) => {
            console.log('Matriculas importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar matriculas:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar matriculas. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id dmatricula
  editar(matricula: Matricula): void {
    this.editando = { ...matricula };
    this.editandoId = matricula.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos matriculas sin filtrar
      this.matriculaService.get().subscribe({
        next: (data) => {
          this.matriculas = data;
          this.ordenarPor(this.columnaOrden, true); //mantener el orden actual
        },
        error: (err) => console.error('Error al obtener matriculas:', err)
      });
    }
  }

  //Guardar los cambios de la fila editada
  guardarCambiosFila(): void {
    if (!this.editando) return;

    this.matriculaService.actualizar(this.editando).subscribe({
      next: () => {
        //En lugar de llamar a verTodos(), volvemos a aplicar el filtro si existe
        this.recargarTabla();
        this.editando = null;
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar matricula:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminar matricula
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este matricula?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id];  //Crear un array con el ID

      this.matriculaService.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Matricula eliminado con éxito');
          this.recargarTabla();  //Recargar matriculas con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar matricula:', err);
          alert(`Hubo un error al eliminar matricula. Detalles: ${err.message || err}`);
        }
      });
    }
  }

}
