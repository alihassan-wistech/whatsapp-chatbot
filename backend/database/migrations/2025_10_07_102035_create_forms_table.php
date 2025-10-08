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
        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chatbot_id')
                ->constrained('chatbots', 'id', 'constrained_chatbot_id_2')
                ->onDelete('cascade')
                ->index("idx_chatbot_id_2");
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('position', ['start', 'end', 'none'])->default('none');
            $table->string('submit_button_text', 100)->default('Submit');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};
