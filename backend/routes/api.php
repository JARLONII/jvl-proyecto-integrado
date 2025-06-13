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
    Route::post('/usuarios', [\App\Http\Controllers\UsuarioController::class, 'create']);
    Route::get('/usuarios', [\App\Http\Controllers\UsuarioController::class, 'read']);
    Route::put('/usuarios', [\App\Http\Controllers\UsuarioController::class, 'update']);
    Route::delete('/usuarios', [\App\Http\Controllers\UsuarioController::class, 'delete']);

    //Rutas para Estudiante
    Route::post('/estudiantes', [\App\Http\Controllers\EstudianteController::class, 'create']);
    Route::get('/estudiantes', [\App\Http\Controllers\EstudianteController::class, 'read']);
    Route::put('/estudiantes', [\App\Http\Controllers\EstudianteController::class, 'update']);
    Route::delete('/estudiantes', [\App\Http\Controllers\EstudianteController::class, 'delete']);

    //Rutas para Profesor
    Route::post('/profesors', [\App\Http\Controllers\ProfesorController::class, 'create']);
    Route::get('/profesors', [\App\Http\Controllers\ProfesorController::class, 'read']);
    Route::put('/profesors', [\App\Http\Controllers\ProfesorController::class, 'update']);
    Route::delete('/profesors', [\App\Http\Controllers\ProfesorController::class, 'delete']);

    //Rutas para Curso
    Route::post('/cursos', [\App\Http\Controllers\CursoController::class, 'create']);
    Route::get('/cursos', [\App\Http\Controllers\CursoController::class, 'read']);
    Route::put('/cursos', [\App\Http\Controllers\CursoController::class, 'update']);
    Route::delete('/cursos', [\App\Http\Controllers\CursoController::class, 'delete']);

    //Rutas para Asignatura
    Route::post('/asignaturas', [\App\Http\Controllers\AsignaturaController::class, 'create']);
    Route::get('/asignaturas', [\App\Http\Controllers\AsignaturaController::class, 'read']);
    Route::put('/asignaturas', [\App\Http\Controllers\AsignaturaController::class, 'update']);
    Route::delete('/asignaturas', [\App\Http\Controllers\AsignaturaController::class, 'delete']);

    //Rutas para Matricula
    Route::post('/matriculas', [\App\Http\Controllers\MatriculaController::class, 'create']);
    Route::get('/matriculas', [\App\Http\Controllers\MatriculaController::class, 'read']);
    Route::put('/matriculas', [\App\Http\Controllers\MatriculaController::class, 'update']);
    Route::delete('/matriculas', [\App\Http\Controllers\MatriculaController::class, 'delete']);

    //Rutas para Nota
    Route::post('/notas', [\App\Http\Controllers\NotaController::class, 'create']);
    Route::get('/notas', [\App\Http\Controllers\NotaController::class, 'read']);
    Route::put('/notas', [\App\Http\Controllers\NotaController::class, 'update']);
    Route::delete('/notas', [\App\Http\Controllers\NotaController::class, 'delete']);

    //Rutas para Asistencia
    Route::post('/asistencias', [\App\Http\Controllers\AsistenciaController::class, 'create']);
    Route::get('/asistencias', [\App\Http\Controllers\AsistenciaController::class, 'read']);
    Route::put('/asistencias', [\App\Http\Controllers\AsistenciaController::class, 'update']);
    Route::delete('/asistencias', [\App\Http\Controllers\AsistenciaController::class, 'delete']);
});
