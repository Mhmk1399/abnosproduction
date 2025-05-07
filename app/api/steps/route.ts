import { NextRequest } from "next/server";
import { getStepById, updateStep, deleteStep } from "@/middlewares/steps";
import { getAllSteps, createStep } from "@/middlewares/steps";

// GET a specific step by ID
// export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
//   return getStepById(params.id);
// }

// UPDATE a step
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return updateStep(request, params.id);
}

// DELETE a step
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  return deleteStep(params.id);
}

// GET all steps
export async function GET() {
  return getAllSteps();
}

// POST a new step
export async function POST(request: NextRequest) {
  return createStep(request);
}
