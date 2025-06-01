<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asistencia; //Importar el modelo de asistencias

class AsistenciaController extends Controller
{
    //Función para crear una o varias asistencias
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'asistencias' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada asistencia del array
            'asistencias.*.matricula_id' => 'required|integer|exists:matriculas,id',
            'asistencias.*.fecha' => 'required|date',
            'asistencias.*.presente' => 'nullable|boolean',
            'asistencias.*.falta_justificada' => 'nullable|boolean',
        ]);

        //Crear las asistencias en un bucle
        $asistencias = [];
        foreach ($validated['asistencias'] as $asistenciaData) {
            $asistencias[] = Asistencia::create($asistenciaData); //Crear la asistencia y añadirla al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Asistencias creadas con éxito',
            'asistencias' => $asistencias,
        ], 201); //201 significa "Creado"
    }

    //Función para leer una o varias asistencias y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:asistencias,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todas las asistencias
        $query = Asistencia::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Ordenar por ID
        $query->orderBy('id');

        //Hacerle GET al query para sacar los datos
        $asistencias = $query->with(['matricula.estudiante.usuario', 'matricula.asignatura.curso', 'matricula.asignatura.profesor'])->get();

        //Devolver los datos de las asistencias
        return response()->json($asistencias);
    }

    //Función para modificar una o varias asistencias
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'asistencias' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada asistencia del array
            'asistencias.*.id' => 'required|integer|exists:asistencias,id', //Poner el ID de la asistencia que se va a modificar
            'asistencias.*.matricula_id' => 'nullable|integer|exists:matriculas,id',
            'asistencias.*.fecha' => 'nullable|date',
            'asistencias.*.presente' => 'nullable|boolean',
            'asistencias.*.falta_justificada' => 'nullable|boolean',
        ]);

        $asistenciasActualizadas = []; //Array para guardar las asistencias actualizadas

        //Bucle para actualizar las asistencias
        foreach ($validated['asistencias'] as $asistenciaData) {
            //Buscar el asistencia por la ID
            $asistencia = Asistencia::findOrFail($asistenciaData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['matricula_id', 'fecha', 'presente', 'falta_justificada'] as $campo) {
                if (array_key_exists($campo, $asistenciaData)) {
                    $datosActualizados[$campo] = $asistenciaData[$campo];
                }
            }

            $asistencia->update($datosActualizados);

            //Añadir el asistencia actualizado al array
            $asistenciasActualizados[] = $asistencia;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Asistencia/s actualizada/s con éxito',
            'asistencias' => $asistenciasActualizadas,
        ]);
    }

    //Función para eliminar una o varias asistencias
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:asistencias,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar las asistencias de los IDs
        Asistencia::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Asistencia/s eliminada/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
