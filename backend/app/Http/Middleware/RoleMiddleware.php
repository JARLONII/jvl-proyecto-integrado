<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        //Si el usuario no tiene el rol requerido manda mensaje de error
        if (!$user || !in_array($user->rol, $roles)) {
            return response()->json(['error' => 'No autorizado.'], 403);
        }

        return $next($request);
    }
}
