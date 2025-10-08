<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Form extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: chatbot_id, title, description, position, submit_button_text
     */
    protected $fillable = [
        'chatbot_id',
        'title',
        'description',
        'position',
        'submit_button_text',
    ];

    /**
     * Get the chatbot this form belongs to.
     */
    public function chatbot()
    {
        return $this->belongsTo(Chatbot::class);
    }

    /**
     * Get the fields defined for this form.
     */
    public function fields()
    {
        return $this->hasMany(FormField::class);
    }
}
