<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $units = Unit::query()
            ->withCount(['users', 'trips'])
            ->orderBy('nama')
            ->get()
            ->map(fn (Unit $unit): array => [
                'id' => $unit->id,
                'kode' => $unit->kode,
                'nama' => $unit->nama,
                'users_count' => $unit->users_count,
                'trips_count' => $unit->trips_count,
            ]);

        return Inertia::render('Units/Index', ['units' => $units]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'alpha_dash', 'unique:units,kode'],
            'nama' => ['required', 'string', 'max:120'],
        ]);

        Unit::query()->create([
            'kode' => mb_strtoupper($validated['kode']),
            'nama' => $validated['nama'],
        ]);

        return back()->with('success', 'Unit kerja ditambahkan.');
    }

    public function edit(Unit $unit): Response
    {
        return Inertia::render('Units/Edit', [
            'unit' => [
                'id' => $unit->id,
                'kode' => $unit->kode,
                'nama' => $unit->nama,
            ],
        ]);
    }

    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:20', 'alpha_dash', Rule::unique('units', 'kode')->ignore($unit->id)],
            'nama' => ['required', 'string', 'max:120'],
        ]);

        $unit->update([
            'kode' => mb_strtoupper($validated['kode']),
            'nama' => $validated['nama'],
        ]);

        return redirect()->route('units.index')->with('success', 'Unit kerja diperbarui.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->users()->exists() || $unit->trips()->exists()) {
            return back()->with('error', 'Unit kerja tidak dapat dihapus karena masih dipakai pegawai atau perjalanan.');
        }

        $unit->delete();

        return back()->with('success', 'Unit kerja dihapus.');
    }
}
