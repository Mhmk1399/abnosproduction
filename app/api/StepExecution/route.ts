import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import StepExecution from "@/models/StepExecution";
import steps from "@/models/steps";
import productionLine from "@/models/productionLine";
import productLayer from "@/models/productLayer";
import glassTreatment from "@/models/glassTreatment";


export async function GET(request: NextRequest) {
    await connect();
    try {
        const url = new URL(request.url);
        const layerId = url.searchParams.get("layerId");

        let query = {};
        if (layerId) {
            query = { layer: layerId };
        }

        const stepExecutions = await StepExecution.find(query).populate([
            {
                path: "step",
                model: steps
                , select: "id name code"
            }
            , {
                path: "productionLine",
                model: productionLine
                , select: "id name steps"
            },
            {
                path: "layer",
                model: productLayer
            }
            , {
                path: "treatmentsApplied.treatment",
                model: glassTreatment,
                select: "name"
            }
        ]);
        return NextResponse.json(stepExecutions, { status: 200 });
    } catch (error) {
        console.error("Error fetching step executions:", error);
        return NextResponse.json({ error: "Failed to fetch step executions" }, { status: 500 });
    }
}



export async function POST(request: NextRequest) {
    await connect();
    try {
        const body = await request.json();
        const newStepExecution = new StepExecution(body);
        await newStepExecution.save();
        return NextResponse.json(newStepExecution, { status: 201 });
    } catch (error) {
        console.error("Error creating step execution:", error);
        return NextResponse.json({ error: "Failed to create step execution" }, { status: 500 });
    }
}