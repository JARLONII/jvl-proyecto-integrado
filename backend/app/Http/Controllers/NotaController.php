<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\nota; //Importar el modelo de notas

class notaController extends Controller
{
    //Función para crear una o varias notas
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'notas' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada calificación del array
            'notas.*.matricula_id' => 'required|integer|exists:matriculas,id',
            'notas.*.evaluacion' => 'required|string',
            'notas.*.nota' => 'required|numeric|min:0|max:10', //Nota entre 0 y 10
            'notas.*.observaciones' => 'nullable|string',
        ]);

        //Crear las notas en un bucle
        $notas = [];
        foreach ($validated['notas'] as $notaData) {
            $notas[] = nota::create($notaData); //Crear la calificación y añadirla al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'notas creadas con éxito',
            'notas' => $notas,
        ], 201); //201 significa "Creado"
    }

    //Función para leer una o varias notas y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:notas,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todas las notas
        $query = nota::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Hacerle GET al query para sacar los datos
        $notas = $query->with(['matricula.estudiante.usuario', 'matricula.asignatura.curso', 'matricula.asignatura.profesor'])->get();

        //Devolver los datos de las notas
        return response()->json($notas);
    }

    //Función para modificar una o varias notas
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'notas' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada calificación del array
            'notas.*.id' => 'required|integer|exists:notas,id', //Poner el ID de la calificación que se va a modificar
            'notas.*.matricula_id' => 'nullable|integer|exists:matriculas,id',
            'notas.*.evaluacion' => 'nullable|string',
            'notas.*.nota' => 'nullable|numeric|min:0|max:10', //Nota entre 0 y 10
            'notas.*.observaciones' => 'nullable|string',
        ]);

        $notasActualizadas = []; //Array para guardar las notas actualizadas

        //Bucle para actualizar las notas
        foreach ($validated['notas'] as $notaData) {
            //Buscar el nota por la ID
            $nota = Nota::findOrFail($notaData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['matricula_id', 'evaluacion', 'nota', 'observaciones'] as $campo) {
                if (array_key_exists($campo, $notaData)) {
                    $datosActualizados[$campo] = $notaData[$campo];
                }
            }

            $nota->update($datosActualizados);

            //Añadir el nota actualizado al array
            $notasActualizados[] = $nota;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Calificación/es actualizada/s con éxito',
            'notas' => $notasActualizadas,
        ]);
    }

    //Función para eliminar una o varias notas
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:notas,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar las notas de los IDs
        nota::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Calificación/es eliminada/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
