export async function refreshAccessToken(refreshToken: string) {
    const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
    const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
    const clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: "openid profile email offline_access Mail.Read Mail.ReadWrite Mail.ReadWrite.Shared Mail.Send OnlineMeetings.Read OnlineMeetings.ReadWrite User.Read"
    });

    const response = await fetch(url, {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || 'Failed to refresh access token');
    return {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        refresh_token: data.refresh_token ?? refreshToken
    };
} 