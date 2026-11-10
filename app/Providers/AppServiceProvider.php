<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->ensureStorageDirectoriesExist();
        $this->ensureSqliteDatabaseExists();
    }

    /**
     * Create the writable storage directories a fresh persistent volume lacks.
     *
     * When a volume is mounted on `storage/`, the packaged directory contents are
     * hidden. Blade, the session driver and the log writer need these paths.
     */
    protected function ensureStorageDirectoriesExist(): void
    {
        $directories = [
            'app/public',
            'framework/cache/data',
            'framework/sessions',
            'framework/testing',
            'framework/views',
            'logs',
        ];

        foreach ($directories as $directory) {
            $path = storage_path($directory);

            if (! is_dir($path)) {
                mkdir($path, 0775, true);
            }
        }
    }

    /**
     * Create the SQLite file when the app runs on an empty persistent volume.
     *
     * Laravel refuses to connect to a SQLite path that does not exist yet, and a
     * freshly mounted volume starts empty.
     */
    protected function ensureSqliteDatabaseExists(): void
    {
        $connection = config('database.default');

        if (config("database.connections.{$connection}.driver") !== 'sqlite') {
            return;
        }

        $database = config("database.connections.{$connection}.database");

        if (! is_string($database) || $database === ':memory:' || file_exists($database)) {
            return;
        }

        $directory = dirname($database);

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        touch($database);
    }
}
