import { NextRequest } from 'next/server';
import { getAllSteps, createStep } from '@/middlewares/steps';

// GET all steps
export async function GET() {
    return getAllSteps();
}

// POST a new step
export async function POST(request: NextRequest) {
    return createStep(request);
}
