<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: chatbot_id, parent_question_id, trigger_option, question_type,
     * question_text, answer_text, display_order, is_welcome
     */
    protected $fillable = [
        'chatbot_id',
        'parent_question_id',
        'trigger_option',
        'question_type',
        'question_text',
        'answer_text',
        'display_order',
        'is_welcome',
    ];

    /**
     * Get the chatbot this question belongs to.
     */
    public function chatbot()
    {
        return $this->belongsTo(Chatbot::class);
    }

    /**
     * Get the parent question (self-referencing).
     */
    public function parent()
    {
        return $this->belongsTo(Question::class, 'parent_question_id');
    }

    /**
     * Get the child questions.
     */
    public function children()
    {
        return $this->hasMany(Question::class, 'parent_question_id');
    }

    /**
     * Get the options for this question.
     */
    public function options()
    {
        return $this->hasMany(QuestionOption::class);
    }
}
