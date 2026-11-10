<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        $setting = Setting::current();

        return Inertia::render('Settings/Edit', [
            'setting' => [
                'nama_instansi' => $setting->nama_instansi,
                'alamat' => $setting->alamat,
                'format_nomor' => $setting->format_nomor,
                'nama_pejabat' => $setting->nama_pejabat,
                'nip_pejabat' => $setting->nip_pejabat,
                'logo_url' => $setting->logoUrl(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_instansi' => ['required', 'string', 'max:160'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'format_nomor' => ['required', 'string', 'max:160'],
            'nama_pejabat' => ['nullable', 'string', 'max:120'],
            'nip_pejabat' => ['nullable', 'digits:18'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
        ]);

        $setting = Setting::current();

        if ($request->hasFile('logo')) {
            $this->deleteLogo($setting);
            $setting->logo_path = $request->file('logo')->store('instansi', 'public');
        } elseif ($request->boolean('remove_logo')) {
            $this->deleteLogo($setting);
            $setting->logo_path = null;
        }

        $setting->fill([
            'nama_instansi' => $validated['nama_instansi'],
            'alamat' => $validated['alamat'] ?? null,
            'format_nomor' => $validated['format_nomor'],
            'nama_pejabat' => $validated['nama_pejabat'] ?? null,
            'nip_pejabat' => $validated['nip_pejabat'] ?? null,
        ])->save();

        return back()->with('success', 'Pengaturan instansi disimpan.');
    }

    private function deleteLogo(Setting $setting): void
    {
        if ($setting->logo_path) {
            Storage::disk('public')->delete($setting->logo_path);
        }
    }
}
