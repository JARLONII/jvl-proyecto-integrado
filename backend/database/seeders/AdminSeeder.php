<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    //Función para crear al administrador automaticamente
    public function run()
    {
        Usuario::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'nombre' => 'admin',
                'apellidos' => 'admin',
                'telefono' => '611223344',
                'fecha_nac' => '2003-11-03',
                'direccion' => 'Dali 1',
                'rol' => 'administrador',
                'password' => Hash::make('admin123')
            ]
        );
    }
}
