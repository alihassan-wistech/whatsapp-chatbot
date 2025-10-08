<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User; // Assuming your User model is in App\Models

class AuthController extends Controller
{
    /**
     * Handle user registration (Sign Up).
     * * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function signup(Request $request)
    {
        // 1. Validate the incoming request data
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'name' => 'nullable|string|max:255',
        ]);

        try {
            // 2. Create the user in the database
            $user = User::create([
                'email' => $request->email,
                // Securely hash the password using Laravel's Hash facade
                'password' => Hash::make($request->password),
                'name' => $request->name,
                // Add any other required default fields (e.g., status, role)
            ]);

            // 3. Return a success response (HTTP 201 Created)
            return response()->json([
                'message' => 'User account created successfully.',
                'userId' => $user->id
            ], 201);

        } catch (\Exception $e) {
            // Log the error and return a generic server error
            \Log::error('User registration failed: ' . $e->getMessage());
            return response()->json([
                'error' => 'Could not create user account due to a server error.'
            ], 500);
        }
    }

    /**
     * Handle user login and API token generation (Sign In).
     * * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // 1. Validate the incoming request data
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Attempt to authenticate the user using the 'web' guard
        // (which typically handles email/password validation)
        if (! Auth::attempt($credentials)) {
            // Return 401 Unauthorized, mirroring your Node.js error response [cite: Invalid email or password]
            return response()->json([
                'error' => 'Invalid email or password'
            ], 401);
        }

        // 3. Retrieve the authenticated user model
        $user = Auth::user();

        // 4. Delete old tokens (Good security practice)
        // If you want multiple tokens per user/device, omit this line.
        $user->tokens()->delete();

        // 5. Create a new Sanctum token
        // The token name is just for identification in the database
        $token = $user->createToken('auth_token')->plainTextToken;

        // 6. Return the token and essential user data to the frontend
        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ]
        ]);
    }

    /**
     * Handle user logout (Revokes the current API token).
     * * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // The request user is available because the route is protected by 'auth:sanctum'
        if ($request->user()) {
            // Revoke the token that was used to authenticate the current request
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Successfully logged out']);
    }
}
