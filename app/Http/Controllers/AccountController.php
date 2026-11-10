<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));

        $accounts = User::query()
            ->with('unit:id,nama')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%"));
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'unit' => $user->unit?->nama,
                'is_active' => $user->is_active,
            ]);

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
            'filters' => ['q' => $search],
            'roles' => $this->roleOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Accounts/Create', [
            'roles' => $this->roleOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'role' => ['required', Rule::enum(Role::class)],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        User::query()->create([
            ...$validated,
            'is_active' => true,
        ]);

        return redirect()->route('accounts.index')->with('success', 'Akun berhasil dibuat.');
    }

    public function edit(User $account): Response
    {
        return Inertia::render('Accounts/Edit', [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'email' => $account->email,
                'role' => $account->role->value,
                'is_active' => $account->is_active,
            ],
            'roles' => $this->roleOptions(),
        ]);
    }

    public function update(Request $request, User $account): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($account->id)],
            'role' => ['required', Rule::enum(Role::class)],
            'is_active' => ['boolean'],
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ]);

        if ($account->is($request->user()) && (! $validated['is_active'] || $validated['role'] !== $account->role->value)) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan atau mengubah peran akun sendiri.');
        }

        $account->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'],
        ]);

        if (! empty($validated['password'])) {
            $account->password = $validated['password'];
        }

        $account->save();

        return redirect()->route('accounts.index')->with('success', 'Akun diperbarui.');
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function roleOptions(): array
    {
        return collect(Role::cases())
            ->map(fn (Role $role): array => ['value' => $role->value, 'label' => $role->label()])
            ->values()
            ->all();
    }
}
