<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class Asignatura extends Model
{
    //Definir campos que NO pueden ser asignados masivamente. En este caso ninguno.
	protected $guarded = [];

    //Relacionar las tablas con Eloquent
    public function curso() {
        return $this->belongsTo(Curso::class);
    }
    public function profesor() {
        return $this->belongsTo(Profesor::class);
    }
}
