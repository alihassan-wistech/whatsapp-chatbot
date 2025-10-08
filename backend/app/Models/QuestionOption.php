<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionOption extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: question_id, option_text, display_order
     */
    protected $fillable = [
        'question_id',
        'option_text',
        'display_order',
    ];

    /**
     * Get the question that owns this option.
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
