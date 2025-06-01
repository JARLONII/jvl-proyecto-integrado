<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profesor; // Importar el modelo de profesors

class ProfesorController extends Controller
{
    // Función para crear uno o varios profesores
    public function create(Request $request)
    {
        // Validar el array de datos que llega
        $validated = $request->validate([
            'profesors' => 'required|array', // Asegurarse de que sea un array
            // El * significa que se repite para cada profesor del array
            'profesors.*.usuario_id' => 'required|integer|exists:usuarios,id',
            'profesors.*.departamento' => 'required|string',
        ]);

        // Crear los profesores en un bucle
        $profesors = [];
        foreach ($validated['profesors'] as $profesorData) {
            $profesors[] = Profesor::create($profesorData); // Crear el profesor y añadirlo al array
        }

        // Devolver respuesta
        return response()->json([
            'message' => 'Profesores creados con éxito',
            'profesors' => $profesors,
        ], 201); // 201 significa "Creado"
    }

    // Función para leer uno o varios profesores y una o varias columnas
    public function read(Request $request)
    {
        // Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', // Comprobar si hay array
            'ids.*' => 'integer|exists:profesors,id', // Comprobar que hay un entero y existe
        ]);

        // Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); // Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { // Comprobar si se han pedido
            $columns = explode(',', $columns); // Separar las columnas por comas
        }

        // Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todos los profesores
        $query = Profesor::select($columns); // Crear query con las columnas
        if (!empty($validated['ids'])) { // Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); // Si se han escrito, se saca las columnas solo de esos IDs
        }

        // Hacerle GET al query para sacar los datos
        $profesors = $query->with(['usuario'])->get();

        // Devolver los datos de los profesores
        return response()->json($profesors);
    }

    // Función para modificar uno o varios profesores
    public function update(Request $request)
    {
        // Validar el array de datos que llega
        $validated = $request->validate([
            'profesors' => 'required|array', // Asegurarse de que sea un array
            // El * significa que se repite para cada profesor del array
            'profesors.*.id' => 'required|integer|exists:profesors,id', // Poner el ID del profesor que se va a modificar
            'profesors.*.usuario_id' => 'nullable|integer|exists:usuarios,id',
            'profesors.*.departamento' => 'nullable|string',
        ]);

        $profesorsActualizados = []; // Array para guardar los profesores actualizados

        // Bucle para actualizar los profesores
        foreach ($validated['profesors'] as $profesorData) {
            //Buscar el profesor por la ID
            $profesor = Profesor::findOrFail($profesorData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['usuario_id', 'departamento'] as $campo) {
                if (array_key_exists($campo, $profesorData)) {
                    $datosActualizados[$campo] = $profesorData[$campo];
                }
            }

            $profesor->update($datosActualizados);

            //Añadir el profesor actualizado al array
            $profesorsActualizados[] = $profesor;
        }

        // Devolver respuesta
        return response()->json([
            'message' => 'Profesor/es actualizado/s con éxito',
            'profesors' => $profesorsActualizados,
        ]);
    }

    // Función para eliminar uno o varios profesores
    public function delete(Request $request)
    {
        // Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', // Asegurarse de que sea un array
            'ids.*' => 'integer|exists:profesors,id', // Cada ID debe ser un entero y existir en la tabla
        ]);

        // Eliminar los profesores de los IDs
        Profesor::whereIn('id', $validated['ids'])->delete();

        // Devolver respuesta
        return response()->json([
            'message' => 'Profesor/es eliminado/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
