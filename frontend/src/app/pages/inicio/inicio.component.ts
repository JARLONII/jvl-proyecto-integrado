import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

//Importar servicios
import { AuthService } from '../../services/auth.service';
import { MatriculaService } from '../../services/matricula.service';
import { EstudianteService } from '../../services/estudiante.service';
import { AsignaturaService } from '../../services/asignatura.service';

//Interfaz de la información que se mostrará del profesor
interface ProfesorInfo {
  nombre: string;
  apellidos: string;
  departamento: string;
  cursos: {
    nombre: string;
    asignaturas: {
      [asignaturaId: string]: {
        nombre: string;
        alumnos: { nombre: string; apellidos: string }[];
      };
    };
  }[];
}

//Interfaz de la información que se mostrará del estudiante
interface EstudianteInfo {
  nombre: string;
  apellidos?: string;
  curso: string;
  asignaturas: {
    nombre: string;
    profesor: string;
  }[];
}

@Component({
  selector: 'app-inicio', //Nombre de la etiqueta
  templateUrl: './inicio.component.html', //Asignar html
  styleUrls: ['./inicio.component.css'], //Asignar css
  standalone: true, //Hacer el componente independiente
  imports: [CommonModule] //Importar modulos necesarios
})

export class InicioComponent implements OnInit {

  //ATRIBUTOS

  usuario: any = null; //Variable del usuario
  rol: string = ''; //Rol del usuario
  profesorInfo: ProfesorInfo | null = null; //Información del profesor
  estudianteInfo: EstudianteInfo | null = null; //Información del estudiante
  cargando = false; //Variable para mostrar si carga

  constructor(
    private auth: AuthService,
    private matriculaService: MatriculaService,
    private estudianteService: EstudianteService,
    private asignaturaService: AsignaturaService
  ) {}

  //METODOS

  //Al iniciar el componente, cargar la información del usuario
  ngOnInit(): void {
    this.usuario = this.auth.getUser();
    this.rol = this.usuario?.rol || '';

    //Si es profesor
    if (this.rol === 'profesor') {
      this.cargando = true;
      this.matriculaService.get().subscribe({
        next: (matriculas) => {
          this.profesorInfo = this.procesarInfoProfesor(matriculas, this.usuario);
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      });
    }

    //Si es estudiante
    if (this.rol === 'estudiante') {
      this.cargando = true;
      Promise.all([
        this.estudianteService.get().toPromise(),
        this.asignaturaService.get().toPromise()
      ]).then(([estudiantes, asignaturas]) => {
        this.estudianteInfo = this.procesarInfoEstudiante(estudiantes || [], asignaturas || [], this.usuario);
        this.cargando = false;
      }).catch(() => { this.cargando = false; });
    }
  }

  //Agrupa la info por cursos, asignaturas y alumnos
  procesarInfoProfesor(matriculas: any[], usuario: any): ProfesorInfo {
    //Filtra solo asignaturas impartidas por el profesor logueado
    const propias = matriculas.filter(m =>
      m.asignatura?.profesor?.usuario_id === usuario.id
    );

    //Estructura: curso -> asignaturas -> alumnos
    const cursos: any = {};
    propias.forEach(m => {
      const cursoId = m.asignatura.curso.id;
      const cursoNombre = m.asignatura.curso.nombre;
      const asignaturaId = m.asignatura.id;
      const asignaturaNombre = m.asignatura.nombre;
      const alumno = m.estudiante.usuario;

      if (!cursos[cursoId]) {
        cursos[cursoId] = {
          nombre: cursoNombre,
          asignaturas: {}
        };
      }
      if (!cursos[cursoId].asignaturas[asignaturaId]) {
        cursos[cursoId].asignaturas[asignaturaId] = {
          nombre: asignaturaNombre,
          alumnos: []
        };
      }
      //Evita duplicados
      if (!cursos[cursoId].asignaturas[asignaturaId].alumnos.some((a: any) => a.id === alumno.id)) {
        cursos[cursoId].asignaturas[asignaturaId].alumnos.push(alumno);
      }
    });

    return {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      departamento: propias[0]?.asignatura?.profesor?.departamento || '',
      cursos: Object.values(cursos)
    };
  }

  //Procesa la información del estudiante logueado
  procesarInfoEstudiante(estudiantes: any[], asignaturas: any[], usuario: any): EstudianteInfo {
    //Busca el estudiante logueado
    const estudiante = estudiantes.find(e => e.usuario_id === usuario.id);

    if (!estudiante) {
      return {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        curso: '',
        asignaturas: []
      };
    }

    const curso = estudiante.curso?.nombre || '';
    const apellidos = estudiante.usuario?.apellidos || usuario.apellidos || '';

    //Asignaturas del curso del estudiante
    const asignaturasCurso = asignaturas.filter(a => a.curso_id === estudiante.curso_id);

    const asignaturasInfo = asignaturasCurso.map(a => ({
      nombre: a.nombre,
      profesor: a.profesor?.usuario
        ? `${a.profesor.usuario.nombre} ${a.profesor.usuario.apellidos}`
        : ''
    }));

    return {
      nombre: estudiante.usuario?.nombre || usuario.nombre,
      apellidos,
      curso,
      asignaturas: asignaturasInfo
    };
  }
}
