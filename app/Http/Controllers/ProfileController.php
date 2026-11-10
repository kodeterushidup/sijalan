<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'jabatan' => $user->jabatan,
                'golongan' => $user->golongan,
                'unit' => $user->unit?->nama,
                'role_label' => $user->role->label(),
                'has_ttd' => (bool) $user->ttd_path,
                'ttd_url' => $user->ttd_path ? route('ttd.show', $user) : null,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'no_hp' => ['nullable', 'string', 'max:20'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', 'Profil diperbarui.');
    }

    public function uploadTtd(Request $request): RedirectResponse
    {
        $request->validate([
            'ttd' => ['required', 'image', 'mimes:png,jpg,jpeg', 'max:1024'],
        ]);

        $user = $request->user();
        $this->deleteTtdFile($user);

        $path = $request->file('ttd')->storeAs(
            'ttd',
            'ttd-'.$user->id.'.'.$request->file('ttd')->extension(),
            'local',
        );

        $user->update(['ttd_path' => $path]);

        return back()->with('success', 'Tanda tangan diperbarui.');
    }

    public function destroyTtd(Request $request): RedirectResponse
    {
        $user = $request->user();
        $this->deleteTtdFile($user);
        $user->update(['ttd_path' => null]);

        return back()->with('success', 'Tanda tangan dihapus.');
    }

    public function showTtd(User $user): StreamedResponse
    {
        abort_unless($user->ttd_path && Storage::disk('local')->exists($user->ttd_path), 404);

        return Storage::disk('local')->response($user->ttd_path, null, [
            'Cache-Control' => 'private, no-store',
        ]);
    }

    private function deleteTtdFile(User $user): void
    {
        if ($user->ttd_path) {
            Storage::disk('local')->delete($user->ttd_path);
        }
    }
}
