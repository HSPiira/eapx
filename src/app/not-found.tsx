import Link from 'next/link';
import React from 'react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
            <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-500">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Oops...page not found!</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Go to Dashboard
            </Link>
        </div>
    );
} 