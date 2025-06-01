<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    //Definir campos que NO pueden ser asignados masivamente. En este caso ninguno.
    protected $guarded = [];

    public function estudiantes() {
        return $this->hasMany(Estudiante::class);
    }
}
