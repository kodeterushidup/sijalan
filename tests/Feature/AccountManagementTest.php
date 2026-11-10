<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_super_admin_cannot_manage_accounts(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/akun')
            ->assertForbidden();
    }

    public function test_super_admin_sees_account_list(): void
    {
        $this->actingAs(User::factory()->superAdmin()->create())
            ->get('/akun')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Accounts/Index')
                ->has('accounts.data', 1)
                ->has('roles', 4));
    }

    public function test_super_admin_can_create_an_account(): void
    {
        $this->actingAs(User::factory()->superAdmin()->create())
            ->post('/akun', [
                'name' => 'Operator Baru',
                'email' => 'operator@example.test',
                'role' => Role::Admin->value,
                'password' => 'rahasia123',
                'password_confirmation' => 'rahasia123',
            ])
            ->assertRedirect('/akun');

        $this->assertDatabaseHas('users', [
            'email' => 'operator@example.test',
            'role' => Role::Admin->value,
            'is_active' => true,
        ]);
    }

    public function test_super_admin_cannot_deactivate_own_account(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->patch("/akun/{$superAdmin->id}", [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'role' => Role::SuperAdmin->value,
                'is_active' => false,
                'password' => '',
            ])
            ->assertSessionHas('error');

        $this->assertTrue($superAdmin->fresh()->is_active);
    }

    public function test_super_admin_can_change_another_account_role(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $target = User::factory()->create();

        $this->actingAs($superAdmin)
            ->patch("/akun/{$target->id}", [
                'name' => $target->name,
                'email' => $target->email,
                'role' => Role::Pejabat->value,
                'is_active' => true,
                'password' => '',
            ])
            ->assertRedirect('/akun');

        $this->assertSame(Role::Pejabat, $target->fresh()->role);
    }
}
