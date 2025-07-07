export async function fetchStaff() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/staff`, {
        cache: "no-store",
    })
    if (!response.ok) {
        throw new Error("Failed to fetch staff")
    }
    return response.json()
}