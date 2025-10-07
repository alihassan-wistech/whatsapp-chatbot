<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmissionData extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: submission_id, field_id, field_value
     */
    protected $fillable = [
        'submission_id',
        'field_id',
        'field_value',
    ];

    /**
     * Get the parent submission record.
     */
    public function submission()
    {
        return $this->belongsTo(FormSubmission::class, 'submission_id');
    }

    /**
     * Get the definition of the form field.
     */
    public function field()
    {
        return $this->belongsTo(FormField::class, 'field_id');
    }
}
