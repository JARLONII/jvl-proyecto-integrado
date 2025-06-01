<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as BaseModel;
use Carbon\Carbon;

class Model extends BaseModel
{
    //Sobrescribir el método serializeDate para ajustar la zona horaria
    protected function serializeDate(\DateTimeInterface $date)
    {
        return Carbon::parse($date)
            ->setTimezone(config('app.timezone')) //Ajustar a la zona horaria configurada
            ->toDateTimeString(); //Formatear como cadena
    }
}