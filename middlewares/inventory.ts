import inventory from "@/models/inventory";
import { generateSequentialCode } from "@/utils/codeGenerator";
import { NextRequest, NextResponse } from "next/server";

export const getAllInventories = async () => {
    try {
        const inventories = await inventory.find({});
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
        const body = await request.json();
        const { name, description } = body;
        const code= generateSequentialCode("inventory", "");
        // Validate required fields
        if (!name || !code) {
            return NextResponse.json(
                { error: "Name and code are required" },
                { status: 400 }
            );
        }

        const newInventory = new inventory({
            name,
            code,
            description,
        });
        await newInventory.save();
        return NextResponse.json(newInventory, { status: 201 });
    } catch (error) {
        console.error("Error creating inventory:", error);
        return NextResponse.json(
            { error: "Failed to create inventory" },
            { status: 500 }
        );
    }
};

export const updateInventory = async (request: NextRequest, _id: string) => {
    try {
        const body = await request.json();
        const { name, code, description } = body;

        // Validate required fields
        if (!name || !code) {
            return NextResponse.json(
                { error: "Name and code are required" },
                { status: 400 }
            );
        }

        const updatedInventory = await inventory.findByIdAndUpdate(
            _id,
            { name, code, description },
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
        const deletedInventory = await inventory.findByIdAndDelete(_id);

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