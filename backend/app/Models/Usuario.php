<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable //Crear la clase que hereda las funcionalidades de Eloquent
{
    use HasApiTokens;
    //Definir campos que pueden ser asignados masivamente
    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'password',
        'telefono',
        'fecha_nac',
        'direccion',
        'rol',
    ];

    protected $table = 'usuarios';

}
