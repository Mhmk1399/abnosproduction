import connect from "@/lib/data";
import {  NextResponse } from "next/server";
import glassTreatment from "@/models/glassTreatment";


export async function GET() {
    await connect();
    try {
        const treatments = await glassTreatment.find({});
        return NextResponse.json(treatments, { status: 200 });
    } catch (error) {
        console.error("Error fetching treatments:", error);
        return NextResponse.json({ error: "Failed to fetch treatments" }, { status: 500 });
    }

}