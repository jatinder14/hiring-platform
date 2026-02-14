import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { role } = await req.json();

        if (role !== "candidate" && role !== "recruiter") {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        await dbConnect();

        // Update the user's role
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { role: role },
            { new: true }
        );

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating role:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
