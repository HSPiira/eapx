import { useEffect, useState } from "react";
import { SessionRequestForm } from "@/components/session-booking/SessionRequestForm";

export default function RequestSessionPage() {
    const [companies, setCompanies] = useState([]);
    const [staff, setStaff] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [companiesRes, staffRes, counselorsRes, beneficiariesRes] = await Promise.all([
                fetch("/api/clients"),
                fetch("/api/staff"),
                fetch("/api/counselors"),
                fetch("/api/beneficiaries"),
            ]);
            setCompanies(await companiesRes.json());
            setStaff(await staffRes.json());
            setCounselors(await counselorsRes.json());
            setBeneficiaries(await beneficiariesRes.json());
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <SessionRequestForm
            companies={companies}
            staff={staff}
            counselors={counselors}
            beneficiaries={beneficiaries}
            onSubmit={async (data) => {
                await fetch("/api/session-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            }}
        />
    );
} 