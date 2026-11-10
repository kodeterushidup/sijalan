<?php

namespace App\Policies;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\User;

class TripPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Trip $trip): bool
    {
        if ($user->role->canManageData() || $user->role->isApprover()) {
            return true;
        }

        return $trip->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role->canManageData();
    }

    public function update(User $user, Trip $trip): bool
    {
        if (! $user->role->canManageData()) {
            return false;
        }

        return in_array($trip->status, [
            TripStatus::Draft,
            TripStatus::Diajukan,
            TripStatus::Ditolak,
            TripStatus::Disetujui,
            TripStatus::Berlangsung,
        ], true);
    }

    public function delete(User $user, Trip $trip): bool
    {
        return $user->role->canManageData() && $trip->status === TripStatus::Draft;
    }

    public function approve(User $user, Trip $trip): bool
    {
        return $user->role->isApprover() && $trip->status === TripStatus::Diajukan;
    }

    public function reject(User $user, Trip $trip): bool
    {
        return $user->role->isApprover() && $trip->status === TripStatus::Diajukan;
    }

    public function updateReport(User $user, Trip $trip): bool
    {
        return $trip->user_id === $user->id && $trip->status === TripStatus::Berlangsung;
    }

    public function uploadPhotos(User $user, Trip $trip): bool
    {
        return $trip->user_id === $user->id && $trip->status === TripStatus::Berlangsung;
    }

    public function complete(User $user, Trip $trip): bool
    {
        return $user->role->canManageData() && $trip->status === TripStatus::Berlangsung;
    }
}
