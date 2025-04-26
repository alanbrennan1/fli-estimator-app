import React, { useState } from 'react';
import './index.css';

function AccordionSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false); // collapsed by default
  return (
    <div className="border rounded shadow-sm mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base rounded-t"
      >
        {title} {isOpen ? '▾' : '▸'}
      </button>
      {isOpen && <div className="p-4 bg-white border-t">{children}</div>}
    </div>
  );
}


export default function ProjectEstimator() {
  const sectorProductMap = {
    Water: ['Baffle Walls', 'Contact Tanks'],
    Energy: ['Cable Troughs', 'Blast Walls'],
    'Bespoke Precast': ['Foundation Bases', 'Cover Slabs'],
  };

const [additionalItems] = useState({
  lid: 30,             // Fixed price for lid
  pipeOpenings: 50,    // Fixed price for pipe opening
  ladderRungs: 100     // Fixed price for ladder rung
});

  const transportCosts = {
    Cork: 850,
    Dublin: 650,
    UK: 2000,
  };

 
  const [formData, setFormData] = useState({
    projectName: '',
    installationDays: '',
    projectNumber: '',
    client: '',
    sector: '',
    productType: '',
    chamberDesign: '',
    chamberUse: '',
    length: '',
    width: '',
    height: '',
    baseThickness: '',
    wallThickness: '',
    lidUnits: 0,
    pipeOpeningsUnits: 0,
    ladderRungsUnits: 0,
    ductType: '',
    margin: 20,
    wasteMargin: 5, // Default 5%
    groupCost: 2.5, // FLI Group cost 2.5%
    steelGrade: '',
    proposalHours: '',
    designMeetingsHours: '',
    structuralDesignHours: '',
    revitModelHours: '',
    approvalCommentsHours: '',
    detailingJointsHours: '',
    detailingFloorsHours: '',
    detailingScreedHours: '',
    gasHours: '',
    productionUnitsHours: '',
    productionCheckingHours: '',
    siteQueriesHours: '',
    asBuiltsHours: '',
    concreteVolume: '',
    transportRate: '',
    transportQuantity: ''
  });

  const [estimate, setEstimate] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [pendingImport, setPendingImport] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [productBreakdowns, setProductBreakdowns] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



const handleEstimate = () => {
  const safe = (val) => parseFloat(val || 0);
  const safeInt = (val) => parseInt(val || '0', 10);

  // Concrete Volume – user input
  const manualConcreteVolume = safe(formData.concreteVolume);

  // Labour from CSV logic (if volume exists from CSV)
  const unitVolume = safe(formData.csvEntityVolume); // populated during CSV upload
  const unitWeight = unitVolume * 2.6;
  const labourPerUnit = unitWeight * 4.5;
  const quantity = safeInt(formData.csvQuantity);
  const totalLabourHoursFromCSV = quantity * labourPerUnit;
  const labourCostFromCSV = totalLabourHoursFromCSV * 70.11;

  // Design Hours and Cost
  const designFields = [
    'proposalHours',
    'designMeetingsHours',
    'structuralDesignHours',
    'revitModelHours',
    'approvalCommentsHours',
    'detailingJointsHours',
    'detailingFloorsHours',
    'detailingScreedHours',
    'gasHours',
    'productionUnitsHours',
    'productionCheckingHours',
    'siteQueriesHours',
    'asBuiltsHours'
  ];
  const totalDesignHours = designFields.reduce((sum, key) => sum + safe(formData[key]), 0);
  const designRate = 61.12;
  const designCost = totalDesignHours * designRate;

  // Concrete Cost
  const concreteCost = manualConcreteVolume * 137.21;

  // Steel Cost
const steelKg = manualConcreteVolume * 120;
const steelCost = steelKg * 0.8;

  // Labour fallback: if no CSV, calculate from manual inputs
  const labourCost = labourCostFromCSV || (safe(formData.labourHours) * 70.11);

  // Additional Items
  const additionalCost =
    30 * safeInt(formData.lidUnits) +
    50 * safeInt(formData.pipeOpeningsUnits) +
    100 * safeInt(formData.ladderRungsUnits);

  // Transport + Installation
  const transportCost = safe(formData.transportRate) * safe(formData.transportQuantity);
  const installationCost = safe(formData.installationDays) * 500;

  // Total
let total = concreteCost + steelCost + labourCost + additionalCost + transportCost + installationCost;

// Apply additional waste percentage
total *= 1 + safe(formData.wasteMargin) / 100;

  // Apply group cost
total *= 1 + safe(formData.groupCost) / 100;
  
// Then apply profitability margin
total *= 1 + safe(formData.margin) / 100;


  setEstimate(total.toFixed(2));

  setBreakdown({
    concrete: [
      { label: 'Concrete Volume', value: manualConcreteVolume.toFixed(2), unit: 'm³', isCurrency: false },
      { label: 'Concrete Cost', value: concreteCost.toFixed(2), isCurrency: true }
    ],
    labour: [
      { label: 'Labour Hours', value: labourCostFromCSV ? totalLabourHoursFromCSV.toFixed(2) : formData.labourHours, unit: 'hrs', isCurrency: false },
      { label: 'Labour Cost', value: labourCost.toFixed(2), isCurrency: true }
    ],
    design: [
      { label: 'Total Design Hours', value: totalDesignHours.toFixed(2), unit: 'hrs', isCurrency: false },
      { label: 'Design Cost', value: designCost.toFixed(2), isCurrency: true }
    ],
additional: [
  { label: 'Lid Units', value: (30 * safeInt(formData.lidUnits)).toFixed(2), isCurrency: true },
  { label: 'Pipe Openings', value: (50 * safeInt(formData.pipeOpeningsUnits)).toFixed(2), isCurrency: true },
  { label: 'Ladder Rungs', value: (100 * safeInt(formData.ladderRungsUnits)).toFixed(2), isCurrency: true },
  { label: 'W.Bar & Scabbling', value: (safeInt(formData.wBarScabbling) * 0).toFixed(2), isCurrency: true },
  { label: 'Lifters & Capstans', value: (safeInt(formData.liftersCapstans) * 0).toFixed(2), isCurrency: true },
  { label: 'MKK Cones', value: (safeInt(formData.mkkCones) * 0).toFixed(2), isCurrency: true },
  { label: 'Unistrut', value: (safeInt(formData.unistrut) * 0).toFixed(2), isCurrency: true },
  { label: 'Sika Powder', value: (safeInt(formData.sikaPowder) * 0).toFixed(2), isCurrency: true },
  { label: 'Pulling Irons', value: (safeInt(formData.pullingIrons) * 0).toFixed(2), isCurrency: true },
  { label: 'Earthing Points', value: (safeInt(formData.earthingPoints) * 0).toFixed(2), isCurrency: true },
  { label: 'Sump Gates', value: (safeInt(formData.sumpGates) * 0).toFixed(2), isCurrency: true },
  { label: 'Polyfleece', value: (safeInt(formData.polyfleece) * 0).toFixed(2), isCurrency: true },
  { label: 'Duct Type', value: formData.ductType ? `Included (${formData.ductType})` : 'N/A', isCurrency: false }
],
    transport: [
      { label: 'Transport Cost', value: transportCost.toFixed(2), isCurrency: true }
    ],
    installation: [
      { label: 'Installation Days', value: formData.installationDays || 0, unit: 'days', isCurrency: false },
      { label: 'Installation Cost', value: installationCost.toFixed(2), isCurrency: true }
    ]
  });
};




  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex items-center">
        <img src="/fli logo.png" alt="FLI Precast Solutions" className="h-10 mr-4" />
        <h1 className="text-2xl font-bold text-blue-800">FLI Project Estimator Tool</h1>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
 {/* 🧾 Project Info */}
       
<AccordionSection title="🧾 Project Info">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Project Name</label>
      <input
        name="projectName"
        value={formData.projectName}
        onChange={handleChange}
        className="border p-2 rounded"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Project Number</label>
      <input
        name="projectNumber"
        value={formData.projectNumber}
        onChange={handleChange}
        className="border p-2 rounded"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Client</label>
      <input
        name="client"
        value={formData.client}
        onChange={handleChange}
        className="border p-2 rounded"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Sector</label>
      <select
        name="sector"
        value={formData.sector}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Select Sector</option>
        {Object.keys(sectorProductMap).map((sector, idx) => (
          <option key={idx} value={sector}>{sector}</option>
        ))}
      </select>
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Product Type</label>
      <select
        name="productType"
        value={formData.productType}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Select Product Type</option>
        {(sectorProductMap[formData.sector] || []).map((type, idx) => (
          <option key={idx} value={type}>{type}</option>
        ))}
      </select>
    </div>
  </div>
</AccordionSection>


{/* 🏗 Manufacturing Layout */}
<div className="flex flex-col md:flex-row gap-6 items-start">

  {/* ⬅️ Left: SketchUp Upload Box */}
  <div className="md:w-1/3 w-full bg-white border border-gray-300 rounded-lg shadow p-4">
    <h3 className="text-md font-semibold text-gray-700 mb-2">📥 Upload SketchUp CSV</h3>
    {uploadSuccess && (
      <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300 text-sm">
        ✅ File uploaded and values extracted successfully!
      </div>
    )}

    
    <input
      type="file"
      accept=".csv"
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        

reader.onload = (event) => {
  const text = event.target.result;
  const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
  const headers = rows[0].map(h => h.toLowerCase());

  const defIndex = headers.indexOf('definition name');
  const qtyIndex = headers.indexOf('quantity');
  const volumeIndex = headers.indexOf('entity volume');

  if (defIndex === -1 || qtyIndex === -1 || volumeIndex === -1) {
    alert("CSV must include 'Definition Name', 'Quantity', and 'Entity Volume' columns.");
    return;
  }

  const concreteRate = 137.21;
  const steelRate = 0.8; // €/kg
  const steelDensity = 120; // kg/m³
  const labourRate = 70.11; // €/hr
  const labourHoursPerTonne = 4.5;

  const productMap = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const defName = row[defIndex];
    const qty = parseFloat(row[qtyIndex]);
    const volStr = row[volumeIndex].replace(/[^\d.-]/g, '');
    const volume = parseFloat(volStr);

    if (!defName || isNaN(qty) || isNaN(volume)) continue;

    const totalVol = qty * volume;
    const concreteCost = totalVol * concreteRate;

    const steelKg = totalVol * steelDensity;
    const steelCost = steelKg * steelRate;

    const unitWeight = volume * 2.6;
    const labourPerUnit = unitWeight * labourHoursPerTonne;
    const totalLabourHours = qty * labourPerUnit;
    const labourCost = totalLabourHours * labourRate;

    productMap[defName] = {
      quantity: qty,
      volumePerUnit: volume.toFixed(3),
      concrete: {
        volume: totalVol.toFixed(2),
        cost: concreteCost.toFixed(2)
      },
      steel: {
        kg: steelKg.toFixed(2),
        cost: steelCost.toFixed(2)
      },
      labour: {
        hours: totalLabourHours.toFixed(2),
        cost: labourCost.toFixed(2)
      }
    };
  }

  // Set the extracted product breakdowns
  setProductBreakdowns(Object.entries(productMap).map(([name, data]) => ({
    name,
    ...data
  })));

  // ✅ VERY IMPORTANT: Upload succeeded
  setUploadSuccess(true);
  setUploadMessage("✅ SketchUp CSV successfully uploaded and processed!");
};



        
       
        reader.readAsText(file);
      }}
      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />

{/* ✅ Success Message Display */}
  {uploadMessage && (
    <div className="mt-2 text-green-600 font-medium">{uploadMessage}</div>
  )}
    
  </div>

  {/* ➡️ Right: Manufacturing Accordion */}
  <div className="flex-1">
    <AccordionSection title="🏗 Manufacturing">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['length', 'width', 'height', 'baseThickness', 'wallThickness'].map((field) => {
          const labelMap = {
            length: 'Length (m)',
            width: 'Width (m)',
            height: 'Height (m)',
            baseThickness: 'Base Thickness (m)',
            wallThickness: 'Wall Thickness (m)'
          };
          return (
            <div key={field} className="flex flex-col">
              <label className="text-sm font-medium mb-1">{labelMap[field]}</label>
              <input
                name={field}
                type="number"
                value={formData[field]}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Concrete Volume (m³)</label>
          <input
            name="concreteVolume"
            type="number"
            value={formData.concreteVolume || ''}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Steel Grade (kg/m³)</label>
          <select
            name="steelGrade"
            value={formData.steelGrade}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Steel Grade</option>
            <option value="B125">B125</option>
            <option value="C250">C250</option>
            <option value="D400">D400</option>
            <option value="E600">E600</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Labour Hours</label>
          <input
            name="labourHours"
            type="number"
            value={formData.labourHours || ''}
            onChange={handleChange}
            placeholder="Hours"
            className="border p-2 rounded"
          />
        </div>
      </div>
    </AccordionSection>
  </div>
</div>


{productBreakdowns.length > 0 && (
  <div className="mt-6 bg-white p-4 rounded shadow-sm">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Breakdown</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Product Name</th>
            <th className="px-3 py-2 text-right">Concrete Vol (m³)</th>
            <th className="px-3 py-2 text-right">Concrete €</th>
            <th className="px-3 py-2 text-right">Steel (kg)</th>
            <th className="px-3 py-2 text-right">Steel €</th>
            <th className="px-3 py-2 text-right">Labour (hrs)</th>
            <th className="px-3 py-2 text-right">Labour €</th>
          </tr>
        </thead>
        <tbody>
          {productBreakdowns.map((product, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-3 py-2">{product.name}</td>
              <td className="px-3 py-2 text-right">{product.concrete.volume}</td>
              <td className="px-3 py-2 text-right">€{product.concrete.cost}</td>
              <td className="px-3 py-2 text-right">{product.steel.kg}</td>
              <td className="px-3 py-2 text-right">€{product.steel.cost}</td>
              <td className="px-3 py-2 text-right">{product.labour.hours}</td>
              <td className="px-3 py-2 text-right">€{product.labour.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}




      <AccordionSection title="➕ Additional Items">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      "lidUnits",
      "pipeOpeningsUnits",
      "ladderRungsUnits",
      "wBarScabbling",
      "liftersCapstans",
      "mkkCones",
      "unistrut",
      "sikaPowder",
      "pullingIrons",
      "earthingPoints",
      "sumpGates",
      "polyfleece"
    ].map((field) => {
      const labelMap = {
        lidUnits: "Lid Units",
        pipeOpeningsUnits: "Pipe Openings",
        ladderRungsUnits: "Ladder Rungs",
        wBarScabbling: "W.Bar & Scabbling",
        liftersCapstans: "Lifters & Capstans",
        mkkCones: "MKK Cones",
        unistrut: "Unistrut",
        sikaPowder: "Sika Powder",
        pullingIrons: "Pulling Irons",
        earthingPoints: "Earthing Points",
        sumpGates: "Sump Gates",
        polyfleece: "Polyfleece"
      };

      const placeholderMap = {
        lidUnits: "Qty",
        pipeOpeningsUnits: "Qty",
        ladderRungsUnits: "Qty",
        wBarScabbling: "Metres",
        liftersCapstans: "Pieces",
        mkkCones: "Qty",
        unistrut: "Metres",
        sikaPowder: "m³",
        pullingIrons: "Qty",
        earthingPoints: "Qty",
        sumpGates: "Qty",
        polyfleece: "m"
      };

      return (
        <div key={field} className="flex flex-col">
          <label className="text-sm font-medium mb-1">{labelMap[field]}</label>
          <input
            type="number"
            name={field}
            value={formData[field] || ''}
            onChange={handleChange}
            placeholder={placeholderMap[field] || "Qty"}
            className="border p-2 rounded"
          />
        </div>
      );
    })}

    {/* Duct Type Dropdown */}
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Duct Type</label>
      <select
        name="ductType"
        value={formData.ductType}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Select Duct Type</option>
        <option value="Duct type 1">Duct type 1</option>
        <option value="Duct type 2">Duct type 2</option>
        <option value="Duct type 3">Duct type 3</option>
        <option value="Duct type 4">Duct type 4</option>
      </select>
    </div>
  </div>
</AccordionSection>


<AccordionSection title="🎨 Design">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      { name: 'proposalHours', label: 'Proposal' },
      { name: 'designMeetingsHours', label: 'Design Meetings' },
      { name: 'structuralDesignHours', label: 'Structural Design' },
      { name: 'revitModelHours', label: 'Revit Model' },
      { name: 'approvalCommentsHours', label: 'Approval Comments' },
      { name: 'detailingJointsHours', label: 'Detailing In-Situ Joints' },
      { name: 'detailingFloorsHours', label: 'Detailing In-Situ Floors' },
      { name: 'detailingScreedHours', label: 'Detailing In-Situ Screed' },
      { name: 'gasHours', label: "GA’s" },
      { name: 'productionUnitsHours', label: 'Production Units' },
      { name: 'productionCheckingHours', label: 'Production Checking' },
      { name: 'siteQueriesHours', label: 'Site Queries' },
      { name: 'asBuiltsHours', label: 'As Builts' }
    ].map((item) => (
      <div key={item.name} className="flex flex-col">
        <label className="text-sm font-medium mb-1">{item.label}</label>
        <input
          type="number"
          name={item.name}
          value={formData[item.name] || ''}
          onChange={handleChange}
          placeholder="Hours"
          className="border p-2 rounded"
        />
      </div>
    ))}
  </div>
</AccordionSection>

        
<AccordionSection title="🚚 Transport">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Transport Rate (€)</label>
      <input
        type="number"
        name="transportRate"
        value={formData.transportRate}
        onChange={handleChange}
        placeholder="€/trip"
        className="border p-2 rounded"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Transport Quantity</label>
      <input
        type="number"
        name="transportQuantity"
        value={formData.transportQuantity}
        onChange={handleChange}
        placeholder="No. loads"
        className="border p-2 rounded"
      />
    </div>
  </div>
</AccordionSection>


<AccordionSection title="🛠 Installation">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Installation Duration (Days)</label>
      <input
        type="number"
        name="installationDays"
        value={formData.installationDays}
        onChange={handleChange}
        placeholder="Days"
        className="border p-2 rounded"
      />
    </div>
  </div>
</AccordionSection>



        {/* 📊 Quote Controls */}
<div className="bg-white border border-gray-300 rounded shadow-sm p-6 mb-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Quote Controls</h2>

  {/* 🔴 Waste Slider */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-red-700 mb-1">Additional Waste: {formData.wasteMargin || 5}%</label>
    <input
      type="range"
      min="0"
      max="20"
      step="1"
      name="wasteMargin"
      value={formData.wasteMargin || 5}
      onChange={handleChange}
      className="w-full accent-red-700"
    />
  </div>

  {/* 🔵 Group Cost */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-blue-600 mb-1">
      Group Cost: {formData.groupCost || 2.5}%
    </label>
    <input
      type="range"
      min="0"
      max="20"
      step="0.1"
      name="groupCost"
      value={formData.groupCost || 2.5}
      onChange={handleChange}
      className="w-full accent-blue-400"
    />
  </div>
  
  {/* 🟢 Profit Margin */}
  <div>
    <label className="block text-sm font-medium text-green-700 mb-1">Profitability Margin: {formData.margin}%</label>
    <input
      type="range"
      min="0"
      max="100"
      name="margin"
      value={formData.margin}
      onChange={handleChange}
      className="w-full accent-green-700"
    />
  </div>
</div>
      

        
                
        <button onClick={handleEstimate} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Estimate</button>

        {estimate && (
  <div id="quote-preview" className="pt-6 space-y-4">

    <div className="text-xl font-semibold">Estimated Price: €{estimate}</div>

    <div className="pt-4 space-y-4">
      {Object.entries(breakdown).map(([section, items]) => {
        const subtotal = items.reduce((sum, i) => sum + (i.isCurrency ? parseFloat(i.value) : 0), 0);
        return (
          <div key={section} className="bg-gray-50 border rounded p-4">
            <h3 className="font-semibold border-b pb-1 mb-2 capitalize text-blue-700">
  {section === 'additional' ? 'Additional Items' : section.charAt(0).toUpperCase() + section.slice(1)}
</h3>
            <ul className="space-y-1 text-sm">
              {items.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.label}</span>
                  <span>{item.isCurrency ? `€${item.value}` : `${item.value} ${item.unit}`}</span>
                </li>
              ))}
              <li className="flex justify-between font-semibold border-t pt-1 mt-2">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </li>
            </ul>
          </div>
        );
      })}

      <div className="text-right text-lg font-bold pt-2 border-t">Grand Total: €{estimate}</div>

      {/* ✅ Export Buttons: CSV + PDF */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => {
            const now = new Date().toLocaleString();
            const rows = [
              ['FLI Precast Solutions'],
              [`Quote for: ${formData.projectName || 'Unnamed Project'}`],
              [`Client: ${formData.client || 'N/A'}`],
              [`Generated: ${now}`],
              [],
            ];

            Object.entries(breakdown).forEach(([section, items]) => {
              rows.push([`${section.toUpperCase()} BREAKDOWN`]);
              rows.push(['Label', 'Value']);
              items.forEach(item => {
                rows.push([
                  item.label,
                  item.isCurrency ? `€${item.value}` : `${item.value} ${item.unit || ''}`
                ]);
              });
              rows.push([]);
            });

            rows.push(['Grand Total', `€${estimate}`]);

            const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `${formData.projectName || 'quote'}_BoQ.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>

        <button
          onClick={() => {
            const content = document.getElementById('quote-preview');
            if (!content) return;
            import('html2pdf.js').then(html2pdf => {
              html2pdf.default().from(content).save(`${formData.projectName || 'quote'}_BoQ.pdf`);
            });
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>
    </div>
  </div>
)}

        
      </main>
    </div>
  );
}
