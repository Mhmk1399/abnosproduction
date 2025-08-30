import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/staff";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json([]);
    }
    
    const staff = await Staff.find({
      name: { $regex: name, $options: 'i' }
    }).select('_id name position');
    
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search staff" },
      { status: 500 }
    );
  }
}