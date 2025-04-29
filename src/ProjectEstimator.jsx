import React, { useState, useEffect } from 'react';
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

    // Load pricing.json
  const [pricingMap, setPricingMap] = useState({});
  useEffect(() => {
    fetch('/pricing.json')
      .then(response => response.json())
      .then(data => {
        setPricingMap(data);
      })
      .catch(error => {
        console.error("Failed to load pricing.json:", error);
      });
  }, []);

    const sectorProductMap = {
    Water: ['Baffle Walls', 'Contact Tanks'],
    Energy: ['Cable Troughs', 'Blast Walls'],
    'Bespoke Precast': ['Foundation Bases', 'Cover Slabs'],
  };


// Helper function to fetch unit price
const getUnitPrice = (itemName) => {
  const item = pricingData.find((entry) => entry.item === itemName);
  return item ? parseFloat(item.price) : 0;
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
    labourHours: '',
    concreteVolume: '',
    transportRate: '',
    transportQuantity: ''
  });

  const [estimate, setEstimate] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [pendingImport, setPendingImport] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [productBreakdowns, setProductBreakdowns] = useState([]);
  const [isCableTroughProduct, setIsCableTroughProduct] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


const handleEstimate = () => {
  const safe = (val) => parseFloat(val || 0);
  const safeInt = (val) => parseInt(val || '0', 10);

  if (!pricingMap || Object.keys(pricingMap).length === 0) {
  console.error('Pricing data not loaded yet.');
  return;
}

  // 📏 Concrete Volume — comes from manual entry OR uploaded CSV
  const concreteVolume = safe(formData.concreteVolume);

  // 🛠 Labour Hours — comes from manual entry OR uploaded CSV
  const totalLabourHours = safe(formData.labourHours);

  // 🎨 Design Hours & Cost
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
  const designCost = totalDesignHours * 61.12; // €61.12/hour

  // 💵 Concrete Cost
  const concreteCost = concreteVolume * 137.21;

  // 🛠 Steel Cost
  const steelKg = concreteVolume * 120;
  const steelCost = steelKg * 0.8;

  // 👷‍♂️ Labour Cost
  const labourCost = totalLabourHours * 70.11;

  // 🚚 Transport & Installation
  const transportCost = safe(formData.transportRate) * safe(formData.transportQuantity);
  const installationCost = safe(formData.installationDays) * 500;

  // ✅ Additional Items cost calculation
let additionalCost = 0;

if (productBreakdowns.length > 0) {
  productBreakdowns.forEach(product => {
    const quantity = product.quantity || 0;

    ['liftersCapstans', 'unistrut', 'sikaPowder', 'ductType'].forEach(itemKey => {
      const formKey = `additional_${product.name}_${itemKey}`;
      const unitsPerProduct = parseFloat(formData[formKey] || 0);
      const unitPrice = pricingMap[itemKey] || 0;

      additionalCost += unitsPerProduct * quantity * unitPrice;
    });
  });
}
  
  // 🧮 Total Before Margins
  let total = concreteCost + steelCost + labourCost + designCost + additionalCost + transportCost + installationCost;

  // 📈 Apply Margins
  total *= 1 + safe(formData.wasteMargin) / 100;  // Additional waste
  total *= 1 + safe(formData.groupCost) / 100;     // Group overhead
  total *= 1 + safe(formData.margin) / 100;        // Profitability margin
  

  // 💾 Save Estimate
  setEstimate(total.toFixed(2));

  // 📋 Save BoQ Breakdown
  setBreakdown({
    concrete: [
      { label: 'Concrete Volume', value: concreteVolume.toFixed(2), unit: 'm³', isCurrency: false },
      { label: 'Concrete Cost', value: concreteCost.toFixed(2), isCurrency: true }
    ],
    steel: [
      { label: 'Steel Weight', value: steelKg.toFixed(2), unit: 'kg', isCurrency: false },
      { label: 'Steel Cost', value: steelCost.toFixed(2), isCurrency: true }
    ],
    labour: [
      { label: 'Labour Hours', value: totalLabourHours.toFixed(2), unit: 'hrs', isCurrency: false },
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
  const rows = text.split('\n').map(row => row.split(','));
  const headers = rows[0].map(h => h.trim().toLowerCase());

  const quantityIndex = headers.indexOf("quantity");
  const volumeIndex = headers.indexOf("entity volume");
  const definitionIndex = headers.indexOf("definition name"); // Grab Definition Name too

  if (quantityIndex === -1 || volumeIndex === -1 || definitionIndex === -1) {
    alert("CSV must include 'Definition Name', 'Quantity', and 'Entity Volume' columns.");
    return;
  }

  let totalVolume = 0;
  let totalLabourHours = 0;
  let totalLabourCost = 0;
  const productList = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.length || row.length < Math.max(quantityIndex, volumeIndex, definitionIndex)) continue;

    const defName = row[definitionIndex]?.trim();
    const quantityRaw = row[quantityIndex];
    const volumeRaw = row[volumeIndex];

    if (!defName || !quantityRaw || !volumeRaw) continue;

    const quantity = parseFloat(quantityRaw.trim());
    const volume = parseFloat(volumeRaw.trim().replace(/[^\d.-]/g, ''));

    if (!isNaN(quantity) && !isNaN(volume)) {
      const totalRowVolume = quantity * volume;
      totalVolume += totalRowVolume;

      const concreteCost = totalRowVolume * 137.21;

      const steelKg = totalRowVolume * 120;
      const steelCost = steelKg * 0.8;

      const unitWeight = volume * 2.6;
      const labourPerUnit = unitWeight * 4.5;
      const totalRowHours = quantity * labourPerUnit;
      const totalRowCost = totalRowHours * 70.11;

      totalLabourHours += totalRowHours;
      totalLabourCost += totalRowCost;

      // 👉 Build each product's line
      productList.push({
        name: defName,
        concrete: { volume: totalRowVolume.toFixed(2), cost: concreteCost.toFixed(2) },
        steel: { kg: steelKg.toFixed(2), cost: steelCost.toFixed(2) },
        labour: { hours: totalRowHours.toFixed(2), cost: totalRowCost.toFixed(2) }
      });
    }
  }

  const concreteCostTotal = totalVolume * 137.21;

  // Update form data (populate into Manufacturing section)
  setFormData(prev => ({
    ...prev,
    concreteVolume: totalVolume.toFixed(2),
    labourHours: totalLabourHours.toFixed(2)
  }));

  // Update BoQ breakdown
  setBreakdown(prev => ({
    ...prev,
    concrete: [
      { label: 'Total Concrete Volume', value: totalVolume.toFixed(2), unit: 'm³', isCurrency: false },
      { label: 'Concrete Cost', value: concreteCostTotal.toFixed(2), isCurrency: true }
    ],
    labour: [
      { label: 'Labour Hours', value: totalLabourHours.toFixed(2), unit: 'hrs', isCurrency: false },
      { label: 'Labour Cost', value: totalLabourCost.toFixed(2), isCurrency: true }
    ],
    ...prev
  }));

  // ⭐ Now update the product breakdown table
  setProductBreakdowns(productList);
      // Detect if any product starts with "CT" (Cable Trough)
const hasCableTrough = productList.some(p => p.name.toUpperCase().startsWith('CT'));
setIsCableTroughProduct(hasCableTrough);


  // ✅ Success message
  setUploadSuccess(true);
  setTimeout(() => setUploadSuccess(false), 4000);
};



    
    reader.readAsText(file);
  }}
      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
    
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

      {/* 🔎 Product breakdown (if exists) */}
      {productBreakdowns.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Product Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Concrete (m³)</th>
                  <th className="px-3 py-2 text-right">Concrete (€)</th>
                  <th className="px-3 py-2 text-right">Steel (kg)</th>
                  <th className="px-3 py-2 text-right">Steel (€)</th>
                  <th className="px-3 py-2 text-right">Labour (hrs)</th>
                  <th className="px-3 py-2 text-right">Labour (€)</th>
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

  {/* Totals Row */}
  <tr className="border-t font-semibold bg-gray-100">
    <td className="px-3 py-2 text-right">Totals:</td>
    <td className="px-3 py-2 text-right">
      {productBreakdowns.reduce((sum, p) => sum + parseFloat(p.concrete.volume), 0).toFixed(2)}
    </td>
    <td className="px-3 py-2 text-right">
      €{productBreakdowns.reduce((sum, p) => sum + parseFloat(p.concrete.cost), 0).toFixed(2)}
    </td>
    <td className="px-3 py-2 text-right">
      {productBreakdowns.reduce((sum, p) => sum + parseFloat(p.steel.kg), 0).toFixed(2)}
    </td>
    <td className="px-3 py-2 text-right">
      €{productBreakdowns.reduce((sum, p) => sum + parseFloat(p.steel.cost), 0).toFixed(2)}
    </td>
    <td className="px-3 py-2 text-right">
      {productBreakdowns.reduce((sum, p) => sum + parseFloat(p.labour.hours), 0).toFixed(2)}
    </td>
    <td className="px-3 py-2 text-right">
      €{productBreakdowns.reduce((sum, p) => sum + parseFloat(p.labour.cost), 0).toFixed(2)}
    </td>
  </tr>
</tbody>              
            </table>
          </div>
        </div>
      )}
    </AccordionSection>
  </div>

</div>


<AccordionSection title="➕ Additional Items">
  {/* 🔔 Mode Badge */}
  {productBreakdowns.some(p => p.name.startsWith('CT')) && (
    <div className="mb-4 inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
      Cable Troughs Mode ON
    </div>
  )}

  {/* 🧱 Per-Product Inputs */}
  {productBreakdowns.filter(p => p.name.startsWith('CT')).map((product, idx) => (
    <div key={idx} className="border border-gray-300 rounded-lg mb-4 shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => {
          const copy = [...productBreakdowns];
          copy[idx].isOpen = !copy[idx].isOpen;
          setProductBreakdowns(copy);
        }}
        className="w-full text-left px-4 py-2 bg-gray-100 text-gray-800 font-semibold text-sm rounded-t hover:bg-gray-200"
      >
        {product.name} ▾
      </button>

      {/* Inputs */}
      {product.isOpen && (
        <div className="bg-white px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'unistrut', label: 'Unistrut (m)' },
            { key: 'duct', label: 'Duct Type' },
            { key: 'sika', label: 'Sika Powder (m³)' },
            { key: 'lifters', label: 'Lifters (pcs)' }
          ].map(item => (
            <div key={item.key} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">{item.label}</label>
              <input
                type={item.key === 'duct' ? 'text' : 'number'}
                name={`additional-${product.name}-${item.key}`}
                value={product[item.key] || ''}
                placeholder={item.key === 'duct' ? 'Type e.g. Duct-1' : 'Qty'}
                onChange={(e) => {
                  const updated = [...productBreakdowns];
                  updated[idx][item.key] = e.target.value;
                  setProductBreakdowns(updated);
                }}
                className="border p-2 rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  ))}

  {/* ❗Fallback message */}
  {productBreakdowns.length === 0 && (
    <div className="text-sm text-gray-500">
      Upload a SketchUp CSV to begin entering additional item inputs.
    </div>
  )}
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
