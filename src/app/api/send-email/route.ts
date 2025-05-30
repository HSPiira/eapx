// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmailGraph } from '@/lib/microsoft-graph';

export async function POST(req: NextRequest) {
    const { to, subject, body } = await req.json();

    try {
        await sendEmailGraph({ to, subject, body });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
