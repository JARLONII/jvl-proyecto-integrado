import { Routes } from '@angular/router';

//Importar componentes de las páginas
import { InicioComponent } from './pages/inicio/inicio.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { CursosComponent } from './pages/cursos/cursos.component';
import { EstudiantesComponent } from './pages/estudiantes/estudiantes.component';
import { ProfesorsComponent } from './pages/profesors/profesors.component';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';
import { MatriculasComponent } from './pages/matriculas/matriculas.component';
import { NotasComponent } from './pages/notas/notas.component';
import { AsistenciasComponent } from './pages/asistencias/asistencias.component';
import { LoginComponent } from './pages/login/login.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

//Importaciones para la seguridad
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['administrador', 'profesor'] } // Solo administradores y profesores pueden acceder
  },
  {
    path: 'estudiantes',
    component: EstudiantesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cursos',
    component: CursosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profesores',
    component: ProfesorsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'asignaturas',
    component: AsignaturasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'matriculas',
    component: MatriculasComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['administrador'] } // Solo administradores pueden acceder
  },
  {
    path: 'notas',
    component: NotasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'asistencias',
    component: AsistenciasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  }
];
