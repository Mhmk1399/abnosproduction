import connect from "@/lib/data";
import { getProductLayerById } from "@/middlewares/productLayers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await connect();
    const data = await req.json();
    const id = data._id;
    
        return getProductLayerById(id);
    
   
}