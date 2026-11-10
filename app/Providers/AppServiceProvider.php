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
        $this->ensureSqliteDatabaseExists();
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
