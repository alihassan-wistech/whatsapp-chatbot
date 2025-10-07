<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: chatbot_id, user_phone
     */
    protected $fillable = [
        'chatbot_id',
        'user_phone',
    ];

    /**
     * Get the chatbot this submission belongs to.
     */
    public function chatbot()
    {
        return $this->belongsTo(Chatbot::class);
    }

    /**
     * Get the data entries for this submission.
     */
    public function data()
    {
        return $this->hasMany(FormSubmissionData::class, 'submission_id');
    }
}
