<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatbotResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id, // CamelCase for JS/React frontend
            'name' => $this->name,
            'description' => $this->description,
            'enableWhatsapp' => (bool) $this->enable_whatsapp, // Ensure booleans are true/false
            'enableWebsite' => (bool) $this->enable_website,   // Ensure booleans are true/false
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'questions' => $this->questions ? QuestionResource::collection($this->questions) : [],
            'forms' => $this->forms ?? [],
        ];
    }
}
