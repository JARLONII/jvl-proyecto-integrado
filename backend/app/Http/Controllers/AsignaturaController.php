<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asignatura; //Importar el modelo de asignaturas

class AsignaturaController extends Controller
{
    //Función para crear una o varias asignaturas
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'asignaturas' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada asignatura del array
            'asignaturas.*.nombre' => 'required|string',
            'asignaturas.*.curso_id' => 'required|integer|exists:cursos,id',
            'asignaturas.*.profesor_id' => 'required|integer|exists:profesors,id',
        ]);

        //Crear las asignaturas en un bucle
        $asignaturas = [];
        foreach ($validated['asignaturas'] as $asignaturaData) {
            $asignaturas[] = Asignatura::create($asignaturaData); //Crear la asignatura y añadirla al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Asignaturas creadas con éxito',
            'asignaturas' => $asignaturas,
        ], 201); //201 significa "Creado"
    }

    //Función para leer una o varias asignaturas y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:asignaturas,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todas las asignaturas
        $query = Asignatura::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Ordenar por ID
        $query->orderBy('id');

        //Hacerle GET al query para sacar los datos
        $asignaturas = $query->with(['curso', 'profesor.usuario'])->get();

        //Devolver los datos de las asignaturas
        return response()->json($asignaturas);
    }

    //Función para modificar una o varias asignaturas
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'asignaturas' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada asignatura del array
            'asignaturas.*.id' => 'required|integer|exists:asignaturas,id', //Poner el ID de la asignatura que se va a modificar
            'asignaturas.*.nombre' => 'nullable|string',
            'asignaturas.*.curso_id' => 'nullable|integer|exists:cursos,id',
            'asignaturas.*.profesor_id' => 'nullable|integer|exists:profesors,id',
        ]);

        $asignaturasActualizadas = []; //Array para guardar las asignaturas actualizadas

        //Bucle para actualizar las asignaturas
        foreach ($validated['asignaturas'] as $asignaturaData) {
            //Buscar el asignatura por la ID
            $asignatura = Asignatura::findOrFail($asignaturaData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['nombre', 'curso_id', 'profesor_id'] as $campo) {
                if (array_key_exists($campo, $asignaturaData)) {
                    $datosActualizados[$campo] = $asignaturaData[$campo];
                }
            }

            $asignatura->update($datosActualizados);

            //Añadir el asignatura actualizado al array
            $asignaturasActualizados[] = $asignatura;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Asignatura/s actualizada/s con éxito',
            'asignaturas' => $asignaturasActualizadas,
        ]);
    }

    //Función para eliminar una o varias asignaturas
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:asignaturas,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar las asignaturas de los IDs
        Asignatura::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Asignatura/s eliminada/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
