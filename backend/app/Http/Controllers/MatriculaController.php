<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Matricula; //Importar el modelo de matriculas

class MatriculaController extends Controller
{
    //Función para crear una o varias matrículas
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'matriculas' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada matrícula del array
            'matriculas.*.estudiante_id' => 'required|integer|exists:estudiantes,id',
            'matriculas.*.asignatura_id' => 'required|integer|exists:asignaturas,id',
        ]);

        //Crear las matrículas en un bucle
        $matriculas = [];
        foreach ($validated['matriculas'] as $matriculaData) {
            $matriculas[] = Matricula::create($matriculaData); //Crear la matrícula y añadirla al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Matrículas creadas con éxito',
            'matriculas' => $matriculas,
        ], 201); //201 significa "Creado"
    }

    //Función para leer una o varias matrículas y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:matriculas,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todas las matrículas
        $query = Matricula::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Hacerle GET al query para sacar los datos
        $matriculas = $query->with(['estudiante.usuario', 'asignatura.curso', 'asignatura.profesor'])->get();

        //Devolver los datos de las matrículas
        return response()->json($matriculas);
    }

    //Función para modificar una o varias matrículas
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'matriculas' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada matrícula del array
            'matriculas.*.id' => 'required|integer|exists:matriculas,id', //Poner el ID de la matrícula que se va a modificar
            'matriculas.*.estudiante_id' => 'nullable|integer|exists:estudiantes,id',
            'matriculas.*.asignatura_id' => 'nullable|integer|exists:asignaturas,id',
        ]);

        $matriculasActualizadas = []; //Array para guardar las matrículas actualizadas

        //Bucle para actualizar las matrículas
        foreach ($validated['matriculas'] as $matriculaData) {
            //Buscar matricula por la ID
            $matricula = Matricula::findOrFail($matriculaData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['estudiante_id', 'asignatura_id'] as $campo) {
                if (array_key_exists($campo, $matriculaData)) {
                    $datosActualizados[$campo] = $matriculaData[$campo];
                }
            }

            $matricula->update($datosActualizados);

            //Añadir matricula actualizada al array
            $matriculasActualizados[] = $matricula;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Matrícula/s actualizada/s con éxito',
            'matriculas' => $matriculasActualizadas,
        ]);
    }

    //Función para eliminar una o varias matrículas
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:matriculas,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar las matrículas de los IDs
        Matricula::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Matrícula/s eliminada/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
