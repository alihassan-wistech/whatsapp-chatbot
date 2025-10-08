<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Chatbot extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: user_id, name, description, enable_whatsapp, enable_website
     */
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'enable_whatsapp',
        'enable_website',
    ];

    /**
     * Get the user that owns the chatbot.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A Chatbot has many Questions, which define the conversation flow.
     */
    public function questions(): HasMany
    {
        // We order by display_order for easy rendering in the FlowBuilder
        return $this->hasMany(Question::class)->orderBy('display_order');
    }

    /**
     * A Chatbot has one Form, used for lead capture.
     * We use HasOne since, logically, a chatbot should only have one active form definition.
     */
    public function forms(): HasOne
    {
        return $this->hasOne(Form::class);
    }

    /**
     * A Chatbot has many FormSubmissions, logging all captured leads.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }
}
