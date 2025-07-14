import fetch, { Response } from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { BaseStatus, ContactMethod, WorkStatus } from '@prisma/client';

const BASE_URL = 'http://localhost:3000/api';

// Types
interface StaffResponse {
    data: unknown[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface ErrorResponse {
    error: string;
    details?: unknown;
}

// Helper function to create a test client
async function createTestClient(): Promise<string> {
    const testClient = await prisma.client.upsert({
        where: { name: 'Test Client' },
        update: {},
        create: {
            name: 'Test Client',
            email: `test-${uuidv4()}@example.com`,
            phone: '+1234567890',
            status: BaseStatus.ACTIVE,
            preferredContactMethod: ContactMethod.EMAIL,
            isVerified: true,
        },
    });

    return testClient.id;
}

// Test data
const testStaffData = {
    email: `test-${uuidv4()}@example.com`,
    fullName: 'Test Staff Member',
    jobTitle: 'Test Position',
    startDate: new Date().toISOString(),
    managementLevel: 'JUNIOR',
    employmentType: 'FULL_TIME',
    educationLevel: 'BACHELORS',
    maritalStatus: 'SINGLE',
    status: 'ACTIVE',
    qualifications: ['Test Qualification'],
    specializations: ['Test Specialization'],
};

// Helper function to create a test user and get a session token
async function getTestUserToken(): Promise<string> {
    // Return the provided session token
    return 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoibWM2NU00T3BKOUwtdVNId3BteGM3R1owSndQVzB0TVk2Z1dEbUxOcTNvMER2bVVBcWZXU1FpZVFEYVZjN3IyTEZ2NEJsekR4dVdlNElldzBTWlFibHcifQ..eOTkW41uY6ax0nhqQBuysw.hv4a2OCgOaIW6jomVkl8O8FwKRL4vUQJkuBiW5dnWVh5nXmW7VVHFFzcknjmkoqwr0FDMv01tHtPM-W-sr91wCtKXl8dSXtX_XUT9NoGIx9cqX7W3zJMaoLpt8Bu1Bdm1bZZ7D0Uo2kZzzWpr2aFQ2j7cB0Gj8eJkxaGteuawE3xktPtgLjcBn-n6D6ICgQOe_r0AJNIjECdoyvF5BjTZTnr5lEHDGpdv8qcrx4jDwp_rTnctqAiJN1ZkQu2_kggRL9JIeta_Cr-JI3aiM4g_Nnl2R6cCVC8AQxa5X4DGC2d7tKkjV897ECRJTOGQgJLY4BZLada0UUKqi46QlmhnnsYSG_M7aXVVULp98Q_5S3ID4lxEvqLfJuwoo7M9BNoGVph2APmBqdc0ROu_MAmDN0BfdLFeHbUBNFgxA-YbkwNmd5P_r64RSjJncc3QtKPCN1Xb3aKPYY8ujKKYTKqPMSptD3z_-_JOOFv_lom7PHu7BUquz1qGxsCqPSfgTcS_z54FhOUSa8ATiYjrXgKVRRve9jkee9uNXHTTHo-IYxwOJruv9yvIoQZ8Jb-H07FCPna2Oy601zhvbusKFVNTuvCls064nBWpmUBqVidwPR_UgqBJA7OqVCxKo-9mzyGz5wcNTs4H4SFpzjHfjf2xyHvfGj3oL1InezmEL3hXCoKjF64Fj1DouZzLdsPyR0wN8Bc0RFzJro9llgELwmXJyQJCSK10JJTlOpCdSreRi5q5_voF9MarNbd0SDjOOs0rmuEouVgvRiQigr_S48P6DR8mAxm91LvPkdFcjLUx_eOQwN-MYq1_b3gT6OgCo_xKzmUa0zIQ53vP5pT1RUIrmFCB26osXHC5YAVI8wN5d3Ssx6OYrmAL2rUHwH54uOg3n2b6kh3jmsM3l7NJkCQvMrIq2-I4RjnXo8Jm9cOxTS9mhYk_JGQVm_JD7pvCBPF102XH5xyL-gm2Oh-F67hY2QeZVLSxqorGNFvR9isKw56Z62RL88J9Ry1XyTuN91XTpH3PZUqj066zgrDgCQAOAoNoHk7eOBvfDHrOmsED59yYOeBHTHROGaNRyT0FmdkouBWW7x7hc71XC8f9rRRSV2sFHo0Uezy_0pw88ucS0Wz8JlsD_ZfC3FclQBcObiQZbf_SpOn-x8iEXZ90W8OGYTeN0KrFq0mDva2z0VfdoNdFwNKUs1K_KV5VVMelFBraB5PdO2Lj5qjA6CID0-6I2QRW_GDcACXnbWrU5MucJZO7hMC4GeTjAFV7pvs2FIiod-Io03K7ROm-RI1GfXTZG123NH0L0jZgfwdYbVcsuWI0UuMmlQZY31SUfnEKNKjPx58ETjfvu1_mSB8DFStwAODE2H7ZXnCHQyT_3LW691q8_isxFm5vO2uJf-yP8_dUUUVotY7UmcKs_70yqHKayf2Rk7O0Cnt3bQwX7eNGSKiksdYMid6LK7-iP3MRH5r3Z6YXyW3dmxcKuaOug66fHoEBdFYuz4Sx5a1Fic64u3eq-3PF0VL2IoSmzUkpWf3GI3xRoxruJ7tjW2LhSEv_EaDMpDXkuEB1fKVSdNGZ05EAVlACYjy8xIQ9eqMrDTIW5cvUZUqQ1-u-EZwqHOLky5OnOC1lG_p5INuahsJye0c7yihEFl2bMLKJ6_rC4hFssoiyJntV3mI7ESHz9o6YcNJqVU7mPdaXXSYTZrmRoJPhxP6hPpG8TX3_PhyA3M7pqghe4uKPZ1Na7F_ULBytO5CmOeca1SdPlMiALzsPlxHIFFENVxfj4d4rO6ocuwiOAzx2u2N52ISTmKCZQgFWs433TS6T0JB1uzdrJ7TVJMYTUivYxLroYp1T0T67xXbfmxK_dRVtKarsdb8_UdJQZGxXVZ228Rv2dRiZiRsqXU45w_lKymJL4zBzSyotKqB5GiKjXdGpFHG4faauAmEvz6Ei9M9pSI9YRIGBAC8ri0tjaZOlLS3SMK6_sADCd9HzEzEA1dOwOALW_ikYBaM65Z9qq1CdjFj6N3ELrUUg5wJGVO4XXn-ByeMqnGqHjr5Kz3fEidy2bhbPPSNEWyVdnNssnDMf6BZ2QURLC1lQ_cUZ3GJB36nMsdtGUnZ7OwQde7sxpz-ZwL3Q-Fk2WVYv5mIQdu_Ok2s_1gON-jEXkN-bEnHM5mnFqhetP6vMXdikiUc2WmXtk66CKgtdNuj1HsSZC_Wt3HtgqFdwbE-AP_unp6V-G7o9ZZPnKVEGAaXSU_WFHmW-Hli5lJ59O0de3LththJB8cnd5fZElitWePVdbbf81ItX5sPxpjF-lY70_Y4EFzEKKP6vU6BSEokR4TTVKLm4oBUP8VOPnUgkhIDwEVInxHE3815ZFHlGiPJRonRn5kGb71w467Ym6lQF8mADfMfCOlYzrnRKR2ZEyNtI5iQOk-ia1pTpx62HScUW48li9J40m_dQ2jktnG0Vabf70Fdn_pKbiznrL_3RfmdSyeNS0P0b5ajeIBrli6YNB80-M6ttJhs07Zw1FPXYQsYkX6TJdi0QJJaUjUv0zppUx7XjDMM7fJ4yejHaT6yk7EiTrXIQfGEiuZs_-bYWJc_RMcPvbIXKKGsoneDoOtNEfIbwoY6HwoousPdVsQd5KQd08uHxQl_lxYRqcGuf5hhB8rczhzuRnOG_3MET6elqUSDHi6T8bj3bucLZQdS7z0tZxKbfPQR_bZrY2OklS_zt9mpDqB4mlWir8eJ6kOBD1FX1C7T_b7s5lhBoPNEHereaLhThUr51mkW4B-RHwsj_ZXmeccemmW5M3dQElI2TbzmX3wcLmYYLLS6wbqGyqrJJh9cCTP8BSrrFG-b9inXHGYY5B5nNZpUss0uth-PLN3l364Udh6Z1RvR8FHAtagPSG8KahbL97mgOhsBeogCT5om8250YqLLPtSXg2fn6Ge8YMFixkf-LRx4HNTKlWLHGbIDMaJdJ9WjQmCGLhyvL7IFeDQDTYc1TKHubtwFKi15e6MFyTC7YDdfnoqZWgw3THfJh9vUL8jLvUdvtaExPn03kj2I2MBJAFS6r_k9EMYDerWaZwj-si9-rFAEl9fXvoI0mLNeTzcR2NcktjYFtEevQH-LJu8rE4hw7mR8LdedlRSKObwHWKbgbnwSQQLYBxwbbCI4a_O5q8XcUhBCItFVux_8mCorj9Q1-VdlFjFEMIXzbPyISlAGilNWMgALbZMMElO9F8aGN5wp0e4dXZNgaobmHJNgxkQcq6Comm0vIbwC3z48tXofiTuCT2pN5S85QhqhSA2-fEnMpz5AvDu2qGkhFif_OTYvW1lQC-kYlsJirNWJaqQ-oJgwGjal7E8u3cQSTn5T1ISeSMY9Y7pGwr6Uj6kju7skdSmVkZNe04EdSpgdyhHTPpU88Y5vncnoF1WyDICBzUECTcD_VzpRLDyME8jX1sz4TsIkKEpkzjkmGsuTwT_B7gcxZh6gWMeCSGmrZG676dAGJu-pNevLK7MeR4EgCFcLMB0GZm3zfdgSgME7mRcKuYyx.jIlGa5W7EWsNmv1qj1hRjfKSzgbwHskyC7UWbRuS_Dg';
}

// Helper function to check response status
async function checkResponse(response: Response): Promise<unknown> {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
    }
    return data;
}

async function testGetStaff(clientId: string): Promise<StaffResponse> {
    console.log('\nTesting GET /clients/[id]/staff');
    try {
        const token = await getTestUserToken();
        const response = await fetch(`${BASE_URL}/clients/${clientId}/staff`, {
            headers: {
                'Cookie': `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax`,
            },
        });
        const data = await checkResponse(response);
        console.log('GET Response:', data);
        return data as StaffResponse;
    } catch (error) {
        console.error('GET Error:', error);
        throw error;
    }
}

async function testCreateStaff(clientId: string): Promise<unknown> {
    console.log('\nTesting POST /clients/[id]/staff');
    try {
        const token = await getTestUserToken();
        const response = await fetch(`${BASE_URL}/clients/${clientId}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax`,
            },
            body: JSON.stringify(testStaffData),
        });
        const data = await checkResponse(response);
        console.log('POST Response:', data);
        return data;
    } catch (error) {
        console.error('POST Error:', error);
        throw error;
    }
}

async function testGetStaffWithFilters(clientId: string): Promise<StaffResponse> {
    console.log('\nTesting GET /clients/[id]/staff with filters');
    try {
        const token = await getTestUserToken();
        const params = new URLSearchParams({
            page: '1',
            limit: '10',
            search: 'Test',
            status: 'ACTIVE',
            role: 'STAFF',
            hasBeneficiaries: 'false'
        });

        const response = await fetch(`${BASE_URL}/clients/${clientId}/staff?${params}`, {
            headers: {
                'Cookie': `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax`,
            },
        });
        const data = await checkResponse(response);
        console.log('GET with filters Response:', data);
        return data as StaffResponse;
    } catch (error) {
        console.error('GET with filters Error:', error);
        throw error;
    }
}

async function testInvalidStaffCreation(clientId: string): Promise<ErrorResponse> {
    console.log('\nTesting POST /clients/[id]/staff with invalid data');
    try {
        const token = await getTestUserToken();
        const invalidData = {
            // Missing required fields
            jobTitle: 'Test Position'
        };

        const response = await fetch(`${BASE_URL}/clients/${clientId}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax`,
            },
            body: JSON.stringify(invalidData),
        });
        const data = await response.json();
        console.log('Invalid POST Response:', data);
        return data as ErrorResponse;
    } catch (error) {
        console.error('Invalid POST Error:', error);
        throw error;
    }
}

async function testDuplicateStaffCreation(clientId: string): Promise<ErrorResponse> {
    console.log('\nTesting POST /clients/[id]/staff with duplicate email');
    try {
        const token = await getTestUserToken();
        // First create a staff member
        await testCreateStaff(clientId);

        // Try to create another staff member with the same email
        const response = await fetch(`${BASE_URL}/clients/${clientId}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax`,
            },
            body: JSON.stringify(testStaffData),
        });
        const data = await response.json();
        console.log('Duplicate POST Response:', data);
        return data as ErrorResponse;
    } catch (error) {
        console.error('Duplicate POST Error:', error);
        throw error;
    }
}

async function runTests() {
    console.log('Starting staff route tests...');
    let passed = 0;
    let failed = 0;

    try {
        // Create a test client
        const clientId = await createTestClient();
        console.log('Created test client with ID:', clientId);

        const tests = [
            { name: 'GET staff list', fn: () => testGetStaff(clientId) },
            { name: 'GET staff with filters', fn: () => testGetStaffWithFilters(clientId) },
            { name: 'Create staff', fn: () => testCreateStaff(clientId) },
            { name: 'Invalid staff creation', fn: () => testInvalidStaffCreation(clientId) },
            { name: 'Duplicate staff creation', fn: () => testDuplicateStaffCreation(clientId) },
        ];

        for (const test of tests) {
            try {
                console.log(`\nRunning test: ${test.name}`);
                await test.fn();
                console.log(`✅ ${test.name} passed`);
                passed++;
            } catch (error) {
                console.error(`❌ ${test.name} failed:`, error);
                failed++;
            }
        }

        console.log('\nTest Summary:');
        console.log(`Total tests: ${tests.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(2)}%`);
    } catch (error) {
        console.error('Failed to run tests:', error);
    }
}

// Run the tests
runTests().catch(console.error); 