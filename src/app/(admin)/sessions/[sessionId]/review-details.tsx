import { FormData } from "./types";

// Pretty print object with unquoted keys for display
function prettyPrintObject(obj: unknown, indent = 2): string {
    if (obj === null) return 'null';
    if (Array.isArray(obj)) {
        return '[\n' + obj.map(v => ' '.repeat(indent) + prettyPrintObject(v, indent + 2)).join(',\n') + '\n' + ' '.repeat(indent - 2) + ']';
    }
    if (typeof obj === 'object') {
        return (
            '{\n' +
            Object.entries(obj as Record<string, unknown>)
                .map(
                    ([key, value]) =>
                        ' '.repeat(indent) +
                        key +
                        ': ' +
                        (typeof value === 'object' && value !== null
                            ? prettyPrintObject(value, indent + 2)
                            : JSON.stringify(value))
                )
                .join(',\n') +
            '\n' + ' '.repeat(indent - 2) + '}'
        );
    }
    return JSON.stringify(obj);
}

export function ReviewDetails({ formData, onConfirm }: { formData: FormData; onConfirm: () => void }) {
    return (
        <div className="w-full flex items-start justify-start mt-6">
            <form
                className="w-full bg-background rounded-sm p-8 border dark:border-gray-800 space-y-8"
                onSubmit={e => {
                    e.preventDefault();
                    onConfirm();
                }}
            >
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Review Details</h2>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Client Details</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.client)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Intervention</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.intervention)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Counselor & Availability</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.counselor)}</pre>
                </div>
                <div>
                    <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Location</h3>
                    <pre className="bg-muted p-2 rounded text-sm text-gray-900 dark:text-gray-100">{prettyPrintObject(formData.location)}</pre>
                </div>
                <div className="flex gap-4 justify-end">
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Confirm</button>
                </div>
            </form>
        </div>
    );
}