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
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('matricula_id'); //FK de matriculas
            $table->date('fecha'); //(EJ: 2000-12-31)
            $table->boolean('presente')->default(true); //true o false
            $table->boolean('falta_justificada')->nullable(); //Opcional
            $table->timestamps(); //created_at y updated_at

            //Definir claves foráneas
            $table->foreign('matricula_id')->references('id')->on('matriculas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
