<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    //Función que se llama cuando el usuario no está autenticado
    protected function redirectTo($request)
    {
        //Lanzar el error 401 por defecto
        return null;
    }
}
