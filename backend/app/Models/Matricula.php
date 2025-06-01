<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    //Definir campos que NO pueden ser asignados masivamente. En este caso ninguno.
	protected $guarded = [];

    //Relacionar las tablas con Eloquent
    public function estudiante() {
        return $this->belongsTo(Estudiante::class);
    }
    public function asignatura() {
        return $this->belongsTo(Asignatura::class);
    }
}
