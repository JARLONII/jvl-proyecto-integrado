<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    //Definir campos que NO pueden ser asignados masivamente. En este caso ninguno.
	protected $guarded = [];

    //Relacionar las tablas con Eloquent
    public function matricula() {
        return $this->belongsTo(Matricula::class);
    }
}
