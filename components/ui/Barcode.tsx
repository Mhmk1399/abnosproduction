import React from 'react';
import ReactBarcode from 'react-barcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  className?: string;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  width = 1.5,
  height = 40,
  fontSize = 12,
  displayValue = true,
  className = '',
}) => {
  return (
    <div className={`bg-white p-2 border border-gray-200 rounded-lg ${className}`}>
      <ReactBarcode
        value={value}
        width={width}
        height={height}
        fontSize={fontSize}
        margin={5}
        displayValue={displayValue}
      />
    </div>
  );
};

export default Barcode;