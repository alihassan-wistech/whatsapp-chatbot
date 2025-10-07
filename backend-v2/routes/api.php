<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get("/ok", function () {
    return response()->json(["status" => "ok"]);
});

Route::group(['prefix' => 'v1', 'as' => 'v1.'], function () {
    Route::group(['prefix' => 'auth'], function () {
        // Route::post('/signup', [App\Http\Controllers\Api\V1\AuthController::class, 'signup']);
        Route::post('/login', [App\Http\Controllers\Api\V1\AuthController::class, 'login']);
        Route::post('/logout', [App\Http\Controllers\Api\V1\AuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    Route::group(['middleware' => ['auth:sanctum', 'renew_token_on_every_request']], function () {

        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        Route::group(['prefix' => 'chatbots', 'as' => 'chatbots.'], function () {
            Route::get('/', [App\Http\Controllers\Api\V1\ChatbotController::class, 'index']);
            Route::post('/', [App\Http\Controllers\Api\V1\ChatbotController::class, 'store']);
            Route::get('/{chatbot}', [App\Http\Controllers\Api\V1\ChatbotController::class, 'show']);
            Route::put('/{chatbot}', [App\Http\Controllers\Api\V1\ChatbotController::class, 'update']);
            Route::delete('/{chatbot}', [App\Http\Controllers\Api\V1\ChatbotController::class, 'destroy']);
        });
    });
});
