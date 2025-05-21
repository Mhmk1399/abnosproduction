import { glasstreatments, layerData } from "@/types/types";

/**
 * Service for tracking production progress and managing step executions
 */
export class ProductionTrackerService {
  /**
   * Records a step execution when a layer moves to a new step
   */
  static async recordStepExecution(
    layerId: string,
    stepId: string,
    productionLineId: string,
    passed: boolean = true,
    notes?: string
  ) {
    try {
      // Get the layer details
      const layerResponse = await fetch(`/api/productLayer/detailed`, {
        method: "GET",
        headers: { id: layerId },
      });

      if (!layerResponse.ok) {
        throw new Error("Failed to fetch layer details");
      }

      const layer = await layerResponse.json();

      // Create a step execution record
      const stepExecution = {
        layer: layerId,
        step: stepId,
        productionLine: productionLineId,
        passed,
        notes,
        scannedAt: new Date().toISOString(),
        // If there are treatments to apply, include them
        ...(layer.treatments &&
          layer.treatments.length > 0 && {
            treatmentsApplied: layer.treatments.map(
              (t: {
                treatment: glasstreatments;
                count: number;
                measurement: string;
              }) => ({
                treatment:
                  typeof t.treatment === "object"
                    ? t.treatment._id
                    : t.treatment,
                count: t.count || 1,
                measurement: t.measurement || "unit",
              })
            ),
          }),
      };

      // Save the step execution
      const response = await fetch("/api/StepExecution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stepExecution),
      });

      if (!response.ok) {
        throw new Error("Failed to record step execution");
      }

      return await response.json();
    } catch (error) {
      console.error("Error recording step execution:", error);
      throw error;
    }
  }

  /**
   * Gets all step executions for a specific layer
   */
  /**
   * Gets all step executions for a specific layer
   */
  /**
   * Gets all step executions for a specific layer
   */
  /**
   * Gets all step executions for a specific layer
   */
  static async getLayerStepExecutions(layerId: string) {
    try {
      // Use the detailed endpoint with the ID in the header
      const response = await fetch(`/api/StepExecution/detailed`, {
        method: "GET",
        headers: { id: layerId },
      });
      console.log(layerId, "isssd");
      if (!response.ok) {
        throw new Error("Failed to fetch step executions");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching step executions:", error);
      throw error;
    }
  }

  /**
   * Moves a layer to the next step in its production line
   */
  static async moveToNextStep(layerId: string) {
    try {
      // Get the layer details
      const layerResponse = await fetch(`/api/productLayer/detailed`, {
        method: "GET",
        headers: { id: layerId },
      });

      if (!layerResponse.ok) {
        throw new Error("Failed to fetch layer details");
      }

      const layer = await layerResponse.json();

      // Get the production line
      const productionLine =
        typeof layer.productionLine === "object" ? layer.productionLine : null;

      if (
        !productionLine ||
        !productionLine.steps ||
        productionLine.steps.length === 0
      ) {
        throw new Error("Production line not found or has no steps");
      }

      // Find the current step index
      const currentStepId =
        typeof layer.currentStep === "object"
          ? layer.currentStep._id
          : layer.currentStep;

      const currentStepIndex = productionLine.steps.findIndex(
        (s: { step: { _id: string } }) => {
          const stepId = typeof s.step === "object" ? s.step._id : s.step;
          return stepId === currentStepId;
        }
      );

      if (currentStepIndex === -1) {
        throw new Error("Current step not found in production line");
      }

      // Check if this is the last step
      if (currentStepIndex >= productionLine.steps.length - 1) {
        throw new Error("Layer is already at the last step");
      }

      // Get the next step
      const nextStep = productionLine.steps[currentStepIndex + 1];
      const nextStepId =
        typeof nextStep.step === "object" ? nextStep.step._id : nextStep.step;

      // Record the completion of the current step
      await this.recordStepExecution(
        layerId,
        currentStepId,
        productionLine._id,
        true,
        "Completed and moved to next step"
      );

      // Update the layer to the next step
      const updateResponse = await fetch(`/api/productLayer/detailed`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          id: layerId,
        },
        body: JSON.stringify({
          currentStep: nextStepId,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update layer to next step");
      }

      // Record the start of the next step
      await this.recordStepExecution(
        layerId,
        nextStepId,
        productionLine._id,
        false,
        "Started this step"
      );

      return await updateResponse.json();
    } catch (error) {
      console.error("Error moving to next step:", error);
      throw error;
    }
  }

  /**
   * Gets the production queue for a specific production line
   */
  static async getProductionQueue(productionLineId: string) {
    try {
      // Get all layers in this production line
      const response = await fetch("/api/productLayer");

      if (!response.ok) {
        throw new Error("Failed to fetch product layers");
      }

      const layers = await response.json();

      // Filter layers by production line
      const queueLayers = layers.filter((layer: layerData) => {
        const lineId =
          typeof layer.productionLine === "object"
            ? layer.productionLine._id
            : layer.productionLine;
        return lineId === productionLineId;
      });

      // Group layers by current step
      const queue = queueLayers.reduce(
        (acc: { [key: string]: layerData[] }, layer: layerData) => {
          const stepId =
            typeof layer.currentStep === "object"
              ? layer.currentStep._id
              : layer.currentStep;

          if (!acc[stepId]) {
            acc[stepId] = [];
          }

          acc[stepId].push(layer);
          return acc;
        },
        {}
      );

      return queue;
    } catch (error) {
      console.error("Error fetching production queue:", error);
      throw error;
    }
  }
}
