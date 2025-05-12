import React, { useState, useEffect } from 'react';
import './index.css';

  const productOptions = {
  Troughs: [
    { name: "Cable Trough", code: "CT" },
    { name: "Cable Trough Mitre", code: "CTS" },
    { name: "Cable Trough 45°", code: "CT45" },
    { name: "Cable Trough Tee", code: "CTT" },
  ],
  Chambers: [
  { name: "Chamber", code: "CH" },
],

};

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

  const pricingMapKeys = {
    unistrut: 'Unistrut',
    sikapowder: 'Sika Powder',
    ducttype1: 'Duct Type 1',
    ducttype2: 'Duct Type 2',
    ducttype3: 'Duct Type 3',
    ducttype4: 'Duct Type 4',
    lifterscapstans: 'Lifters & Capstans',
    wbarscabbling: 'W.Bar & Scabbling',
    mkkcones: 'MKK Cones',
    ladderrungs: 'Ladder Rungs',
    pullingirons: 'Pulling Irons',
    earthingpoints: 'Earthing Points',
    sumpgrates: 'Sump Grates',
    polyfleece: 'Polyfleece'
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
  const [useSketchup, setUseSketchup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [topLevelProduct, setTopLevelProduct] = useState("");

  const subProducts = productOptions[topLevelProduct] || [];
  const selectedSubProducts = subProducts.filter(
    ({ code }) => parseInt(subProductInputs[code]?.quantity) > 0
  );

  
const handleSketchUpUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0].map(h => h.trim().toLowerCase());

    const quantityIndex = headers.indexOf("quantity");
    const volumeIndex = headers.indexOf("entity volume");
    const definitionIndex = headers.indexOf("definition name");

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
        const concreteCost = totalRowVolume * 137.21;
        const steelKg = totalRowVolume * 120;
        const steelCost = steelKg * 0.8;

        const unitWeight = volume * 2.6;
        const labourPerUnit = unitWeight * 4.58;
        const totalRowHours = quantity * labourPerUnit;
        const totalRowCost = totalRowHours * 70.11;

        totalVolume += totalRowVolume;
        totalLabourHours += totalRowHours;
        totalLabourCost += totalRowCost;

        productList.push({
          name: defName,
          quantity,
          entityVolume: volume,
          concrete: { volume: totalRowVolume.toFixed(2), cost: concreteCost.toFixed(2) },
          steel: { kg: steelKg.toFixed(2), cost: steelCost.toFixed(2) },
          labour: { hours: totalRowHours.toFixed(2), cost: totalRowCost.toFixed(2) }
        });
      }
    }

    const concreteCostTotal = totalVolume * 137.21;

    setFormData(prev => ({
      ...prev,
      concreteVolume: totalVolume.toFixed(2),
      labourHours: totalLabourHours.toFixed(2)
    }));

    setBreakdown(prev => ({
      ...prev,
      concrete: [
        { label: 'Total Concrete Volume', value: totalVolume.toFixed(2), unit: 'm³', isCurrency: false },
        { label: 'Concrete Cost', value: concreteCostTotal.toFixed(2), isCurrency: true }
      ],
      labour: [
        { label: 'Labour Hours', value: totalLabourHours.toFixed(2), unit: 'hrs', isCurrency: false },
        { label: 'Labour Cost', value: totalLabourCost.toFixed(2), isCurrency: true }
      ]
    }));

    setPendingImport(productList);
    setIsCableTroughProduct(productList.some(p => p.name.toUpperCase().startsWith('CT')));
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  reader.readAsText(file);
};


 
 const handleQuantityChange = (code, value) => {
    setSubProductInputs((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        quantity: value,
      },
    }));
  };

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


const handleEstimate = () => {
  const safe = (val) => parseFloat(val || 0);
  const safeInt = (val) => parseInt(val || '0', 10);

  if (!pricingMap || Object.keys(pricingMap).length === 0) {
    console.error('Pricing data not loaded yet.');
    return;
  }

  let sourceBreakdowns = [];
  const pricingMapKeys = {
    unistrut: 'Unistrut',
    sikapowder: 'Sika Powder',
    ducttype1: 'Duct Type 1',
    ducttype2: 'Duct Type 2',
    ducttype3: 'Duct Type 3',
    ducttype4: 'Duct Type 4',
    lifterscapstans: 'Lifters & Capstans',
    wbarscabbling: 'W.Bar & Scabbling',
    mkkcones: 'MKK Cones',
    ladderrungs: 'Ladder Rungs',
    pullingirons: 'Pulling Irons',
    earthingpoints: 'Earthing Points',
    sumpgrates: 'Sump Grates',
    polyfleece: 'Polyfleece'
  };

  if (pendingImport && pendingImport.length > 0) {
    sourceBreakdowns = pendingImport;
  } else {
    Object.entries(subProductInputs).forEach(([productName, inputs]) => {
      const quantity = safe(inputs.quantity || 1);
      const length = safe(inputs.length);
      const width = safe(inputs.width);
      const height = safe(inputs.height);
      const concreteVolume = length * width * height * quantity;
      const steelKg = concreteVolume * 120;
      const labourHrs = safe(inputs.labourHours);

      const additionalItems = inputs.additionalItems || {};
      const additionalMapped = {};

      Object.keys(pricingMapKeys).forEach(normalizedKey => {
        const label = pricingMapKeys[normalizedKey];
        const foundKey = Object.keys(additionalItems).find(k => k.toLowerCase() === label.toLowerCase());
        const val = safe(foundKey ? additionalItems[foundKey] : 0);
        if (val > 0) {
          additionalMapped[normalizedKey] = val;
        }
      });

      sourceBreakdowns.push({
        name: productName,
        quantity,
        concrete: { volume: concreteVolume.toFixed(2) },
        steel: { kg: steelKg.toFixed(2) },
        labour: { hours: labourHrs.toFixed(2) },
        ...additionalMapped
      });
    });
  }

  const designFields = [
    'proposalHours', 'designMeetingsHours', 'structuralDesignHours', 'revitModelHours',
    'approvalCommentsHours', 'detailingJointsHours', 'detailingFloorsHours', 'detailingScreedHours',
    'gasHours', 'productionUnitsHours', 'productionCheckingHours', 'siteQueriesHours', 'asBuiltsHours'
  ];
  const totalDesignHours = designFields.reduce((sum, key) => sum + safe(formData[key]), 0);
  const designRate = 61.12;
  const designCost = totalDesignHours * designRate;

  const transportRate = safe(formData.transportRate);
  const transportQty = safe(formData.transportQuantity);
  const transportCost = transportRate * transportQty;

  const installationRate = 500;
  const installationDays = safe(formData.installationDays);
  const installationCost = installationDays * installationRate;

  let grandTotal = 0;

  let concreteSubtotal = 0;
  let concreteUnitTotal = 0;
  let steelSubtotal = 0;
  let steelUnitTotal = 0;
  let labourSubtotal = 0;
  let labourUnitTotal = 0;
  let additionalSubtotal = 0;
  let additionalUnitTotal = 0;

  const computedBreakdowns = sourceBreakdowns.map(product => {
    const quantity = safe(product.quantity);
    const concreteVol = safe(product.concrete?.volume);
    const steelKg = safe(product.steel?.kg);
    const labourHrs = safe(product.labour?.hours);

    const concreteCost = concreteVol * 137.21;
    const steelCost = steelKg * 0.8;
    const labourCost = labourHrs * 70.11;

    let additionalCost = 0;
    const additionalItems = [];

    Object.entries(pricingMapKeys).forEach(([normalizedKey, label]) => {
      const unitQty = safe(product[normalizedKey]) * quantity;
      const unitPrice = pricingMap[label] || 0;
      const itemCost = unitQty * unitPrice;
      additionalCost += itemCost;
      additionalUnitTotal += unitQty;

      if (unitQty > 0) {
        additionalItems.push({ label, qty: unitQty, cost: itemCost });
      }
    });

    let subtotal = concreteCost + steelCost + labourCost + additionalCost;
    subtotal *= 1 + safe(formData.wasteMargin) / 100;
    subtotal *= 1 + safe(formData.groupCost) / 100;
    subtotal *= 1 + safe(formData.margin) / 100;

    grandTotal += subtotal;
    concreteSubtotal += concreteCost;
    concreteUnitTotal += concreteVol;
    steelSubtotal += steelCost;
    steelUnitTotal += steelKg;
    labourSubtotal += labourCost;
    labourUnitTotal += labourHrs;
    additionalSubtotal += additionalCost;

    return {
      ...product,
      concreteCost,
      steelCost,
      labourCost,
      additionalItems,
      total: subtotal
    };
  });

  grandTotal += designCost + transportCost + installationCost;

  setEstimate(grandTotal.toFixed(2));
  setProductBreakdowns(computedBreakdowns);
  setBreakdown({
    design: [
      { label: 'Total Design Hours', value: totalDesignHours.toFixed(2), unit: 'hrs', isCurrency: false },
      { label: 'Design Cost', value: designCost.toFixed(2), isCurrency: true },
      { label: 'Design Rate', value: designRate.toFixed(2), unit: '€/hr', isCurrency: true }
    ],
    transport: [
      { label: 'Transport Quantity', value: transportQty, unit: 'loads', isCurrency: false },
      { label: 'Transport Cost', value: transportCost.toFixed(2), isCurrency: true },
      { label: 'Transport Rate', value: transportRate.toFixed(2), unit: '€/load', isCurrency: true }
    ],
    installation: [
      { label: 'Installation Days', value: installationDays, unit: 'days', isCurrency: false },
      { label: 'Installation Cost', value: installationCost.toFixed(2), isCurrency: true },
      { label: 'Installation Rate', value: installationRate.toFixed(2), unit: '€/day', isCurrency: true }
    ],
    subtotals: {
      concrete: { cost: concreteSubtotal, units: concreteUnitTotal },
      steel: { cost: steelSubtotal, units: steelUnitTotal },
      labour: { cost: labourSubtotal, units: labourUnitTotal },
      additional: { cost: additionalSubtotal, units: additionalUnitTotal }
    },
    services: [
      { label: 'Design', value: designCost.toFixed(2), units: totalDesignHours, unitLabel: 'hrs', unitPrice: designRate },
      { label: 'Installation', value: installationCost.toFixed(2), units: installationDays, unitLabel: 'days', unitPrice: installationRate },
      { label: 'Transport', value: transportCost.toFixed(2), units: transportQty, unitLabel: 'loads', unitPrice: transportRate }
    ]
  });

  setPendingImport(null);
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
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



    <AccordionSection title="🏗️ Manufacturing BoQ">
      {/* SketchUp Toggle */}
      <label className="inline-flex items-center mb-4 gap-2">
        <input
          type="checkbox"
          checked={useSketchup}
          onChange={(e) => setUseSketchup(e.target.checked)}
          className="accent-blue-600"
        />
        <span className="text-sm text-blue-800 font-medium">Use SketchUp</span>
      </label>

      {useSketchup && (
        <div className="mb-6 border border-blue-200 bg-blue-50 rounded p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">📅 Upload SketchUp CSV</h4>
          <p className="text-xs text-gray-600 mb-2">Import product volumes from SketchUp</p>

          {uploadSuccess && (
            <div className="mb-3 p-2 rounded bg-green-100 text-green-800 border border-green-300 text-xs">
              ✅ File uploaded and values extracted successfully!
            </div>
          )}

          <input
            type="file"
            accept=".csv"
            onChange={handleSketchUpUpload}
            className="block w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
        </div>
      )}


 {/* Top-Level Product Selector and Sub-Product Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-6 border rounded p-4 bg-emerald-50 shadow-sm">
        <div className="w-full lg:w-1/4">
          <label className="text-xs font-semibold block mb-2 text-gray-700 uppercase tracking-wide">
            Product/Structure Selector
          </label>
          <select
            value={topLevelProduct}
            onChange={(e) => setTopLevelProduct(e.target.value)}
            className="w-full border p-2 rounded text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Structure</option>
            <option value="Troughs">Troughs</option>
            <option value="Chambers">Chambers</option>
            <option value="Walls">Walls</option>
            <option value="Beams">Beams</option>
            <option value="Slabs">Slabs</option>
            <option value="SATs">SATs</option>
            <option value="Tanks">Tanks</option>
            <option value="Specials">Specials</option>
          </select>
        </div>

        <div className="w-full lg:w-3/4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subProducts.map(({ name, code }) => (
            <div
              key={code}
              className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between h-full"
              title={name}
            >
              <div>
                <h4 className="font-semibold text-sm text-gray-800 mb-1 truncate">{name}</h4>
                <p className="text-xs text-gray-500 mb-3 break-words">{code}</p>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <input
                  type="number"
                  min="0"
                  value={subProductInputs[code]?.quantity || ""}
                  onChange={(e) => handleQuantityChange(code, e.target.value)}
                  className="w-16 text-xs border rounded-full px-2 py-1 text-center"
                  placeholder="Qty"
                />
                <button
                  onClick={() => setSelectedProduct(code)}
                  className="text-green-600 hover:text-green-800 text-sm"
                  title={`Set Quantity for ${name}`}
                >
                  🔢
                </button>
      
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSubProducts.length > 0 && (
        <div className="mt-6">
          <div className="flex gap-2 border-b pb-2 mb-4">
            {selectedSubProducts.map(({ code }) => (
              <button
                key={code}
                onClick={() => setSelectedProduct(code)}
                className={`px-4 py-1 rounded-t text-sm font-medium transition ${
                  selectedProduct === code
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="p-4 border rounded bg-white">
            <h3 className="text-md font-semibold text-blue-700 mb-2">
              Configure: {selectedProduct}
            </h3>

            <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h4 className="text-xs font-bold uppercase text-gray-700 mb-4 tracking-wider border-b pb-2 sticky top-[30px] bg-gray-50 z-10">
                Inputs - Common
              </h4>

              <div className="mb-4">
                <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Concrete</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["length", "width", "height", "baseThickness", "wallThickness", "sectionArea"].map((field) => {
                    const labelMap = {
                      length: "Length (mm)",
                      width: "Width (mm)",
                      height: "Height (mm)",
                      baseThickness: "Base Thickness (mm)",
                      wallThickness: "Wall Thickness (mm)",
                      sectionArea: "Area of Section (m²)"
                    };
                    return (
                      <div key={field} className="flex flex-col">
                        <label className="text-xs font-medium mb-1">{labelMap[field]}</label>
                        <input
                          type="number"
                          value={subProductInputs[selectedProduct]?.[field] || ''}
                          onChange={(e) => handleSubInputChange(selectedProduct, field, e.target.value)}
                          className="border p-2 rounded text-xs"
                          placeholder={field === "sectionArea" ? "e.g. 0.15" : ""}
                        />
                      </div>
                    );
                  })}

                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1">Area of Section (m²)</label>
                      <input
                        type="number"
                        value={subProductInputs[selectedProduct]?.sectionArea || ''}
                        onChange={(e) => handleSubInputChange(selectedProduct, 'sectionArea', e.target.value)}
                        className="border p-2 rounded text-xs w-24"
                        placeholder="e.g. 0.15"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1">Chamber Density (kg/m³)</label>
                      <input
                        type="number"
                        value={subProductInputs[selectedProduct]?.chamberDensity || ''}
                        onChange={(e) => handleSubInputChange(selectedProduct, 'chamberDensity', e.target.value)}
                        className="border p-2 rounded text-xs w-24"
                        placeholder="e.g. 90"
                      />
                    </div>

                  
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Steel/Fibres</h5>
                  <select
                    value={subProductInputs[selectedProduct]?.steelGrade || ''}
                    onChange={(e) => handleSubInputChange(selectedProduct, 'steelGrade', e.target.value)}
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
                <div className="flex flex-col">
                  <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Surface Finish</h5>
                  <select
                    value={subProductInputs[selectedProduct]?.surfaceFinish || ''}
                    onChange={(e) => handleSubInputChange(selectedProduct, 'surfaceFinish', e.target.value)}
                    className="border p-2 rounded text-xs bg-white"
                  >
                    <option value="">Select Finish</option>
                    <option value="F1">F1 (Basic)</option>
                    <option value="F2">F2 (Higher Class)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Labour</h5>
                  <input
                    type="number"
                    name="labourHours"
                    value={subProductInputs[selectedProduct]?.labourHours || ''}
                    onChange={(e) => handleSubInputChange(selectedProduct, 'labourHours', e.target.value)}
                    placeholder="Labour Hrs/Unit"
                    className="border p-2 rounded text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
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
        <label className="text-xs font-medium mb-1">{item.label}</label>
        <input
          type="number"
          name={item.name}
          value={formData[item.name] || ''}
          onChange={handleChange}
          placeholder="Hours"
          className="border p-2 rounded text-xs"
        />
      </div>
    ))}
  </div>
</AccordionSection>
    

<AccordionSection title="🚚 Transport">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Transport Rate (€)</label>
      <input
        type="number"
        name="transportRate"
        value={formData.transportRate}
        onChange={handleChange}
        placeholder="€/trip"
        className="border p-2 rounded text-xs"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Transport Quantity</label>
      <input
        type="number"
        name="transportQuantity"
        value={formData.transportQuantity}
        onChange={handleChange}
        placeholder="No. loads"
        className="border p-2 rounded text-xs"
      />
    </div>
  </div>
</AccordionSection>


        


<AccordionSection title="🛠 Installation">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Installation Duration (Days)</label>
      <input
        type="number"
        name="installationDays"
        value={formData.installationDays}
        onChange={handleChange}
        placeholder="Days"
        className="border p-2 rounded text-xs"
      />
    </div>
  </div>
</AccordionSection>



{/* 📊 Quote Controls */}
<div className="bg-gray-50 border border-gray-300 rounded-lg shadow-sm p-4 mb-6">
  <h2 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quote Controls</h2>

  {/* Controls Grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* 🔴 Waste Slider */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-red-700">
        Additional Waste
        <span className="ml-2 font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
          {formData.wasteMargin || 5}%
        </span>
      </label>
      <input
        type="range"
        min="0"
        max="20"
        step="1"
        name="wasteMargin"
        value={formData.wasteMargin || 5}
        onChange={handleChange}
        className="w-full accent-red-600 rounded-full"
      />
    </div>

    {/* 🔵 Group Cost */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-blue-700">
        Group Cost
        <span className="ml-2 font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
          {formData.groupCost || 2.5}%
        </span>
      </label>
      <input
        type="range"
        min="0"
        max="20"
        step="0.1"
        name="groupCost"
        value={formData.groupCost || 2.5}
        onChange={handleChange}
        className="w-full accent-blue-500 rounded-full"
      />
    </div>

    {/* 🟢 Profit Margin */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-green-700">
        Profit Margin
        <span className="ml-2 font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
          {formData.margin}%
        </span>
      </label>
      <input
        type="range"
        min="0"
        max="100"
        name="margin"
        value={formData.margin}
        onChange={handleChange}
        className="w-full accent-green-600 rounded-full"
      />
    </div>
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
    <h2 className="text-lg font-bold text-gray-800 mb-4">📦 BoQ Breakdown</h2>

   <div className="overflow-x-auto">
  <table className="w-full text-xs border">
    <thead className="bg-blue-100 text-left text-blue-800 uppercase tracking-wider">
      <tr>
        <th className="border p-2">Product</th>
        <th className="border p-2">Qty</th>
        <th className="border p-2">Concrete (m³)</th>
        <th className="border p-2">Steel (kg/m³)</th>
        <th className="border p-2">Labour (hrs)</th>
        <th className="border p-2">Add. Items</th>
        <th className="border p-2 text-right">Total (€)</th>
      </tr>
    </thead>
    <tbody>
      {productBreakdowns.map((product, idx) => {
        const { quantity, concrete, steel, labour, additionalItems, total } = product;
        const concreteVol = parseFloat(concrete?.volume || 0);
        const steelKg = parseFloat(steel?.kg || 0);
        const labourHrs = parseFloat(labour?.hours || 0);
        const concreteCost = product.concreteCost || 0;
        const steelCost = product.steelCost || 0;
        const labourCost = product.labourCost || 0;

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
                      <span className="font-semibold">{item.label}</span>: {Math.round(item.qty)}
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

      {/* ➕ Subtotals Row */}
      <tr className="bg-blue-100 text-blue-800 font-semibold text-sm border-t-2 border-blue-300">
        <td className="border p-2 text-right" colSpan={2}>Subtotals:</td>
        <td className="border p-2 text-center">
          {breakdown.subtotals?.concrete?.units?.toFixed(2)} m³
          <div className="text-gray-500 text-[10px]">
            €{breakdown.subtotals?.concrete?.cost?.toFixed(2)}
          </div>
        </td>
        <td className="border p-2 text-center">
          {breakdown.subtotals?.steel?.units?.toFixed(2)} kg/m³
          <div className="text-gray-500 text-[10px]">
            €{breakdown.subtotals?.steel?.cost?.toFixed(2)}
          </div>
        </td>
        <td className="border p-2 text-center">
          {breakdown.subtotals?.labour?.units?.toFixed(2)} hrs
          <div className="text-gray-500 text-[10px]">
            €{breakdown.subtotals?.labour?.cost?.toFixed(2)}
          </div>
        </td>
        <td className="border p-2 text-center">
          {breakdown.subtotals?.additional?.units?.toFixed(0)} items
          <div className="text-gray-500 text-[10px]">
            €{breakdown.subtotals?.additional?.cost?.toFixed(2)}
          </div>
        </td>
        <td className="border p-2 text-right font-bold text-sm">—</td>
      </tr>
    </tbody>
  </table>
</div>


{/* 🛠 Service Costs Table */}
<div className="mt-6 overflow-x-auto">
  <table className="w-full text-sm border border-gray-300">
      <thead className="bg-blue-100 text-left text-blue-800 uppercase tracking-wider">

      <tr>
        <th className="border p-2 text-left">Service</th>
        <th className="border p-2 text-center">Qty (Unit)</th>
        <th className="border p-2 text-center">Unit Price</th>
        <th className="border p-2 text-right">Total (€)</th>
      </tr>
    </thead>
    <tbody className="bg-white text-gray-800">
      {breakdown.services?.map((s, i) => (
        <tr key={i} className="text-sm">
          <td className="border p-2 font-medium">{s.label}</td>
          <td className="border p-2 text-center">
            {s.units} {s.unitLabel}
          </td>
          <td className="border p-2 text-center">€{parseFloat(s.unitPrice).toFixed(2)}</td>
          <td className="border p-2 text-right font-semibold">€{parseFloat(s.value).toFixed(2)}</td>
        </tr>
      ))}

      {/* Total Row */}
      <tr className="bg-blue-100 text-blue-800 font-semibold text-sm border-t-2 border-blue-300">
        <td className="border p-2 text-right" colSpan={3}>Total Service Costs:</td>
        <td className="border p-2 text-right">
          €{(breakdown.services?.reduce((sum, s) => sum + parseFloat(s.value || 0), 0)).toFixed(2)}
        </td>
      </tr>
    </tbody>
  </table>
</div>




    {/* 💰 Grand Total */}
    <div className="mt-6 text-right text-base font-bold text-blue-900">
      Grand Total: €{estimate}
    </div>
  </div>
)}


        
</main>
    </div>
  );
}
