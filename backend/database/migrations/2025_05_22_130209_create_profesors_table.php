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
        Schema::create('profesors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id'); //FK de usuarios
            $table->string('departamento'); //(EJ: Matemáticas, Lengua, Informática, etc.)
            $table->timestamps(); //created_at y updated_at

            //Definir claves foráneas
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesors');
    }
};
