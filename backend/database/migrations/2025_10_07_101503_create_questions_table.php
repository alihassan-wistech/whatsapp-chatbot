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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chatbot_id')
                ->constrained('chatbots')
                ->onDelete('cascade')
                ->index('idx_chatbot_id');
            $table->foreignId('parent_question_id')
                ->nullable()
                ->constrained('questions')
                ->onDelete('cascade')
                ->index('idx_parent_chatbot_id');
            $table->string('trigger_option', 255)->nullable();
            $table->enum('question_type', ['text', 'options']);
            $table->text('question_text');
            $table->text('answer_text')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_welcome')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
