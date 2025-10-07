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
        Schema::create('form_submission_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')
                ->constrained('form_submissions')
                ->onDelete('cascade')
                ->index("idx_submission_id");
            $table->foreignId('field_id')
                ->constrained('form_fields')
                ->onDelete('cascade');
            $table->text('field_value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_submission_data');
    }
};
