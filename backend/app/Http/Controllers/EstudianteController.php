<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Estudiante; //Importar el modelo de estudiantes

class EstudianteController extends Controller
{

    public function index() {
        return Estudiante::with(['usuario', 'estudiante'])->get();
    }

    //Función para crear uno o varios estudiantes
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'estudiantes' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada estudiante del array
            'estudiantes.*.usuario_id' => 'required|integer|exists:usuarios,id',
            'estudiantes.*.curso_id' => 'required|integer|exists:cursos,id',
        ]);

        //Crear los estudiantes en un bucle
        $estudiantes = [];
        foreach ($validated['estudiantes'] as $estudianteData) {
            $estudiantes[] = Estudiante::create($estudianteData); //Crear el estudiante y añadirlo al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Estudiantes creados con éxito',
            'estudiantes' => $estudiantes,
        ], 201); //201 significa "Creado"
    }

    //Función para leer uno o varios estudiantes y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:estudiantes,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todos los estudiantes
        $query = Estudiante::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Hacerle GET al query para sacar los datos y cargar las relaciones
        $estudiantes = $query->with(['usuario', 'curso'])->get();

        //Devolver los datos de los estudiantes
        return response()->json($estudiantes);
    }

    //Función para modificar uno o varios estudiantes
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'estudiantes' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada estudiante del array
            'estudiantes.*.id' => 'required|integer|exists:estudiantes,id', //Poner el ID del estudiante que se va a modificar
            'estudiantes.*.usuario_id' => 'nullable|integer|exists:usuarios,id',
            'estudiantes.*.curso_id' => 'nullable|integer|exists:cursos,id',
        ]);

        $estudiantesActualizados = []; //Array para guardar los estudiantes actualizados

        //Bucle para actualizar los estudiantes
        foreach ($validated['estudiantes'] as $estudianteData) {
            //Buscar el estudiante por la ID
            $estudiante = Estudiante::findOrFail($estudianteData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['usuario_id', 'curso_id'] as $campo) {
                if (array_key_exists($campo, $estudianteData)) {
                    $datosActualizados[$campo] = $estudianteData[$campo];
                }
            }

            $estudiante->update($datosActualizados);

            //Añadir el estudiante actualizado al array
            $estudiantesActualizados[] = $estudiante;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Estudiante/s actualizado/s con éxito',
            'estudiantes' => $estudiantesActualizados,
        ]);
    }

    //Función para eliminar uno o varios estudiantes
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:estudiantes,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar los estudiantes de los IDs
        Estudiante::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Estudiante/s eliminado/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
