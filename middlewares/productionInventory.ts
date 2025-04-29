import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import productionInventory from "@/models/productionInventory";
import { v4 as uuidv4 } from 'uuid';

export const getAllInventories = async () => {
    try {
        await connect();

        const inventories = await productionInventory.find({}).sort({ createdAt: -1 });

        return NextResponse.json(inventories, { status: 200 });
    } catch (error) {
        console.error('Error fetching inventories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventories' },
            { status: 500 }
        );
    }
};

export const createInventory = async (request: NextRequest) => {
    try {
        await connect();

        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Inventory name is required' },
                { status: 400 }
            );
        }

        if (!body.quantity && body.quantity !== 0) {
            return NextResponse.json(
                { error: 'Inventory quantity is required' },
                { status: 400 }
            );
        }

        // Generate a unique code if not provided
        if (!body.code) {
            body.code = `INV-${uuidv4().substring(0, 8)}`;
        }

        // Create the new inventory
        const newInventory = new productionInventory({
            name: body.name,
            code: body.code,
            quantity: body.quantity,
            description: body.description || '',
        });

        // Save the new inventory to the database
        await newInventory.save();

        return NextResponse.json(newInventory, { status: 201 });
    } catch (error: any) {
        console.error('Error creating inventory:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'An inventory with this name or code already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create inventory' },
            { status: 500 }
        );
    }
};