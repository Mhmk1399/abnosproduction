import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reason from "@/models/reason";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const reason = new Reason(body);
    await reason.save();
    
    return NextResponse.json(reason, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create reason" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const reasons = await Reason.find();
    
    return NextResponse.json(reasons);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reasons" },
      { status: 500 }
    );
  }
}