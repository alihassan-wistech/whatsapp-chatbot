<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'type' => $this->question_type, // Maps to 'text', 'options', or 'conditional'
            'question' => $this->question_text,
            'answer' => $this->when($this->answer_text !== null, $this->answer_text),
            'options' => $this->when($this->options !== null, $this->options()->pluck('option_text')),
            'conditions' => $this->when(
                $this->conditions !== null,
                function () {
                    return collect($this->conditions)->map(function ($condition) {
                        return [
                            'trigger' => $condition['trigger'],
                            'nextQuestionId' => (string) $condition['nextQuestionId'],
                        ];
                    })->toArray();
                }
            ),
            'optionFlows' => $this->when(
                $this->option_flows !== null,
                function () {
                    return collect($this->option_flows)->map(function ($flow) {
                        return [
                            'optionText' => $flow['optionText'],
                            'nextQuestionId' => (string) $flow['nextQuestionId'],
                        ];
                    })->toArray();
                }
            ),
            'parentQuestionId' => $this->when(
                $this->parent_question_id !== null,
                (string) $this->parent_question_id
            ),
            'triggerOption' => $this->when($this->trigger_option !== null, $this->trigger_option),
            'isWelcome' => $this->when($this->is_welcome !== null, (bool) $this->is_welcome),
        ];
    }
}
