<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('email')->unique(); //Correo único
            $table->string('password'); //Repetir contraseña y cifrada
            $table->string('telefono')->nullable(); //Opcional
            $table->date('fecha_nac'); //(EJ: 2000-12-31)
            $table->string('direccion');
            $table->string('rol'); //(administrador, profesor o estudiante)
            $table->timestamps(); //created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
