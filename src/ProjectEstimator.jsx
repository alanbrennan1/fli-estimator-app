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
      // ✅ Convert array into a simple key:value object
      const mappedData = {};
      data.forEach(entry => {
        mappedData[entry.item] = parseFloat(entry.price);
      });

      // ✅ LOG here!
      console.log("Pricing map loaded:", mappedData);

      setPricingMap(mappedData);
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

  const subProductMap = {
  Troughs: [
    'CT45 182809600410_0000_065_D400',
    'CTT_250009600410_0000_065_D400',
    'CT_25609600410_0000_065_D400'
  ],
  // Add more mappings for other structure types as needed
};


// Helper function to fetch unit price
const getUnitPrice = (itemName) => {
  const item = pricingData.find((entry) => entry.item === itemName);
  return item ? parseFloat(item.price) : 0;
};

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
  const [productQuantities, setProductQuantities] = useState({});
  const [subProductInputs, setSubProductInputs] = useState({});

  const handleSubInputChange = (productName, field, value) => {
  setSubProductInputs(prev => ({
    ...prev,
    [productName]: {
      ...prev[productName],
      [field]: value
    }
  }));
};

  const handleAdditionalItemChange = (productName, itemName, value) => {
  setSubProductInputs(prev => ({
    ...prev,
    [productName]: {
      ...prev[productName],
      additionalItems: {
        ...prev[productName]?.additionalItems,
        [itemName]: value
      }
    }
  }));
};

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

// 🛠 Mapping between app field names and pricing file names
const itemPricingKeys = {
  unistrut: "Unistrut",
  sika: "Sika Powder",
  duct: "Duct Type",
  lifters: "Lifters & Capstans"
};

let additionalCost = 0;
let additionalItemsBreakdown = {}; // grouped by product name

if (productBreakdowns.length > 0) {
  productBreakdowns.forEach(product => {
    const quantity = product.quantity || 0;

    ['unistrut', 'duct', 'sika', 'lifters'].forEach(itemKey => {
      const unitsPerProduct = parseFloat(product[itemKey] || 0);
      const unitPrice = pricingMap[itemPricingKeys[itemKey]] || 0;

      if (!isNaN(unitsPerProduct) && unitsPerProduct > 0) {
        const cost = unitsPerProduct * quantity * unitPrice;

        additionalCost += cost;

        if (!additionalItemsBreakdown[product.name]) {
          additionalItemsBreakdown[product.name] = [];
        }

        additionalItemsBreakdown[product.name].push({
          label: itemKey.charAt(0).toUpperCase() + itemKey.slice(1),
          value: cost.toFixed(2),
          isCurrency: true,
          unitQty: unitsPerProduct * quantity,
          unitPrice: unitPrice.toFixed(2)
        });
      }
    });
  });
}

// ✅ Move this OUTSIDE the loops, after both `.forEach()` are done
let flatGrouped = [];
Object.entries(additionalItemsBreakdown).forEach(([productName, items]) => {
  flatGrouped.push({ isGroupHeader: true, label: productName });
  flatGrouped.push(...items);
});



  
// 🧮 Calculate total Additional Items Cost
const totalAdditionalCost = flatGrouped.reduce(
  (sum, item) => item.isCurrency ? sum + parseFloat(item.value) : sum,
  0
);

// 🧮 Total Before Margins
let total = concreteCost + steelCost + labourCost + designCost + totalAdditionalCost + transportCost + installationCost;


  // 📈 Apply Margins
  total *= 1 + safe(formData.wasteMargin) / 100;  // Additional waste
  total *= 1 + safe(formData.groupCost) / 100;     // Group overhead
  total *= 1 + safe(formData.margin) / 100;        // Profitability margin
  

  // 💾 Save Estimate
  setEstimate(total.toFixed(2));


console.log("🔍 Breakdown structure:", breakdown);
console.log("✅ flatGrouped is array:", Array.isArray(flatGrouped));
console.log("📦 flatGrouped contents:", flatGrouped);

  
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

   additional: flatGrouped.length > 0 ? flatGrouped : [
  { label: 'No additional items', value: 0, isCurrency: true }
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

  {/* 📌 Project Info */}
<AccordionSection title="📌 Project Details">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
    {/* Project Name */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Project Name</label>
      <input
        name="projectName"
        value={formData.projectName}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>

    {/* Account Name */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Account Name</label>
      <select
        name="accountName"
        value={formData.accountName}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Account</option>
      </select>
    </div>

    {/* Account Contact */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Account Contact</label>
      <select
        name="accountContact"
        value={formData.accountContact}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Contact</option>
      </select>
    </div>

    {/* End Client */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">End Client</label>
      <select
        name="endClient"
        value={formData.endClient}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select End Client</option>
      </select>
    </div>

    {/* Salesperson */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Salesperson</label>
      <select
        name="salesperson"
        value={formData.salesperson}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Salesperson</option>
      </select>
    </div>

    {/* Sector */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Sector</label>
      <select
        name="sector"
        value={formData.sector}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Sector</option>
      </select>
    </div>

    {/* Close Date */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Close Date</label>
      <input
        name="closeDate"
        type="date"
        value={formData.closeDate || ''}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>

    {/* Currency & Probability */}
    <div className="flex flex-col col-span-1">
      <label className="text-xs font-medium mb-1">Currency</label>
      <select
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Currency</option>
        <option value="£">£</option>
        <option value="€">€</option>
      </select>
    </div>
    <div className="flex flex-col col-span-1">
      <label className="text-xs font-medium mb-1">Probability (%)</label>
      <input
        name="probability"
        type="number"
        value={formData.probability || ''}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>

    {/* Req. Products */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Req. Products</label>
      <select
        name="requiredProducts"
        value={formData.requiredProducts}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Product</option>
      </select>
    </div>

    {/* Region */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Region</label>
      <select
        name="region"
        value={formData.region}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      >
        <option value="">Select Region</option>
      </select>
    </div>

    {/* Return Date */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Return Date</label>
      <input
        name="returnDate"
        type="date"
        value={formData.returnDate || ''}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>

    {/* Opp. Description */}
    <div className="flex flex-col md:col-span-4">
      <label className="text-xs font-medium mb-1">Opp. Description</label>
      <textarea
        name="opportunityDescription"
        value={formData.opportunityDescription}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        rows={3}
      />
    </div>

    {/* Address */}
    <div className="flex flex-col md:col-span-4">
      <label className="text-xs font-medium mb-1">Address</label>
      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>
  </div>
</AccordionSection>


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
        quantity,
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
         

{/* 🏗 Manufacturing Layout */}
<div className="flex flex-col md:flex-row gap-6 items-start">


          {/* ➡️ Right: Manufacturing Accordion */}
  <div className="flex-1">
    <AccordionSection title="🏗️ Manufacturing BoQ">
      <div className="flex justify-center mb-4">
        <div className="flex flex-col w-1/2 rounded shadow border border-gray-300 bg-gray-100 p-4">
          <label className="text-xs font-bold mb-2 text-center text-gray-700 uppercase tracking-wide">Product/Structure Selector</label>
          <select
            name="structureSelector"
            value={formData.structureSelector}
            onChange={handleChange}
            className="border p-2 rounded text-xs bg-white focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Structure</option>
            <option value="Chambers">Chambers</option>
            <option value="Walls">Walls</option>
            <option value="Columns">Columns</option>
            <option value="Beams">Beams</option>
            <option value="Slabs">Slabs</option>
            <option value="Troughs">Troughs</option>
            <option value="SATs">SAT’s</option>
            <option value="Tanks">Tanks</option>
            <option value="Specials">Specials</option>
          </select>
        </div>
      </div>

{subProductMap[formData.structureSelector]?.length > 0 && (
  <div className="mt-6">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {subProductMap[formData.structureSelector].map((productName, idx) => (
        <div key={idx} className="border border-gray-300 bg-white rounded-lg p-4">
          {/* 🏗️ Sub-product input block content (Inputs - Common + Unique) goes here */}
          <h6 className="text-sm font-semibold text-blue-800 mb-3">{productName}</h6>

    {/* 🧱 Inputs - Common */}
    <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h4 className="text-xs font-bold uppercase text-gray-700 mb-4 tracking-wider border-b pb-2">Inputs - Common</h4>

      {/* Concrete Header */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Concrete</h5>
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
                <label className="text-xs font-medium mb-1">{labelMap[field]}</label>
                <input
                  name={field}
                  type="number"
                  value={subProductInputs[productName]?.[field] || ''}
                  onChange={(e) => handleSubInputChange(productName, field, e.target.value)}
                  className="border p-2 rounded text-xs"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Steel/Fibres, Surface Finish, Labour */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Steel Grade */}
        <div className="flex flex-col">
          <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Steel/Fibres</h5>
          <select
            value={subProductInputs[productName]?.steelGrade || ''}
            onChange={(e) => handleSubInputChange(productName, 'steelGrade', e.target.value)}
            className="border p-2 rounded text-xs"
          >
            <option value="">Select Steel Grade</option>
            <option value="B125">B125</option>
            <option value="C250">C250</option>
            <option value="D400">D400</option>
            <option value="E600">E600</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Surface Finish */}
        <div className="flex flex-col">
          <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Surface Finish</h5>
          <input
            type="text"
            value={subProductInputs[productName]?.surfaceFinish || ''}
            onChange={(e) => handleSubInputChange(productName, 'surfaceFinish', e.target.value)}
            placeholder="e.g. Trowelled, Brushed"
            className="border p-2 rounded text-xs"
          />
        </div>

        {/* Labour Hours */}
        <div className="flex flex-col">
          <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Labour</h5>
          <input
            type="number"
            value={subProductInputs[productName]?.labourHours || ''}
            onChange={(e) => handleSubInputChange(productName, 'labourHours', e.target.value)}
            placeholder="Hours"
            className="border p-2 rounded text-xs"
          />
        </div>
      </div>
    </div>

    {/* 🧩 Inputs - Unique */}
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h4 className="text-xs font-bold uppercase text-gray-700 mb-4 tracking-wider border-b pb-2">Inputs - Unique</h4>

      {/* Additional Items Header */}
      <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Additional Items</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        {[
          'W.Bar & Scabbling', 'Lifters & Capstans', 'MKK Cones', 'Duct Type 1', 'Duct Type 2',
          'Duct Type 3', 'Duct Type 4', 'Unistrut', 'Ladder Rungs', 'Sika Powder',
          'Pulling Irons', 'Earthing Points', 'Sump Grates', 'Polyfleece'
        ].map((item, itemIdx) => (
          <div key={itemIdx} className="flex flex-col gap-1">
            <label className="text-xs font-medium">{item}</label>
            <input
              type="number"
              value={subProductInputs[productName]?.additionalItems?.[item] || ''}
              onChange={(e) => handleAdditionalItemChange(productName, item, e.target.value)}
              placeholder="Qty"
              className="border p-1 rounded w-24 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
))}


      {/* Keep the rest of the product breakdown logic unchanged */}
    </AccordionSection>




  </div>

</div>
    
        
        

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


{/* ▶ Generate Estimate */}
<div className="mt-6 text-center">
  <button
    onClick={handleEstimate}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow text-sm"
  >
    Generate Estimate
  </button>
</div>


{productBreakdowns.length > 0 && (
  <div className="mt-10 bg-white border border-gray-300 rounded shadow p-6">
    <h2 className="text-lg font-bold text-gray-800 mb-4">📦 Product Breakdown (BoQ)</h2>

    <div className="overflow-x-auto">
      <table className="w-full text-xs border">
        <thead className="bg-gray-100 text-left text-gray-700 uppercase tracking-wider">
          <tr>
            <th className="border p-2">Product</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Concrete (m³)</th>
            <th className="border p-2">Steel (kg)</th>
            <th className="border p-2">Labour (hrs)</th>
            <th className="border p-2">Add. Items</th>
            <th className="border p-2 text-right">Total (€)</th>
          </tr>
        </thead>
        <tbody>
          {productBreakdowns.map((product, idx) => {
            const quantity = parseFloat(product.quantity || 0);
            const concreteVol = parseFloat(product.concrete?.volume || 0);
            const steelKg = parseFloat(product.steel?.kg || 0);
            const labourHrs = parseFloat(product.labour?.hours || 0);

            const concreteCost = concreteVol * 137.21;
            const steelCost = steelKg * 0.8;
            const labourCost = labourHrs * 70.11;

            let additionalItems = [];
            let additionalCost = 0;

            ['unistrut', 'sika', 'duct', 'lifters'].forEach((key) => {
              const pricingMapKeys = {
                unistrut: 'Unistrut',
                sika: 'Sika Powder',
                duct: 'Duct Type',
                lifters: 'Lifters & Capstans'
              };

              const unitQty = parseFloat(product[key] || 0) * quantity;
              const unitPrice = pricingMap[pricingMapKeys[key]] || 0;
              const itemCost = unitQty * unitPrice;

              if (unitQty > 0) {
                additionalItems.push({
                  label: pricingMapKeys[key],
                  qty: unitQty,
                  cost: itemCost
                });
                additionalCost += itemCost;
              }
            });

            const total = concreteCost + steelCost + labourCost + additionalCost;

            return (
              <tr key={idx} className="border-b">
                <td className="border p-2 font-medium text-sm">{product.name}</td>
                <td className="border p-2 text-center">{quantity}</td>
                <td className="border p-2 text-center">
                  {concreteVol.toFixed(2)}
                  <div className="text-gray-500 text-[10px]">€{concreteCost.toFixed(2)}</div>
                </td>
                <td className="border p-2 text-center">
                  {steelKg.toFixed(2)}
                  <div className="text-gray-500 text-[10px]">€{steelCost.toFixed(2)}</div>
                </td>
                <td className="border p-2 text-center">
                  {labourHrs.toFixed(2)}
                  <div className="text-gray-500 text-[10px]">€{labourCost.toFixed(2)}</div>
                </td>
                <td className="border p-2">
                  {additionalItems.length > 0 ? (
                    <ul className="space-y-1">
                      {additionalItems.map((item, i) => (
                        <li key={i}>
                          <span className="font-semibold">{item.label}</span>: {item.qty.toFixed(2)}
                          <div className="text-gray-500 text-[10px]">€{item.cost.toFixed(2)}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </td>
                <td className="border p-2 text-right font-bold text-sm">€{total.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Grand Total */}
    <div className="mt-6 text-right text-base font-bold text-blue-900">
      Grand Total: €{estimate}
    </div>
  </div>
)}





        
</main>
    </div>
  );
}

      
