<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Models\Chatbot;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WidgetController extends Controller
{
    /**
     * Get chatbot data for widget
     * This endpoint is protected by VerifyWidgetDomain middleware
     */
    public function getChatbot(Request $request, $chatbotId)
    {
        // Middleware has already verified domain and chatbot ownership
        // verified_user_id is attached to request by middleware

        try {
            // Get chatbot with user verification
            $chatbot = Chatbot::where('id', $chatbotId)
                ->where('user_id', $request->input('verified_user_id'))
                ->first();

            if (!$chatbot) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chatbot not found or not authorized'
                ], 404);
            }

            // Get all questions for this chatbot, ordered by display_order
            $questions = Question::where('chatbot_id', $chatbotId)
                ->orderBy('display_order')
                ->get();

            // Transform questions using the resource
            $transformedQuestions = QuestionResource::collection($questions);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (string) $chatbot->id,
                    'name' => $chatbot->name,
                    'questions' => $transformedQuestions
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Widget API Error: ' . $e->getMessage(), [
                'chatbot_id' => $chatbotId,
                'domain' => $request->input('verified_domain')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading the chatbot'
            ], 500);
        }
    }
}
