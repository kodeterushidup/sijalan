<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $unitId = $request->integer('unit');

        $employees = User::query()
            ->where('role', Role::Pegawai)
            ->with('unit:id,nama')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%"));
            })
            ->when($unitId > 0, fn ($query) => $query->where('unit_id', $unitId))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'nip' => $user->nip,
                'jabatan' => $user->jabatan,
                'golongan' => $user->golongan,
                'email' => $user->email,
                'unit' => $user->unit?->nama,
                'is_active' => $user->is_active,
            ]);

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'units' => $this->unitOptions(),
            'filters' => ['q' => $search, 'unit' => $unitId ?: null],
            'importErrors' => session('import_errors', []),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Employees/Create', [
            'units' => $this->unitOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        User::query()->create([
            ...$validated,
            'role' => Role::Pegawai,
            'is_active' => true,
            'password' => $validated['password'],
        ]);

        return redirect()->route('employees.index')->with('success', 'Pegawai ditambahkan.');
    }

    public function edit(User $employee): Response
    {
        abort_unless($employee->role === Role::Pegawai, 404);

        return Inertia::render('Employees/Edit', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'nip' => $employee->nip,
                'jabatan' => $employee->jabatan,
                'golongan' => $employee->golongan,
                'unit_id' => $employee->unit_id,
                'email' => $employee->email,
                'no_hp' => $employee->no_hp,
                'is_active' => $employee->is_active,
            ],
            'units' => $this->unitOptions(),
        ]);
    }

    public function update(Request $request, User $employee): RedirectResponse
    {
        abort_unless($employee->role === Role::Pegawai, 404);

        $validated = $request->validate($this->rules($employee));

        $employee->fill([
            'name' => $validated['name'],
            'nip' => $validated['nip'],
            'jabatan' => $validated['jabatan'] ?? null,
            'golongan' => $validated['golongan'] ?? null,
            'unit_id' => $validated['unit_id'],
            'email' => $validated['email'],
            'no_hp' => $validated['no_hp'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['password'])) {
            $employee->password = $validated['password'];
        }

        $employee->save();

        return redirect()->route('employees.index')->with('success', 'Data pegawai diperbarui.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $errors = [];
        $created = 0;
        $line = 0;

        if ($handle === false) {
            return back()->with('error', 'Berkas tidak dapat dibaca.');
        }

        while (($row = fgetcsv($handle, null, ',', '"', '\\')) !== false) {
            $line++;

            if ($line === 1 || count(array_filter($row, fn ($value) => trim((string) $value) !== '')) === 0) {
                continue;
            }

            $row = array_map(fn ($value): string => trim((string) $value), array_pad($row, 6, ''));
            [$nip, $nama, $jabatan, $golongan, $kodeUnit, $email] = array_slice($row, 0, 6);

            $unit = Unit::query()->where('kode', mb_strtoupper($kodeUnit))->first();

            $validator = Validator::make([
                'nip' => $nip,
                'name' => $nama,
                'jabatan' => $jabatan,
                'golongan' => $golongan,
                'unit_id' => $unit?->id,
                'email' => $email,
            ], $this->importRules());

            if ($validator->fails()) {
                $errors[] = 'Baris '.$line.': '.implode(' ', $validator->errors()->all());

                continue;
            }

            try {
                DB::transaction(function () use ($nip, $nama, $jabatan, $golongan, $unit, $email): void {
                    User::query()->create([
                        'name' => $nama,
                        'nip' => $nip,
                        'jabatan' => $jabatan ?: null,
                        'golongan' => $golongan ?: null,
                        'unit_id' => $unit?->id,
                        'email' => $email,
                        'role' => Role::Pegawai,
                        'is_active' => true,
                        'password' => $nip,
                    ]);
                });

                $created++;
            } catch (ValidationException $exception) {
                $errors[] = 'Baris '.$line.': '.implode(' ', $exception->validator->errors()->all());
            }
        }

        fclose($handle);

        $response = back()->with('success', $created.' pegawai diimpor. Kata sandi awal sama dengan NIP.');

        if ($errors !== []) {
            $response->with('import_errors', $errors);
        }

        return $response;
    }

    /**
     * @return array<string, mixed>
     */
    private function importRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'nip' => ['required', 'digits:18', 'unique:users,nip'],
            'jabatan' => ['nullable', 'string', 'max:120'],
            'golongan' => ['nullable', 'string', 'max:20'],
            'unit_id' => ['required', 'exists:units,id'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?User $employee = null): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'nip' => ['required', 'digits:18', Rule::unique('users', 'nip')->ignore($employee?->id)],
            'jabatan' => ['nullable', 'string', 'max:120'],
            'golongan' => ['nullable', 'string', 'max:20'],
            'unit_id' => ['required', 'exists:units,id'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($employee?->id)],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'password' => [$employee ? 'nullable' : 'required', 'confirmed', Password::min(8)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function unitOptions(): array
    {
        return Unit::query()
            ->orderBy('nama')
            ->get(['id', 'nama'])
            ->map(fn (Unit $unit): array => ['value' => $unit->id, 'label' => $unit->nama])
            ->all();
    }
}
