import { NextRequest } from "next/server";
import connect from "@/lib/data";
import { NextResponse } from "next/server";
import Steps from "@/models/steps";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import glassTreatment from "@/models/glassTreatment";
import { getCache, setCache } from "@/utils/redis";

export async function GET() {
  await connect();
  try {
    const cachedSteps = await getCache("steps");
    if (cachedSteps) {
      return NextResponse.json(cachedSteps, { status: 200 });
    }

    const steps = await Steps.find({}).populate({
      path: "handlesTreatments",
      model: glassTreatment,
      select: "name code",
    });

    // Try to cache the result, but continue even if caching fails
    setCache("steps", steps, 3600).catch((err) => {
      console.warn("Failed to cache steps data:", err.message);
    });

    return NextResponse.json(steps, { status: 200 });
  } catch (error) {
    console.error("Error fetching steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Step name is required" },
        { status: 400 }
      );
    }

    const code = `${body.type}-${uuidv4().substring(0, 8)}`;

    const password = bcrypt.hashSync(body.password, 10);
    // Create the new step
    const newStep = new Steps({
      name: body.name,
      code: code,
      description: body.description || "",
      type: body.type || "step",
      requiresScan: body.requiresScan || true,
      handlesTreatments: body.handlesTreatments || [],
      productionLine: body.productionLine || null,
      password: password || "",
    });

    await newStep.save();

    return NextResponse.json(newStep, { status: 201 });
  } catch (error) {
    console.error("Error creating step:", error);
  }
}
