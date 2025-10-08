<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AllowedDomain;
use App\Models\Chatbot;

class VerifyWidgetDomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get domain from header
        $domain = $request->header('X-Widget-Domain');

        if (!$domain) {
            return response()->json([
                'success' => false,
                'message' => 'Domain header is required'
            ], 400);
        }

        // Get chatbot ID from route parameter
        $chatbotId = $request->route('chatbot');

        if (!$chatbotId) {
            return response()->json([
                'success' => false,
                'message' => 'Chatbot ID is required'
            ], 400);
        }

        // Find the chatbot
        $chatbot = Chatbot::find($chatbotId);

        if (!$chatbot) {
            return response()->json([
                'success' => false,
                'message' => 'Chatbot not found'
            ], 404);
        }

        // Check if domain is allowed for this user
        $allowedDomain = AllowedDomain::where('domain', $domain)
            ->where('user_id', $chatbot->user_id)
            ->where('is_active', true)
            ->first();

        if (!$allowedDomain) {
            return response()->json([
                'success' => false,
                'message' => 'Domain not authorized for this chatbot'
            ], 403);
        }

        // Attach user_id and domain to request for controller use
        $request->merge([
            'verified_user_id' => $chatbot->user_id,
            'verified_domain' => $domain
        ]);

        return $next($request);
    }
}
