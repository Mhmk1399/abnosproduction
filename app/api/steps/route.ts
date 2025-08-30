import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Step from "@/models/steps";

export async function GET() {
  try {
    await dbConnect();
    
    const steps = await Step.find();
    
    return NextResponse.json(steps);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}