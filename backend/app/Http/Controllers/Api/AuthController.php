<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RefreshToken;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private JwtService $jwt) {}

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Pogrešan email ili lozinka.'],
            ]);
        }

        return response()->json($this->tokensFor($user));
    }

    public function refresh(Request $request)
    {
        $data = $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $stored = RefreshToken::where('token_hash', hash('sha256', $data['refresh_token']))->first();

        if (! $stored || ! $stored->isValid()) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Sesija je istekla. Potrebna je ponovna prijava.'],
            ]);
        }

        $stored->update(['revoked_at' => now()]);

        return response()->json($this->tokensFor($stored->user));
    }

    public function logout(Request $request)
    {
        $data = $request->validate([
            'refresh_token' => ['sometimes', 'nullable', 'string'],
        ]);

        if (! empty($data['refresh_token'])) {
            RefreshToken::where('token_hash', hash('sha256', $data['refresh_token']))
                ->update(['revoked_at' => now()]);
        }

        return response()->json(['message' => 'Odjavljeni ste.']);
    }

    public function me(Request $request)
    {
        return $this->presentUser($request->user());
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Trenutna lozinka nije tačna.'],
            ]);
        }

        $user->forceFill(['password' => $data['password']])->save();
        $user->refreshTokens()->update(['revoked_at' => now()]);

        return response()->json(['message' => 'Lozinka je promenjena. Prijavi se ponovo.']);
    }

    private function tokensFor(User $user): array
    {
        $refreshToken = Str::random(80);

        $user->refreshTokens()->create([
            'token_hash' => hash('sha256', $refreshToken),
            'expires_at' => now()->addDays((int) config('auth_jwt.refresh_ttl_days')),
        ]);

        return [
            'access_token' => $this->jwt->issueAccessToken($user),
            'refresh_token' => $refreshToken,
            'user' => $this->presentUser($user),
        ];
    }

    private function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'school_id' => $user->school_id,
        ];
    }
}
