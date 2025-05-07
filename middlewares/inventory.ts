import productionInventory from "@/models/productionInventory";
import { generateSequentialCode } from "@/utils/codeGenerator";
import { NextRequest, NextResponse } from "next/server";

export const getAllInventories = async () => {
    try {
        const inventories = await productionInventory.find({});
        return NextResponse.json(inventories, { status: 200 });
    } catch (error) {
        console.error("Error fetching inventories:", error);
        return NextResponse.json(
            { error: "Failed to fetch inventories" },
            { status: 500 }
        );
    }
};

export const createInventory = async (request: NextRequest) => {
    try {
        const { name, type } = await request.json();
        
        // Fix: Await the code generation
        const code = await generateSequentialCode("productionInventory", "INV");
        
        // Validate required fields
        if (!name || !code) {
            return NextResponse.json(
                { error: "Name and code are required" },
                { status: 400 }
            );
        }

        const newInventory = new productionInventory({
            name,
            code,
            type,
        });
        await newInventory.save();
        return NextResponse.json(newInventory, { status: 201 });
    } catch (error) {
        console.log("Error creating inventory:", error);
        return NextResponse.json(
            { error: "Failed to create inventory" },
            { status: 500 }
        );
    }
};


export const updateInventory = async (request:{ name: string, code: string, type: string}, _id: string) => {
    try {
        console.log(request, "Request body:");
        const { name, code, type  } = request
        // Validate required fields
        if (!_id) {
            return NextResponse.json(
                { error: "Inventory ID is required" },
                { status: 400 }
            );
        }
        if (!name || !code) {
            return NextResponse.json(
                { error: "Name and code are required" },
                { status: 400 }
            );
        }

        const updatedInventory = await productionInventory.findByIdAndUpdate(
            _id,
            { name, code , type },
            { new: true }
        );

        if (!updatedInventory) {
            return NextResponse.json(
                { error: "Inventory not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedInventory, { status: 200 });
    } catch (error) {
        console.error("Error updating inventory:", error);
        return NextResponse.json(
            { error: "Failed to update inventory" },
            { status: 500 }
        );
    }
};

export const deleteInventory = async (_id: string) => {
    try {
        const deletedInventory = await productionInventory.findByIdAndDelete(_id);

        if (!deletedInventory) {
            return NextResponse.json(
                { error: "Inventory not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(deletedInventory, { status: 200 });
    } catch (error) {
        console.error("Error deleting inventory:", error);
        return NextResponse.json(
            { error: "Failed to delete inventory" },
            { status: 500 }
        );
    }
};