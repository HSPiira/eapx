import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
    return NextResponse.json(data, { status: 201 });
}

export function noContent() {
    return new NextResponse(null, { status: 204 });
}

export function badRequest(message = "Bad Request") {
    return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
    return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
    return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not Found") {
    return NextResponse.json({ error: message }, { status: 404 });
}

export function internalError(message = "Internal Server Error") {
    return NextResponse.json({ error: message }, { status: 500 });
}
