import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { api500 } from "@/lib/apiError";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                profileImageUrl: true,
                phoneNumber: true,
                country: true,
                state: true,
                city: true,
                linkedin: true,
                github: true,
                twitter: true,
                currentCTC: true,
                expectedCTC: true,
                noticePeriod: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
        return api500("Failed to fetch profile", "GET profile", error);
    }
}

const MAX_STRING = 500;
const MAX_URL = 2048;

function trim(s: unknown): string | undefined {
    if (s == null) return undefined;
    const t = String(s).trim();
    return t.length > 0 ? t.slice(0, MAX_STRING) : undefined;
}

function validUrl(s: unknown): string | null | undefined {
    if (s == null || s === "") return undefined;
    const u = String(s).trim().slice(0, MAX_URL);
    try {
        const parsed = new URL(u);
        return ["http:", "https:"].includes(parsed.protocol) ? u : null;
    } catch {
        return null;
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json().catch(() => ({}));
        if (typeof data !== "object" || data === null) {
            return NextResponse.json({ error: "Invalid body" }, { status: 400 });
        }

        const linkedinUrl = validUrl(data.linkedin);
        const githubUrl = validUrl(data.github);
        const twitterUrl = validUrl(data.twitter);
        const profileImageUrlVal = validUrl(data.profileImageUrl);
        if (linkedinUrl === null || githubUrl === null || twitterUrl === null || profileImageUrlVal === null) {
            return NextResponse.json({ error: "Invalid URL: only http/https allowed" }, { status: 400 });
        }

        const nameVal = trim(data.name);
        const phoneNumberVal = trim(data.phoneNumber);
        const countryVal = trim(data.country);
        const stateVal = trim(data.state);
        const cityVal = trim(data.city);
        const currentCTCVal = trim(data.currentCTC);
        const expectedCTCVal = trim(data.expectedCTC);
        const noticePeriodVal = trim(data.noticePeriod);

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(nameVal !== undefined && { name: nameVal }),
                ...(phoneNumberVal !== undefined && { phoneNumber: phoneNumberVal }),
                ...(countryVal !== undefined && { country: countryVal }),
                ...(stateVal !== undefined && { state: stateVal }),
                ...(cityVal !== undefined && { city: cityVal }),
                ...(linkedinUrl !== undefined && { linkedin: linkedinUrl }),
                ...(githubUrl !== undefined && { github: githubUrl }),
                ...(twitterUrl !== undefined && { twitter: twitterUrl }),
                ...(currentCTCVal !== undefined && { currentCTC: currentCTCVal }),
                ...(expectedCTCVal !== undefined && { expectedCTC: expectedCTCVal }),
                ...(noticePeriodVal !== undefined && { noticePeriod: noticePeriodVal }),
                ...(profileImageUrlVal !== undefined && { profileImageUrl: profileImageUrlVal }),
            },
        });

        const updatedUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                profileImageUrl: true,
                phoneNumber: true,
                country: true,
                state: true,
                city: true,
                linkedin: true,
                github: true,
                twitter: true,
                currentCTC: true,
                expectedCTC: true,
                noticePeriod: true,
            }
        });
        return NextResponse.json(updatedUser!);
    } catch (error) {
        return api500("Failed to update profile", "PUT profile", error);
    }
}
