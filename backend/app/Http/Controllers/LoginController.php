<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        // Pedir credenciales
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Mostrar error si son inválidas
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Crear variable de usuario y token
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Devolver el token con los datos
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function comprobar(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        // Si está autenticado, devuelve la información del usuario
        return response()->json(Auth::user());
    }
}
