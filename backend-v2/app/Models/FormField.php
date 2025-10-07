<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormField extends Model
{
    /**
     * The attributes that are mass assignable.
     * Corresponds to: form_id, field_label, field_type, placeholder, is_required, display_order
     */
    protected $fillable = [
        'form_id',
        'field_label',
        'field_type',
        'placeholder',
        'is_required',
        'display_order',
    ];

    /**
     * Get the form that owns this field.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}
