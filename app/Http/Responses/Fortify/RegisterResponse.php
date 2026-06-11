<?php

namespace App\Http\Responses\Fortify;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? response()->json('', 201)
            : redirect()->route('dashboard');
    }
}
