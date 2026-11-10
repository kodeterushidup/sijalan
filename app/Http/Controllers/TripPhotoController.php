<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\TripPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TripPhotoController extends Controller
{
    private const MAX_PHOTOS = 10;

    public function store(Request $request, Trip $trip): RedirectResponse
    {
        $this->authorize('uploadPhotos', $trip);

        $remaining = self::MAX_PHOTOS - $trip->photos()->count();

        if ($remaining <= 0) {
            return back()->with('error', 'Batas '.self::MAX_PHOTOS.' berkas dokumentasi per perjalanan sudah tercapai.');
        }

        $validated = $request->validate([
            'photos' => ['required', 'array', 'max:'.$remaining],
            'photos.*' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'keterangan' => ['nullable', 'array'],
            'keterangan.*' => ['nullable', 'string', 'max:150'],
        ], [
            'photos.max' => 'Sisa kuota dokumentasi hanya '.$remaining.' berkas.',
            'photos.*.mimes' => 'Setiap berkas harus JPG, PNG, atau PDF.',
            'photos.*.max' => 'Ukuran setiap berkas maksimal 5 MB.',
        ]);

        foreach ($request->file('photos', []) as $index => $file) {
            $path = $file->store('dokumentasi/'.$trip->id, 'public');

            $trip->photos()->create([
                'path' => $path,
                'keterangan' => $validated['keterangan'][$index] ?? null,
                'uploaded_by' => $request->user()->id,
            ]);
        }

        return back()->with('success', 'Dokumentasi perjalanan diunggah.');
    }

    public function destroy(Trip $trip, TripPhoto $photo): RedirectResponse
    {
        $this->authorize('uploadPhotos', $trip);

        abort_unless($photo->trip_id === $trip->id, 404);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return back()->with('success', 'Berkas dokumentasi dihapus.');
    }
}
