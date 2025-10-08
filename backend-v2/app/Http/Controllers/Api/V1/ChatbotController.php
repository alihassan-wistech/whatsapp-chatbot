<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Chatbot;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Form;
use App\Models\FormField;
use App\Http\Resources\V1\ChatbotResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

/**
 * Handles CRUD and complex transactional save operations for Chatbots and their related data.
 */
class ChatbotController extends Controller
{
    /**
     * Display a listing of the user's chatbots.
     * GET /api/v1/chatbots
     */
    public function index()
    {
        $userId = Auth::id();
        $chatbots = Chatbot::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return ChatbotResource::collection($chatbots);
    }

    /**
     * Store a newly created chatbot and its configuration (questions/form) in storage.
     * POST /api/v1/chatbots
     */
    public function store(Request $request)
    {
        // 1. Validate the top-level Chatbot data
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'enable_whatsapp' => 'sometimes|boolean',
            'enable_website' => 'sometimes|boolean',
            'questions' => 'sometimes|array',
            'formConfig' => 'sometimes|array',
        ]);

        DB::beginTransaction();
        try {
            // 2a. Create the base Chatbot record
            $chatbot = Chatbot::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'description' => $request->description,
                'enable_whatsapp' => $request->boolean('enable_whatsapp', true),
                'enable_website' => $request->boolean('enable_website', true),
            ]);

            if ($request->has('questions')) {
                // 2b. Save Questions and Options (Handles parent_question_id logic)
                $this->saveQuestions($chatbot, $request->questions);
            }

            if ($request->has('formConfig')) {
                // 2c. Save Form and Fields
                $this->saveForm($chatbot, $request->formConfig);
            }

            DB::commit();
            // 3. Return the created resource (loading relations for completeness)
            return (new ChatbotResource($chatbot->load(['questions', 'forms'])))
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creating chatbot: " . $e->getMessage());
            return response()->json(['error' => 'Failed to create chatbot.'], 500);
        }
    }

    public function show(Chatbot $chatbot)
    {
        $userId = Auth::id();
        if($userId == $chatbot->user_id) {
            $chatbot->load('questions', 'forms');
            return new ChatbotResource($chatbot);
        }else{
            return response()->json(['error' => 'Unauthorized or Chatbot not found.'], 403);
        }
    }

    /**
     * Update the specified chatbot and its configuration (questions/form) in storage.
     * PUT/PATCH /api/v1/chatbots/{chatbot}
     */
    public function update(Request $request, Chatbot $chatbot)
    {
        // 1. Authorization Check: Must own the chatbot.
        if ($chatbot->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized or Chatbot not found.'], 403);
        }

        // 2. Validation
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'enable_whatsapp' => 'sometimes|boolean',
            'enable_website' => 'sometimes|boolean',
            'questions' => 'sometimes|array', // The whole array is sent on update
            'formConfig' => 'sometimes|array',
        ]);

        DB::beginTransaction();
        try {
            $chatbot->update($request->only([
                'name',
                'description',
                'enable_whatsapp',
                'enable_website'
            ]));
            if ($request->has('questions')) {
                // Delete existing questions, which cascades to options
                $chatbot->questions()->delete();
                $this->saveQuestions($chatbot, $request->questions);
            }

            if ($request->has('formConfig')) {
                // Delete existing form, which cascades to form_fields
                $chatbot->forms()->delete();
                $this->saveForm($chatbot, $request->formConfig);
            }
            DB::commit();
            return new ChatbotResource($chatbot->load(['questions', 'forms']));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating chatbot: " . $e->getMessage());
            return response()->json(['error' => 'Failed to update chatbot.'], 500);
        }
    }

    /**
     * Remove the specified chatbot from storage.
     * DELETE /api/v1/chatbots/{chatbot}
     */
    public function destroy(Chatbot $chatbot)
    {
        // 1. Authorization Check
        if ($chatbot->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized or Chatbot not found.'], 403);
        }

        // 2. Deletion cascades, removing questions, options, forms, and fields automatically
        $chatbot->delete();

        return response()->json(null, 204);
    }


    // --- PRIVATE HELPER METHODS ---

    /**
     * Handles saving the form and its fields.
     */
    private function saveForm(Chatbot $chatbot, array $formConfig)
    {
        // 1. Create the Form record
        $form = Form::create([
            'chatbot_id' => $chatbot->id,
            'title' => $formConfig['title'] ?? 'Lead Capture Form',
            'description' => $formConfig['description'] ?? null,
            'position' => $formConfig['position'] ?? 'none',
            'submit_button_text' => $formConfig['submitButtonText'] ?? 'Submit',
        ]);

        // 2. Create the Form Fields
        $fields = $formConfig['fields'] ?? [];

        foreach ($fields as $fieldData) {
            FormField::create([
                'form_id' => $form->id,
                'field_label' => $fieldData['label'],
                'field_type' => $fieldData['type'],
                'placeholder' => $fieldData['placeholder'] ?? null,
                'is_required' => $fieldData['required'] ?? false,
                'display_order' => $fieldData['order'] ?? 0,
            ]);
        }
    }

    /**
     * Saves questions and their options, handling parent-child relationships using a single pass.
     */
    private function saveQuestions(Chatbot $chatbot, array $questions)
    {
        // Map to store temporary frontend ID (string) to permanent database ID (int)
        $idMap = [];

        // Process all questions in the array
        foreach ($questions as $order => $qData) {

            // 1. Resolve Parent ID: Check if the parent has already been saved and its DB ID is mapped.
            $parentDbId = null;
            if (isset($qData['parentQuestionId']) && isset($idMap[$qData['parentQuestionId']])) {
                $parentDbId = $idMap[$qData['parentQuestionId']];
            }

            // 2. Create the new Question record
            $question = Question::create([
                'chatbot_id' => $chatbot->id,
                'parent_question_id' => $parentDbId, // This is the resolved DB ID
                'trigger_option' => $qData['triggerOption'] ?? null,
                'question_type' => $qData['type'],
                'question_text' => $qData['question'],
                'answer_text' => $qData['answer'] ?? null,
                'display_order' => $order,
                'is_welcome' => $qData['isWelcome'] ?? false,
            ]);

            // 3. Map the current question's new DB ID for its future children to use
            $idMap[$qData['id']] = $question->id;

            // 4. Handle Options
            if ($qData['type'] === 'options' && isset($qData['options']) && is_array($qData['options'])) {
                foreach ($qData['options'] as $optionOrder => $optionText) {
                    QuestionOption::create([
                        'question_id' => $question->id,
                        'option_text' => $optionText,
                        'display_order' => $optionOrder,
                    ]);
                }
            }
        }
    }
}
