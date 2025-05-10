"use client";

import MicroLineBuilder from "./MicroLineBuilder";

export default function ConfigureMicroLinePage() {
  const handleSave = (config: any) => {
    console.log("Micro line saved:", config);

    // Redirect to the micro lines list after a short delay
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-20">
        پیکربندی میکرو لاین
      </h1>
      <MicroLineBuilder onSave={handleSave} />
    </div>
  );
}
