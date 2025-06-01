<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario; //Llamar al modelo Usuario

class UsuarioController extends Controller
{

    //Función para crear uno o varios usuarios
    public function create(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'usuarios' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada usuario del array
            'usuarios.*.nombre' => 'required|string',
            'usuarios.*.apellidos' => 'required|string',
            'usuarios.*.email' => 'required|email|unique:usuarios,email',
            'usuarios.*.password' => 'required|string|min:8|confirmed',
            'usuarios.*.telefono' => 'nullable|string',
            'usuarios.*.fecha_nac' => 'required|date',
            'usuarios.*.direccion' => 'nullable|string',
            'usuarios.*.rol' => 'required|string',
        ]);

        //Crear los usuarios en un bucle
        $usuarios = [];
        foreach ($validated['usuarios'] as $usuarioData) {
            $usuarioData['password'] = bcrypt($usuarioData['password']); //Encriptar la contraseña
            $usuarios[] = Usuario::create($usuarioData); //Crear el usuario y añadirlo al array
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Usuarios creados con éxito',
            'usuarios' => $usuarios,
        ], 201); //201 significa "Creado"
    }

    //Función para leer uno o varios usuarios y una o varias columnas
    public function read(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'nullable|array', //Comprobar si hay array
            'ids.*' => 'integer|exists:usuarios,id', //Comprobar que hay un entero y existe
        ]);

        //Obtener las columnas pedidas
        $columns = $request->query('columns', '*'); //Si no se especifica nada, se obtienen todas
        if ($columns !== '*') { //Comprobar si se han pedido
            $columns = explode(',', $columns); //Separar las columnas por comas
        }

        //Si se proporcionan IDs, filtrar por esos IDs; de lo contrario, obtener todos los usuarios
        $query = Usuario::select($columns); //Crear query con las columnas
        if (!empty($validated['ids'])) { //Comprobar si se han escrito IDs
            $query->whereIn('id', $validated['ids']); //Si se han escrito, se saca las columnas solo de esos IDs
        }

        //Ordenar por ID
        $query->orderBy('id');

        //Hacerle GET al query para sacar los datos
        $usuarios = $query->get();

        //Devolver los datos de los usuarios
        return response()->json($usuarios);
    }

    //Crear función para modificar uno o varios usuarios
    public function update(Request $request)
    {
        //Validar el array de datos que llega
        $validated = $request->validate([
            'usuarios' => 'required|array', //Asegurarse de que sea un array
            //El * significa que se repite para cada usuario del array
            'usuarios.*.id' => 'required|integer|exists:usuarios,id', //Poner el ID del usuario que se va a modificar
            'usuarios.*.nombre' => 'nullable|string',
            'usuarios.*.apellidos' => 'nullable|string',
            'usuarios.*.email' => 'nullable|email',
            'usuarios.*.password' => 'nullable|string|min:8|',
            'usuarios.*.telefono' => 'nullable|string',
            'usuarios.*.fecha_nac' => 'nullable|date',
            'usuarios.*.direccion' => 'nullable|string',
            'usuarios.*.rol' => 'nullable|string',
            //Todo en nullable para que no sea obligatorio modificarlos
        ]);

        $usuariosActualizados = []; //Array para guardar los usuarios actualizados

        //Bucle para actualizar los usuarios
        foreach ($validated['usuarios'] as $usuarioData) {
            //Buscar el usuario por la ID
            $usuario = Usuario::findOrFail($usuarioData['id']);

            //Actualizar solo las columnas pedidas (si están en null no las cambia)
            $datosActualizados = [];

            foreach (['nombre', 'apellidos', 'email', 'telefono', 'fecha_nac', 'direccion'] as $campo) {
                if (array_key_exists($campo, $usuarioData)) {
                    $datosActualizados[$campo] = $usuarioData[$campo];
                }
            }

            if (!empty($usuarioData['password'])) {
                $datosActualizados['password'] = bcrypt($usuarioData['password']);
            }

            $usuario->update($datosActualizados);

            //Añadir el usuario actualizado al array
            $usuariosActualizados[] = $usuario;
        }

        //Devolver respuesta
        return response()->json([
            'message' => 'Usuario/s actualizado/s con éxito',
            'usuarios' => $usuariosActualizados,
        ]);

    }

    //Crear función para eliminar uno o varios usuarios
    public function delete(Request $request)
    {
        //Validar array de IDs
        $validated = $request->validate([
            'ids' => 'required|array', //Asegurarse de que sea un array
            'ids.*' => 'integer|exists:usuarios,id', //Cada ID debe ser un entero y existir en la tabla
        ]);

        //Eliminar los usuarios de los IDs
        Usuario::whereIn('id', $validated['ids'])->delete();

        //Devolver respuesta
        return response()->json([
            'message' => 'Usuario/s eliminado/s con éxito',
            'ids_eliminados' => $validated['ids'],
        ]);
    }
}
