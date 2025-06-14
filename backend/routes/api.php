<?php
//Importar controladores
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\ProfesorController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\AsignaturaController;
use App\Http\Controllers\MatriculaController;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\LoginController;

//Importar librerias para el login
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Usuario;

//Ruta para iniciar sesión
Route::post('/login', [\App\Http\Controllers\LoginController::class, 'login']);
//Ruta para comprobar que se ha iniciado la sesión
Route::get('/login', [\App\Http\Controllers\LoginController::class, 'comprobar'])->name('login');


Route::middleware('auth:sanctum')->group(function () {

    //Rutas para Usuario
    Route::middleware(['rol:administrador'])->post('/usuarios', [UsuarioController::class, 'create']);
    Route::middleware(['rol:administrador,profesor'])->get('/usuarios', [UsuarioController::class, 'read']);
    Route::middleware(['rol:administrador'])->put('/usuarios', [UsuarioController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/usuarios', [UsuarioController::class, 'delete']);

    //Rutas para Estudiante
    Route::middleware(['rol:administrador'])->post('/estudiantes', [EstudianteController::class, 'create']);
    Route::get('/estudiantes', [\App\Http\Controllers\EstudianteController::class, 'read']);
    Route::middleware(['rol:administrador'])->put('/estudiantes', [EstudianteController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/estudiantes', [EstudianteController::class, 'delete']);

    //Rutas para Profesor
    Route::middleware(['rol:administrador'])->post('/profesors', [ProfesorController::class, 'create']);
    Route::get('/profesors', [\App\Http\Controllers\ProfesorController::class, 'read']);
    Route::middleware(['rol:administrador'])->put('/profesors', [ProfesorController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/profesors', [ProfesorController::class, 'delete']);

    //Rutas para Curso
    Route::middleware(['rol:administrador'])->post('/cursos', [CursoController::class, 'create']);
    Route::get('/cursos', [\App\Http\Controllers\CursoController::class, 'read']);
    Route::middleware(['rol:administrador'])->put('/cursos', [CursoController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/cursos', [CursoController::class, 'delete']);

    //Rutas para Asignatura
    Route::middleware(['rol:administrador'])->post('/asignaturas', [AsignaturaController::class, 'create']);
    Route::get('/asignaturas', [\App\Http\Controllers\AsignaturaController::class, 'read']);
    Route::middleware(['rol:administrador'])->put('/asignaturas', [AsignaturaController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/asignaturas', [AsignaturaController::class, 'delete']);

    //Rutas para Matricula
    Route::middleware(['rol:administrador'])->post('/matriculas', [MatriculaController::class, 'create']);
    Route::get('/matriculas', [\App\Http\Controllers\MatriculaController::class, 'read']);
    Route::middleware(['rol:administrador'])->put('/matriculas', [MatriculaController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/matriculas', [MatriculaController::class, 'delete']);

    //Rutas para Nota
    Route::middleware(['rol:administrador'])->post('/notas', [NotaController::class, 'create']);
    Route::get('/notas', [\App\Http\Controllers\NotaController::class, 'read']);
    Route::middleware(['rol:administrador,profesor'])->put('/notas', [NotaController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/notas', [NotaController::class, 'delete']);

    //Rutas para Asistencia
    Route::middleware(['rol:administrador'])->post('/asistencias', [AsistenciaController::class, 'create']);
    Route::get('/asistencias', [\App\Http\Controllers\AsistenciaController::class, 'read']);
    Route::middleware(['rol:administrador,profesor'])->put('/asistencias', [AsistenciaController::class, 'update']);
    Route::middleware(['rol:administrador'])->delete('/asistencias', [AsistenciaController::class, 'delete']);
});
