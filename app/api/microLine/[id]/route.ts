import { NextRequest, NextResponse } from "next/server";
import microLine from "@/models/microLine";
import { updateMicroLine } from "@/middlewares/microLines";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const updatedMicroLine = await updateMicroLine(req, id);
    return NextResponse.json(updatedMicroLine, { status: 200 });
}