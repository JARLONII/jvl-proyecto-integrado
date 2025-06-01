import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Importar servicios
import { NotaService, Nota } from '../../services/nota.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-notas', //Nombre de la etiqueta
  imports: [CommonModule, FormsModule], //Importar módulos necesarios
  templateUrl: './notas.component.html' //Asignar HTML
})
export class NotasComponent implements OnInit {

  //ATRIBUTOS

  notas: Nota[] = []; //Array para almacenar notas
  columnaOrden: keyof Nota = 'id'; //Columna por la que se ordena por defecto
  ordenAscendente: boolean = true; //Ordenar por orden ascendente
  //Atributos del filtro
  filtroIds: string = '';
  filtroColumna: keyof Nota = 'id';
  filtroValor: string = '';
  //Atributos par editar
  editando: Nota | null = null;
  editandoId: number | null = null;

  archivoSeleccionado: File | null = null; //Archivo seleccionado para importar

  usuarioActual: any = null; //Guardamos el usuario logueado

  rolUsuario: string = ''; //Rol del usuario autenticado, para mostrar u ocultar acciones

  constructor(
    private Service: NotaService,
    private auth: AuthService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar notas
  ngOnInit(): void {
    this.usuarioActual = this.auth.getUser();

    this.Service.get().subscribe({
      next: (data) => {
        this.notas = this.filtrarNotasPorRol(data);
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al obtener notas:', err)
    });
    const user = this.auth.getUser();
    this.rolUsuario = user?.rol || '';
  }

  //Filtrar notas según el rol del usuario
  private filtrarNotasPorRol(notas: Nota[]): Nota[] {
    const usuario = this.usuarioActual;
    console.log('Usuario logueado:', usuario);

    if (usuario?.rol === 'profesor') {
      //Solo notas de asignaturas que imparte el profesor
      return notas.filter(nota =>
        nota.matricula?.asignatura?.profesor?.usuario_id === usuario.id
      );
    }

    if (usuario?.rol === 'estudiante') {
      //Solo notas del estudiante logueado
      return notas.filter(nota =>
        nota.matricula?.estudiante?.usuario_id === usuario.id
      );
    }

    //Admin y otros roles ven todo
    return notas;
  }

  //Ordenar por la columna seleccionada
  ordenarPor(columna: keyof Nota, mantenerOrden: boolean = false): void {
    if (this.columnaOrden === columna) {
      if (!mantenerOrden) {
        this.ordenAscendente = !this.ordenAscendente;
      }
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.notas.sort((a, b) => {
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

  //Función para filtrar
  filtrar(): void {
    this.Service.get().subscribe({
      next: (data) => {
        let filtrados = this.filtrarNotasPorRol(data);

        const idArray = this.filtroIds
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
        if (idArray.length > 0) {
          filtrados = filtrados.filter(u => idArray.includes(u.id));
        }

        if (this.filtroValor.trim()) {
          const columna = this.filtroColumna;
          const valores = this.filtroValor
            .split(',')
            .map(v => v.trim().toLowerCase())
            .filter(v => v !== '');
          filtrados = filtrados.filter(nota => {
            const campo = nota[columna];
            const campoTexto = campo?.toString().toLowerCase();
            return campoTexto
              ? valores.some(valor => campoTexto.includes(valor))
              : false;
          });
        }

        this.notas = filtrados;
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al filtrar notas:', err)
    });
  }

  //Quitar los filtros
  verTodos(): void {
    this.filtroIds = '';
    this.filtroValor = '';

    this.Service.get().subscribe({
      next: (data) => {
        this.notas = this.filtrarNotasPorRol(data);
        this.ordenarPor(this.columnaOrden);
      },
      error: (err) => console.error('Error al obtener notas:', err)
    });
  }

  //Guardar el archivo importado
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  //Crear notas con el archivo
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
        if (!Array.isArray(contenido.notas)) {
          alert('El JSON debe tener una clave "notas" con un array.');
          return;
        }

        this.Service.importar(contenido).subscribe({
          next: (response) => {
            console.log('Notas importados:', response);
            this.verTodos();
            this.archivoSeleccionado = null;
          },
          error: (err) => {
            console.error('Error al importar notas:', err);
            if (err.status === 422) {
              alert('Error de validación. Revisa los datos del archivo.');
            } else {
              alert('Error al importar notas. Intenta nuevamente.');
            }
          }
        });

      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  //Cambia el estado de la fila a "editando" y obtiene el id dnota
  editar(nota: Nota): void {
    this.editando = { ...nota };
    this.editandoId = nota.id;
  }

  //Recargar la tabla sin quitar el filtro
  private recargarTabla(): void {
    if (this.filtroValor.trim()) {
      //Si hay filtro, lo mantenemos
      this.filtrar();
    } else {
      //Si no hay filtro, cargamos todos notaes filtrando por rol
      this.Service.get().subscribe({
        next: (data) => {
          this.notas = this.filtrarNotasPorRol(data);
          this.ordenarPor(this.columnaOrden, true);
        },
        error: (err) => console.error('Error al obtener notas:', err)
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
        console.error('Error al actualizar nota:', err);
        alert('Hubo un error al guardar los cambios. Revisa los datos.');
      }
    });
  }

  //Cancelar la edicion de la fila
  cancelarEdicionFila(): void {
    this.editando = null;
    this.editandoId = null;
  }

  //Eliminar nota
  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este nota?')) {
      //Enviar el ID como parte de un array, ya que el backend espera un array
      const idsAEliminar = [id]; //Crear un array con el ID

      this.Service.eliminar(idsAEliminar).subscribe({
        next: () => {
          alert('Nota eliminado con éxito');
          this.recargarTabla(); //Recargar notaes con los cambios reflejados
        },
        error: (err) => {
          console.error('Error al eliminar nota:', err);
          alert(`Hubo un error al eliminar nota. Detalles: ${err.message || err}`);
        }
      });
    }
  }
}
