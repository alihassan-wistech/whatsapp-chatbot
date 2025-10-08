<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RenewTokenOnEveryRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Process the request first
        $response = $next($request);

        // 2. Check if the user was authenticated with a Sanctum token
        // We only renew if the request was successful and authenticated.
        $user = $request->user();

        if ($user && $request->is('api/*') && $response->isSuccessful()) {

            // Check if the user has an active token (via Sanctum's middleware)
            $currentAccessToken = $user->currentAccessToken();

            if ($currentAccessToken) {
                // a. Revoke the token used for the current request
                $currentAccessToken->delete();

                // b. Issue a brand new token
                // We use the same token name 'auth_token'
                $newToken = $user->createToken('auth_token')->plainTextToken;

                // c. Add the new token to the response header
                // The frontend MUST listen for this header to replace its stored token.
                $response->headers->set('X-New-Auth-Token', $newToken);
                $response->headers->set('Access-Control-Expose-Headers', 'X-New-Auth-Token');

                // Optional: Log the change for debugging
                Log::info("Token renewed for user ID: {$user->id}");
            }
        }

        return $response;
    }
}
