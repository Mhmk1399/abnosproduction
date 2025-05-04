import connect from "@/lib/data";
import { NextRequest , NextResponse} from "next/server";
import { createMicroLine, getAllMicroLines, updateMicroLine , deleteMicroLine} from "@/middlewares/microLines";


export const GET = async () => {
  await connect();
  return getAllMicroLines();
}

export const POST = async (request: NextRequest) => {
  await connect();
  return createMicroLine(request);
}

export const PUT = async (request: NextRequest) => {
    await connect();
    const body = await request.json();
    const  _id  = body._id;
    if (!_id) {
        return NextResponse.json(
            { error: "Micro line ID is required" },
            { status: 400 }
        );
    }
    return updateMicroLine(body, _id);

}
    export const DELETE = async (request: NextRequest) => {
        await connect();
        const body = await request.json();
        const  _id  = body._id;
        if (!_id) {
            return NextResponse.json(
                { error: "Micro line ID is required" },
                { status: 400 }
            );
        }
        return deleteMicroLine(_id);
    }