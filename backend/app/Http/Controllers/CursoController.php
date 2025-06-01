<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curso; //Importar el modelo de cursos

class CursoController extends Controller
{
    //Función para crear uno o varios cursos
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'cursos' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada curso del array
            'cursos.*.nombre' => 'required|string',
            'cursos.*.nivel' => 'required|string',
            'cursos.*.anio_academico' => 'required|string',
        ]);

        //Crear los cursos en un bucle
        $cursos = [];
        foreach ($validated['cursos'] as $cursoData) {
            $cursos[] = Curso::create($cursoData); //Crear el curso y añadirlo al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'cursos creados con éxito',
            'cursos' => $cursos,
        ], 201); //201 significa "Creado"
    }

    //Función para leer uno o varios cursos y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:cursos,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todos los cursos
        $query = Curso::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Hacerle GET al query para sacar los datos
        $cursos = $query->get();

        //Devolver los datos de los cursos
        return response()->json($cursos);
    }

    //Crear función para modificar uno o varios cursos
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'cursos' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada curso del array
            'cursos.*.id' => 'required|integer|exists:cursos,id', //Poner el ID del curso que se va a modificar
            'cursos.*.nombre' => 'nullable|string',
            'cursos.*.nivel' => 'nullable|string',
            'cursos.*.anio_academico' => 'nullable|string',
            //Todo en nullable para que no sea obligatorio modificarlos
        ]);

        $cursosActualizados = []; //Array para guardar los cursos actualizados

        //Bucle para actualizar los cursos
        foreach ($validated['cursos'] as $cursoData) {
            //Buscar el curso por la ID
            $curso = Curso::findOrFail($cursoData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['nombre', 'nivel', 'anio_academico'] as $campo) {
                if (array_key_exists($campo, $cursoData)) {
                    $datosActualizados[$campo] = $cursoData[$campo];
                }
            }

            $curso->update($datosActualizados);

            //Añadir el curso actualizado al array
            $cursosActualizados[] = $curso;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'curso/s actualizado/s con éxito',
            'cursos' => $cursosActualizados,
        ]);
    }

    //Crear función para eliminar uno o varios cursos
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:cursos,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar los cursos de los IDs
        Curso::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Curso/s eliminado/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
