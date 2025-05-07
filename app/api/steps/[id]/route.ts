import { NextRequest, NextResponse } from "next/server";
import { getStepById, updateStep, deleteStep } from "@/middlewares/steps";

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET a specific step by ID
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  return getStepById(params.id);
}

// UPDATE a step
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return updateStep(request, params.id);
}

// DELETE a step
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  return deleteStep(params.id);
}
