<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class Profesor extends Model
{
    //Definir campos que NO pueden ser asignados masivamente. En este caso ninguno.
	protected $guarded = [];

    //Relacionar las tablas con Eloquent
    public function usuario() {
        return $this->belongsTo(Usuario::class);
    }
}
