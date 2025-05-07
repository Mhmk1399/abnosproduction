/**
 * Builds a complete ordered list of steps for a product layer based on its production line
 * @param productionLine The production line object with microLines and steps
 * @returns An array of step objects in the correct order
 */
export function buildStepsList(productionLine: any): any[] {
  console.log('Building steps list for production line:', productionLine?._id);
  
  if (!productionLine) {
    console.log('Production line is undefined or null');
    return [];
  }
  
  if (!productionLine.microLines || !Array.isArray(productionLine.microLines)) {
    console.log('No micro lines found in production line or microLines is not an array');
    console.log('Production line data:', JSON.stringify(productionLine, null, 2));
    return [];
  }
  
  // Sort microLines by order if available
  const sortedMicroLines = [...productionLine.microLines].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );
  
  console.log(`Found ${sortedMicroLines.length} micro lines in production line`);
  
  const allSteps: any[] = [];
  
  // Loop through each micro line and collect all steps in order
  sortedMicroLines.forEach((microLineRef: any, microLineIndex: number) => {
    console.log(`Processing micro line ${microLineIndex + 1}/${sortedMicroLines.length}`);
    
    // Check if microLine is a reference or already populated
    const microLine = microLineRef.microLine;
    
    if (!microLine) {
      console.log(`Micro line ${microLineIndex + 1} is undefined or null`);
      return;
    }
    
    // Log the microLine structure to debug
    console.log('Micro line data:', JSON.stringify(microLine, null, 2));
    
    if (!microLine.steps || !Array.isArray(microLine.steps)) {
      console.log(`Micro line ${microLineIndex + 1} has no steps or steps is not an array`);
      return;
    }
    
    // Sort steps by order if available
    const sortedSteps = [...microLine.steps].sort((a, b) => 
      (a.order || 0) - (b.order || 0)
    );
    
    // Add all steps from this micro line to the list
    sortedSteps.forEach((stepRef: any, stepIndex: number) => {
      if (!stepRef) {
        console.log(`Step reference ${stepIndex + 1} in micro line ${microLineIndex + 1} is undefined or null`);
        return;
      }
      
      // Check if the step is a reference or already populated
      const step = stepRef.step;
      
      if (!step) {
        console.log(`Step ${stepIndex + 1} in micro line ${microLineIndex + 1} is undefined or null`);
        return;
      }
      
      // If step is just an ID string, we need to fetch the actual step data
      if (typeof step === 'string') {
        console.log(`Step ${stepIndex + 1} is an ID reference: ${step}`);
        // We can't fetch the step data here, so we'll just use the ID
        // In a real implementation, you would need to populate these steps in the middleware
        allSteps.push({
          _id: step,
          microLineIndex,
          stepIndex,
          fullIndex: allSteps.length,
          order: stepRef.order
        });
      } else {
        // Step is already populated
        console.log(`Adding step: ${step.name || 'unnamed'} (${stepIndex + 1}/${sortedSteps.length})`);
        allSteps.push({
          ...step,
          microLineIndex,
          stepIndex,
          fullIndex: allSteps.length,
          order: stepRef.order
        });
      }
    });
  });
  
  console.log(`Total steps in production line: ${allSteps.length}`);
  if (allSteps.length > 0) {
    console.log('Steps list:', allSteps.map(step => step._id || 'unknown').join(', '));
  }
  
  return allSteps;
}



/**
 * Finds the current step index in the complete steps list
 * @param stepsList The complete list of steps
 * @param currentStepId The ID of the current step
 * @returns The index of the current step, or -1 if not found
 */
export function findCurrentStepIndex(stepsList: any[], currentStepId: string): number {
  console.log(`Finding current step index for step ID: ${currentStepId}`);

  if (!stepsList || !Array.isArray(stepsList) || stepsList.length === 0) {
    console.log('Steps list is empty');
    return -1;
  }

  const index = stepsList.findIndex(step => step._id === currentStepId);
  console.log(`Current step index: ${index}`);
  return index;
}

/**
 * Gets the next step for a product layer
 * @param layer The product layer object
 * @returns The next step object, or null if there is no next step
 */
export function getNextStep(layer: any): any | null {
  console.log('Getting next step for layer:', layer?._id);
  
  if (!layer?.productionLine) {
    console.log('Layer has no production line');
    return null;
  }
  
  // Build the complete steps list
  const stepsList = buildStepsList(layer.productionLine);
  
  if (stepsList.length === 0) {
    console.log('No steps found in production line');
    return null;
  }
  
  // Find the current step index
  const currentStepId = layer.currentStep?._id;
  console.log(`Current step ID: ${currentStepId}`);
  
  if (!currentStepId) {
    console.log('No current step ID found');
    // If no current step, return the first step
    return stepsList[0];
  }
  
  const currentStepIndex = stepsList.findIndex(step => 
    step._id === currentStepId || step._id === currentStepId.toString()
  );
  
  console.log(`Current step index: ${currentStepIndex}`);
  
  if (currentStepIndex === -1) {
    console.log('Current step not found in steps list');
    // If current step not found but we have steps, return the first step
    return stepsList[0];
  }
  
  // Check if there's a next step
  if (currentStepIndex < stepsList.length - 1) {
    const nextStep = stepsList[currentStepIndex + 1];
    console.log(`Next step ID: ${nextStep._id}`);
    return nextStep;
  }
  
  console.log('No next step available (end of production line)');
  return null;
}


/**
 * Checks if a product layer needs optimization
 * @param layer The product layer object
 * @returns True if the layer needs optimization, false otherwise
 */
/**
 * Checks if a product layer needs optimization
 * @param layer The product layer object
 * @returns True if the layer needs optimization, false otherwise
 */
export function needsOptimization(layer: any): boolean {
  console.log('Checking if layer needs optimization:', layer?._id);

  if (!layer) {
    console.log('Layer is undefined or null');
    return false;
  }

  // Check if the current step is "optimizer"
  if (layer.currentStep?.name?.toLowerCase() === "optimizer") {
    console.log('Layer is currently in optimizer step');
    return true;
  }

  // If no current step is set, check if the first step is "optimizer"
  if (!layer.currentStep && layer.productionLine) {
    console.log('Layer has no current step, checking first step of production line');

    const stepsList = buildStepsList(layer.productionLine);

    if (stepsList.length > 0) {
      const firstStepName = stepsList[0].name?.toLowerCase();
      console.log(`First step name: ${firstStepName}`);

      if (firstStepName === "optimizer") {
        console.log('First step is optimizer');
        return true;
      }
    }
  }

  console.log('Layer does not need optimization');
  return false;
}


/**
 * Logs the complete step path for a product layer
 * @param layer The product layer object
 * @returns A string representation of the step path
 */
export function logStepPath(layer: any): string {
  if (!layer?.currentProductionLine) {
    return 'No production line';
  }

  const stepsList = buildStepsList(layer.currentProductionLine);
  const currentStepIndex = layer.currentStep ?
    findCurrentStepIndex(stepsList, layer.currentStep._id) : -1;

  const path = stepsList.map((step, index) => {
    const isCurrent = index === currentStepIndex;
    return `${index + 1}. ${step.name}${isCurrent ? ' (CURRENT)' : ''}`;
  }).join('\n');

  console.log(`Step path for layer ${layer._id}:\n${path}`);
  return path;
}
