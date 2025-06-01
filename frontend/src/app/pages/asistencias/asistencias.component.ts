import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { AsistenciaService, Asistencia } from '../../services/asistencia.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-asistencias', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar modulos
  templateUrl: './asistencias.component.html' //Asignar html
})
export class AsistenciasComponent implements OnInit {

  //ATRIBUTOS

  asistencias: Asistencia[] = []; //Array para almacenar asistenciaes
  columnaOrden: keyof Asistencia = 'id'; //Columna por la que se ordena
  ordenAscendente: boolean = true; //Orden ascendente o descendente
  filtroIds: string = ''; //Para almacenar los IDs introducidos por asistencia

  filtroColumna: keyof Asistencia = 'id'; //Columna seleccionada
  filtroValor: string = ''; //Valor a buscar

  editando: Asistencia | null = null; //Asistencia que se está editando
  editandoId: number | null = null; //ID dasistencia que se está editando

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  usuarioActual: any = null; //Usuario autenticado
  rolUsuario: string = ''; //Rol del usuario autenticado

  //CONSTRUCTOR

  constructor(
    private Service: AsistenciaService, //Meter el servicio
    private auth: AuthService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar asistenciaes
  ngOnInit(): void {
    this.usuarioActual = this.auth.getUser();

    this.Service.get().subscribe({
      next: (data) => {
        this.asistencias = this.filtrarAsistenciasPorRol(data);
        this.ordenarPor(this.columnaOrden); //Ordenar por la columna inicial
      },
      error: (err) => console.error('Error al obtener asistencias:', err)
    });
    const user = this.auth.getUser();
    this.rolUsuario = user?.rol || '';
  }

  private filtrarAsistenciasPorRol(asistencias: Asistencia[]): Asistencia[] {
    const usuario = this.usuarioActual;
    if (usuario?.rol === 'profesor') {
      //Solo asistencias de asignaturas que imparte el profesor
      return asistencias.filter(asistencia =>
        asistencia.matricula?.asignatura?.profesor?.usuario_id === usuario.id
      );
    }
    if (usuario?.rol === 'estudiante') {
      //Solo asistencias del estudiante logueado
      return asistencias.filter(asistencia =>
        asistencia.matricula?.estudiante?.usuario_id === usuario.id
      );
    }
    //Admin y otros roles ven todo
    return asistencias;
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Asistencia, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente;
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.asistencias.sort((a, b) => {
      let valorA = a[columna];
      let valorB = b[columna];

      //Para booleanos opcionales: trata undefined/null como false
      if (columna === 'falta_justificada' || columna === 'presente') {
        const boolA = valorA === true || valorA === 'true';
        const boolB = valorB === true || valorB === 'true';
        if (boolA === boolB) return 0;
        return this.ordenAscendente
          ? (boolA ? -1 : 1)
          : (boolA ? 1 : -1);
      }

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
    this.Service.get().subscribe({
      next: (data) => {
        let filtrados = this.filtrarAsistenciasPorRol(data);

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
          filtrados = filtrados.filter(asistencia => {
            const campo = asistencia[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.asistencias = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar asistencias:', err)
    });
  }

  //Limpiar el filtro
  verTodos(): void {
    this.filtroIds = ''; //Limpiar el campo de IDs
    this.filtroValor = ''; //Limpiar el campo de búsqueda

    this.Service.get().subscribe({
      next: (data) => {
        this.asistencias = this.filtrarAsistenciasPorRol(data);
        this.ordenarPor(this.columnaOrden); //Reordena según el estado actual
      },
      error: (err) => console.error('Error al obtener asistencias:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear asistencias con el archivo
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
        if (!Array.isArray(contenido.asistencias)) {
          alert('El JSON debe tener una clave "asistencias" con un array.');
          return;
        }

        this.Service.importar(contenido).subscribe({
          next: (response) => {
            console.log('Asistencias importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar asistencias:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar asistencias. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id dasistencia
  editar(asistencia: Asistencia): void {
    this.editando = { ...asistencia };
    this.editandoId = asistencia.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos asistenciaes sin filtrar
      this.Service.get().subscribe({
        next: (data) => {
          this.asistencias = this.filtrarAsistenciasPorRol(data);
          this.ordenarPor(this.columnaOrden, true); //mantener el orden actual
        },
        error: (err) => console.error('Error al obtener asistencias:', err)
      });
    }
  }

  //Guardar los cambios de la fila editada
  guardarCambiosFila(): void {
    if (!this.editando) return;

    this.Service.actualizar(this.editando).subscribe({
      next: () => {
        //En lugar de llamar a verTodos(), volvemos a aplicar el filtro si existe
        this.recargarTabla();
        this.editando = null;
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar asistencia:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminar asistencia
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta asistencia?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id];  //Crear un array con el ID

      this.Service.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Asistencia eliminada con éxito');
          this.recargarTabla();  //Recargar asistenciaes con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar asistencia:', err);
          alert(`Hubo un error al eliminar asistencia. Detalles: ${err.message || err}`);
        }
      });
    }
  }

  //Funciones para los checkbox
  esVerdadero(valor: any): boolean {
    return valor === true || valor === 'true';
  }
  onPresenteChange(): void {
    if (this.editando && this.editando.presente) {
      this.editando.falta_justificada = false;
    }
  }
  onJustificadoChange(): void {
    if (this.editando && this.editando.falta_justificada && this.editando.presente) {
      this.editando.presente = false;
    }
  }

}
