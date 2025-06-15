import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

export function generateFeedbackToken(sessionId: string, providerId: string): string {
    return sign(
        { sessionId, providerId },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

export function verifyFeedbackToken(token: string): { sessionId: string; providerId: string } {
    return verify(token, JWT_SECRET) as { sessionId: string; providerId: string };
} 