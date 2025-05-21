import JsBarcode from 'jsbarcode';

/**
 * Service for generating and managing barcodes for production layers
 */
export class BarcodeService {
  /**
   * Generate a barcode data URL for a given layer ID
   * @param layerId The ID of the layer
   * @param options Additional options for barcode generation
   * @returns A data URL containing the barcode image
   */
  static generateBarcodeDataUrl(layerId: string, options: {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
  } = {}): string {
    // Create a canvas element to render the barcode
    const canvas = document.createElement('canvas');
    
    // Set default options
    const defaultOptions = {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      text: layerId,
      ...options
    };
    
    // Generate the barcode
    JsBarcode(canvas, layerId, defaultOptions);
    
    // Return the data URL
    return canvas.toDataURL('image/png');
  }

  /**
   * Generate a unique barcode value for a layer
   * This combines the layer ID with a prefix and checksum
   * @param layerId The ID of the layer
   * @returns A formatted barcode value
   */
  static generateBarcodeValue(layerId: string): string {
    // Use a prefix to identify the type of barcode (L for Layer)
    const prefix = 'L';
    
    // Take the first 10 characters of the ID to keep the barcode manageable
    const shortId = layerId.substring(0, 10);
    
    // Add a simple checksum (sum of character codes modulo 97)
    const checksum = Array.from(shortId)
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;
    
    // Format: PREFIX-SHORTID-CHECKSUM
    return `${prefix}-${shortId}-${checksum.toString().padStart(2, '0')}`;
  }

  /**
   * Print a barcode for a given layer
   * @param layerId The ID of the layer
   * @param productionCode Optional production code to display with the barcode
   */
  static printBarcode(layerId: string, productionCode?: string): void {
    // Generate the barcode data URL
    const barcodeValue = this.generateBarcodeValue(layerId);
    const barcodeDataUrl = this.generateBarcodeDataUrl(barcodeValue, {
      text: productionCode || barcodeValue,
      height: 50,
      displayValue: true
    });
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print barcodes');
      return;
    }
    
    // Write the print content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .barcode-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .barcode-image {
              max-width: 100%;
            }
            .production-info {
              font-size: 14px;
              margin-top: 10px;
            }
            @media print {
              @page {
                size: 58mm 40mm;
                margin: 0;
              }
              body {
                padding: 5mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <img src="${barcodeDataUrl}" class="barcode-image" alt="Barcode" />
            ${productionCode ? `<div class="production-info">Code: ${productionCode}</div>` : ''}
          </div>
          <script>
            // Auto print when loaded
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  /**
   * Validate a scanned barcode value
   * @param scannedValue The value scanned from the barcode
   * @returns The extracted layer ID if valid, null otherwise
   */
  static validateBarcode(scannedValue: string): string | null {
    // Check if the barcode has the correct format
    const regex = /^L-([a-f0-9]{10})-(\d{2})$/i;
    const match = scannedValue.match(regex);
    
    if (!match) return null;
    
    const [_, shortId, checksumStr] = match;
    const checksum = parseInt(checksumStr, 10);
    
    // Verify the checksum
    const calculatedChecksum = Array.from(shortId)
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;
    
    if (checksum !== calculatedChecksum) return null;
    
    // Return the short ID (this would need to be mapped back to the full ID in a real system)
    return shortId;
  }
}
