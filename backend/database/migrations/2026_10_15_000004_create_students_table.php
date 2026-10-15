<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('sex', ['male', 'female']);
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->json('sports')->nullable();
            $table->json('health_issues')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'archived_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
