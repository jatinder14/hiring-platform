import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error: any) {
        console.error("[API] Error fetching profile:", error);
        return NextResponse.json({
            error: "Failed to fetch profile",
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Destructure and validate/sanitize inputs
        const {
            name,
            phoneNumber,
            country,
            state,
            city,
            linkedin,
            github,
            twitter,
            currentCTC,
            expectedCTC,
            noticePeriod,
            profileImageUrl
        } = data;

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id
            },
            data: {
                name,
                phoneNumber,
                country,
                state,
                city,
                linkedin,
                github,
                twitter,
                currentCTC,
                expectedCTC,
                noticePeriod,
                profileImageUrl
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error: any) {
        console.error("[API] Error updating profile:", error);
        return NextResponse.json({
            error: "Failed to update profile",
            details: error.message
        }, { status: 500 });
    }
}
