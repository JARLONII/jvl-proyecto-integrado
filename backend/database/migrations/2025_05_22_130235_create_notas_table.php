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
        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('matricula_id'); //FK de matriculas
            $table->string('evaluacion'); //(Primera, segunda, tercera, o final)
            $table->float('nota'); //Del 0 al 10 (puede contener decimales)
            $table->string('observaciones')->nullable(); //Opcional
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
        Schema::dropIfExists('notas');
    }
};
