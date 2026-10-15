<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([SchoolSeeder::class, UserSeeder::class]);
    }

    public function test_login_returns_tokens_and_user(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'admin@evidencija.test', 'password' => UserSeeder::DEV_PASSWORD])
            ->assertOk()
            ->assertJsonStructure(['access_token', 'refresh_token', 'user' => ['id', 'name', 'email', 'role', 'school_id']])
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonMissingPath('user.password');
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'admin@evidencija.test', 'password' => 'pogresna'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_protected_routes_require_a_valid_token(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->withToken('nevazeci')->getJson('/api/auth/me')->assertUnauthorized();

        $teacher = User::where('role', User::TEACHER)->sole();
        $this->withJwt($teacher)->getJson('/api/auth/me')->assertOk()->assertJsonPath('email', $teacher->email);
    }

    public function test_refresh_rotates_the_refresh_token(): void
    {
        $refreshToken = $this->postJson('/api/auth/login', ['email' => 'nastavnik@evidencija.test', 'password' => UserSeeder::DEV_PASSWORD])
            ->json('refresh_token');

        $rotated = $this->postJson('/api/auth/refresh', ['refresh_token' => $refreshToken])->assertOk()->json('refresh_token');

        $this->assertNotSame($refreshToken, $rotated);
        $this->postJson('/api/auth/refresh', ['refresh_token' => $refreshToken])->assertUnprocessable();
    }

    public function test_logout_revokes_the_refresh_token(): void
    {
        $refreshToken = $this->postJson('/api/auth/login', ['email' => 'nastavnik@evidencija.test', 'password' => UserSeeder::DEV_PASSWORD])
            ->json('refresh_token');

        $this->postJson('/api/auth/logout', ['refresh_token' => $refreshToken])->assertOk();
        $this->postJson('/api/auth/refresh', ['refresh_token' => $refreshToken])->assertUnprocessable();
    }

    public function test_admin_middleware_allows_only_admins(): void
    {
        Route::middleware(['api', 'jwt', 'admin'])->get('/api/test-admin-only', fn () => ['ok' => true]);

        $this->withJwt(User::where('role', User::TEACHER)->sole())->getJson('/api/test-admin-only')->assertForbidden();
        $this->withJwt(User::where('role', User::ADMIN)->sole())->getJson('/api/test-admin-only')->assertOk();
    }
}
