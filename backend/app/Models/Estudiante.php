<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    //Definir campos que NO pueden ser asignados masivamente. En este caso ninguno.
    protected $guarded = [];

    //Relacionar las tablas con Eloquent
    public function usuario() {
        return $this->belongsTo(Usuario::class);
    }
    public function curso() {
        return $this->belongsTo(Curso::class);
    }
}
