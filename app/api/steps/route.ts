import { NextRequest, NextResponse } from "next/server";
import Step from "@/models/steps";
import connect from "@/lib/data";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const step = await Step.findById(id);

      if (!step) {
        return NextResponse.json({ error: "Step not found" }, { status: 404 });
      }
      return NextResponse.json(step);
    }

    // Get query parameters for pagination and filtering
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const nameFilter = searchParams.get("nameFilter");
    const codeFilter = searchParams.get("codeFilter");
    const typeFilter = searchParams.get("typeFilter");

    // Build filter object
    const filter: any = {};

    if (nameFilter) {
      filter.name = { $regex: nameFilter, $options: "i" };
    }

    if (codeFilter) {
      filter.code = { $regex: codeFilter, $options: "i" };
    }

    if (typeFilter) {
      filter.type = typeFilter;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalRecords = await Step.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch steps with pagination and filtering
    const steps = await Step.find(filter);

    return NextResponse.json({
      steps,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        recordsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connect();
  try {
    const body = await request.json();
    console.log("Received body:", body);

    const code = body.code || `STEP-${uuidv4().substring(0, 8)}`;
    console.log("Generated code:", code);

    const stepData = {
      name: body.name,
      code: code,
      description: body.description,
      type: body.type || "step",
      requiresScan: Boolean(body.requiresScan),
      handlesTreatments: body.handlesTreatments || [],
      password: body.password,
    };
    console.log("Step data to save:", stepData);

    const newStep = new Step(stepData);
    const savedStep = await newStep.save();
    console.log("Saved step:", savedStep);

    return NextResponse.json(savedStep, { status: 201 });
  } catch (error) {
    console.error("Error creating step:", error);
    return NextResponse.json(
      { error: "Failed to create step" },
      { status: 500 }
    );
  }
}
