import React, { useState, useEffect } from 'react';  
import './index.css';

  const productOptions = {
 Cable Troughs: [
    { name: "Cable Trough", code: "CT" },
    { name: "Cable Trough Mitre", code: "CTS" },
    { name: "Cable Trough 45°", code: "CT45" },
    { name: "Cable Trough Tee", code: "CTT" },
  ],
 Slot Drain: [
    { name: "Slot Drain - Standard", code: "SD" },
    { name: "Slot Drain - Mitre", code: "SDM" },
    { name: "Slot Drain - Rodding Point°", code: "SDR" },
  ],
    
    Chambers: [
  { name: "Chamber", code: "CH" },
],
      Columns: [
  { name: "Column", code: "C" },
],
  Slabs: [
  { name: "Cover Slab", code: "CS" }, 
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

useEffect(() => {
  fetch('/additionalItems.json')
    .then(res => res.json())
    .then(data => {
      // Normalize keys
      const normalized = {};
      for (const category in data) {
        normalized[category] = data[category].map(entry => ({
          item: entry["Item"],
          materialCost: entry["Material Cost"]
        }));
      }
      console.log("Normalized additional items:", normalized);
      setAdditionalItemsData(normalized);
    })
    .catch(err => console.error("Failed to load additionalItems.json:", err));
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
  const [useSketchup, setUseSketchup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [topLevelProduct, setTopLevelProduct] = useState("");
  const [configuredProductTypes, setConfiguredProductTypes] = useState(new Set());

  const allSubProducts = Array.from(configuredProductTypes).flatMap(type => productOptions[type] || []);
  const subProducts = productOptions[topLevelProduct] || [];
  const [additionalItemsData, setAdditionalItemsData] = useState({});
  const [standardTroughData, setStandardTroughData] = useState([]);
  const [shouldResetCT, setShouldResetCT] = useState(false);
  const [showCTPulse, setShowCTPulse] = useState(false);


  useEffect(() => {
    fetch('/standard_trough_details_clean.json')
      .then((res) => res.json())
      .then((data) => setStandardTroughData(data))
      .catch((err) => console.error('Failed to load standard trough data', err));
  }, []);

  useEffect(() => {
  if (shouldResetCT) {
    setSubProductInputs(prev => ({
      ...prev,
      CT: {
        quantity: '', // leave blank
         }, // reset only the base CT tab, not variants
    }));

    // Delay resetting the flag slightly to let CT tab mount
    setTimeout(() => setShouldResetCT(false), 0);
  }
}, [shouldResetCT]);
  

useEffect(() => {
  if (topLevelProduct === 'Troughs') {
    setShowCTPulse(true);
    const timeout = setTimeout(() => setShowCTPulse(false), 1500);
    return () => clearTimeout(timeout);
  }
}, [topLevelProduct]);


  useEffect(() => {
  const chamberKey = Object.keys(subProductInputs).find(k => k.startsWith('CH'));
  const coverSlabKey = Object.keys(subProductInputs).find(k => k.startsWith('CS'));

  if (chamberKey && coverSlabKey) {
    const chamber = subProductInputs[chamberKey];
    const coverSlab = subProductInputs[coverSlabKey];

    const chamberLength = parseFloat(chamber.length || 0);
    const chamberWidth = parseFloat(chamber.width || 0);
    const wallThickness = parseFloat(chamber.wallThickness || 0);
    const baseThickness = parseFloat(chamber.baseThickness || 0);

    const calculatedLength = chamberLength + 2 * wallThickness;
    const calculatedWidth = chamberWidth + 2 * wallThickness;

    setSubProductInputs(prev => ({
      ...prev,
      [coverSlabKey]: {
        ...prev[coverSlabKey],
        length: calculatedLength.toFixed(0),
        width: calculatedWidth.toFixed(0),
        wallThickness: wallThickness.toFixed(0),
        baseThickness: baseThickness.toFixed(0)
      }
    }));
  }
}, [subProductInputs]);


  
const selectedSubProducts = [
  ...allSubProducts.filter(({ code }) =>
    code !== 'CT' && parseInt(subProductInputs[code]?.quantity) > 0
  ),
  ...Object.entries(subProductInputs)
    .filter(([key, val]) =>
  key.startsWith('CT-') || 
  (key === 'CT' && topLevelProduct === 'Troughs' && Object.keys(val || {}).length > 0)
)

    .map(([key]) => ({ code: key, name: key }))
];



  
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
        const steelCost = steelKg * 0.86;

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

  function buildProductCode(code, inputs) {
  const pad = (val, len) => String(val || '').padStart(len, '0');

  const length = pad(inputs.length, 4);
  const width = pad(inputs.width, 4);
  const height = pad(inputs.height, 4);
  const wallThickness = code.startsWith('CS') ? '0000' : pad(inputs.wallThickness, 4);
  const steelGrade = inputs.steelGrade || '';
const density = code.startsWith('CS')
  ? inputs.roofSlabDensity || ''
  : inputs.steelDensity || inputs.chamberDensity || '';
    
  const spec = inputs.surfaceFinish || '';

  return `${code} ${length}${width}${height}_${wallThickness}_${steelGrade}_${density} ${spec}`;
}

// Global helper for safe parsing
const safe = (val) => parseFloat(val || 0);
const safeInt = (val) => parseInt(val || '0', 10);

const getUnitPriceFromAdditionalData = (label) => {
  for (const category in additionalItemsData) {
    const match = additionalItemsData[category].find(item => item.item === label);
    if (match) return parseFloat(match.materialCost || 0);
  }
  return 0;
};
  

const handleEstimate = () => {
  if (!additionalItemsData || Object.keys(additionalItemsData).length === 0) {
    console.error('Additional items data not loaded.');
    return;
  }

  let sourceBreakdowns = [];

  let concreteSubtotal = 0;
  let concreteUnitTotal = 0;
  let steelSubtotal = 0;
  let steelUnitTotal = 0;
  let labourSubtotal = 0;
  let labourUnitTotal = 0;
  let additionalSubtotal = 0;
  let additionalUnitTotal = 0;
  let grandTotal = 0;

if (pendingImport && pendingImport.length > 0) {
  // ❗ Only keep non-Column rows
  sourceBreakdowns = pendingImport.filter(p => !p.name?.startsWith('C'));
setPendingImport(null);
}

  else {
    Object.entries(subProductInputs).forEach(([productName, inputs]) => {
      const quantity = safe(inputs.quantity || 1);
      const length = safe(inputs.length);
      const width = safe(inputs.width);
      const height = safe(inputs.height);

      const isPlaceholderCT = productName.startsWith('CT-') && !inputs.crossSection;

        if (
          !quantity ||
          !length ||
          !width ||
          !height ||
          isPlaceholderCT
        ) {
          return;
        }


      let concreteVolume = length * width * height;
      let antiVol = 0;
      let concreteVolumeM3 = 0;

      let concreteCost = 0;
      let steelKg = 0;
      let steelCost = 0;
      let labourHrs = 0;
      let labourCost = 0;

      if (productName.startsWith('CT-')) {
        const ctData = standardTroughData.find(t => {
          const selectedCross = inputs.crossSection?.split('x') || [];
          const [w, h] = selectedCross.map(Number);
          const len = parseFloat(inputs.lengthOption);
          return t.Width === w / 1000 && t.Height === h / 1000 && t.Length === len;
        });

  if (ctData) {
    const concretePerUnit = parseFloat(ctData['Concrete Volume'] || 0);
    const steelPerM3 = parseFloat(ctData['Steel (kg/m³)'] || 0);
    const steelRate = 0.86;

    concreteVolume = concretePerUnit * quantity;
    concreteVolumeM3 = concreteVolume;
    concreteCost = concreteVolumeM3 * 137.21;

    steelKg = concreteVolumeM3 * steelPerM3;
    steelCost = steelKg * steelRate;

const labourPerUnit = safe(inputs.labourHours) || parseFloat(ctData['Labour Hrs/Unit'] || 0);
labourHrs = labourPerUnit * quantity;
labourCost = labourHrs * 70.11;


    concreteSubtotal += concreteCost;
    concreteUnitTotal += concreteVolumeM3;
    steelSubtotal += steelCost;
    steelUnitTotal += steelKg;
    labourSubtotal += labourCost;
    labourUnitTotal += labourHrs;

    const baseCode = productName.split('-')[0];
    const productCode = buildProductCode(baseCode, { ...inputs, steelDensity: inputs.steelDensity });

    const uniqueItems = subProductInputs[productName]?.uniqueItems || [];
    
    sourceBreakdowns.push({
      name: baseCode,
      productCode,
      quantity,
      concrete: {
        volume: concreteVolumeM3.toFixed(2),
    cost: parseFloat(concreteCost.toFixed(2))
      },
      steel: {
        kg: steelKg.toFixed(2),
        cost: parseFloat(steelCost.toFixed(2))
      },
      labour: {
        hours: labourHrs.toFixed(2),
        cost: parseFloat(labourCost.toFixed(2))
      },
      uniqueItems, // ✅ Ensures they get mapped in computedBreakdowns
      total: concreteCost
        });

          return;
        }
      } else if (productName.startsWith('CH')) {
        const wall = safe(inputs.wallThickness);
        const base = safe(inputs.baseThickness);
        const extPlan = (length + wall * 2) * (width + wall * 2);
        const intPlan = length * width;
        const extHeight = height + base;
        const chamberVol = (extPlan * extHeight) - (intPlan * height);

        if (inputs.antiFlotation === 'Yes') {
          const toeLengthM = safe(inputs.toeLength);
          const toeLength = toeLengthM * 1000;
          const toePlan = (length + wall * 2);
          antiVol = ((toePlan * toeLength * base) * 2);
        }

        concreteVolume = (chamberVol + antiVol) * quantity;
        inputs.antiFlotationVolume = antiVol * quantity;
        
} else if (productName.startsWith('C')) {
  const baseHeight = safe(inputs.baseHeight); // in mm
  const columnHeight = safe(inputs.height);   // in mm
  const width = safe(inputs.width);           // in mm
  const length = safe(inputs.length);         // in mm
  const quantity = safe(inputs.quantity || 1);
  const paddingM3 = 0.14; // fixed additive in m³

  const effectiveHeight = columnHeight - baseHeight; // mm
  const volumeMm3 = effectiveHeight * width * length;
  
 const volumePerUnitM3 = (volumeMm3 / 1_000_000_000) + paddingM3;
concreteVolumeM3 = volumePerUnitM3 * quantity;
concreteCost = concreteVolumeM3 * 137.21;
        
  // Optional: for consistency in mm³
  concreteVolume = (concreteVolumeM3 * 1_000_000_000) * quantity;

   // Steel
let steelDensity = safe(inputs.steelDensity);
if (!steelDensity || steelDensity <= 0) steelDensity = 180;
const steelRate = 0.86;
steelKg = concreteVolumeM3 * steelDensity;
steelCost = steelKg * steelRate;

// Labour
const labourPerUnit = safe(inputs.labourHours);
labourHrs = labourPerUnit * quantity;
labourCost = labourHrs * 70.11;

  // Accumulate totals
  concreteSubtotal += concreteCost;
  concreteUnitTotal += concreteVolumeM3;
  steelSubtotal += steelCost;
  steelUnitTotal += steelKg;
  labourSubtotal += labourCost;
  labourUnitTotal += labourHrs;

  // Final breakdown push
  const baseCode = productName.split('-')[0];
  const productCode = buildProductCode(baseCode, { ...inputs });

  sourceBreakdowns.push({
    name: baseCode,
    productCode,
    quantity,
    concrete: {
      volume: concreteVolumeM3.toFixed(2),
      cost: parseFloat(concreteCost.toFixed(2))
    },
    steel: {
      kg: steelKg.toFixed(2),
      cost: parseFloat(steelCost.toFixed(2))
    },
    labour: {
      hours: labourHrs.toFixed(2),
      cost: parseFloat(labourCost.toFixed(2))
    },
    uniqueItems: inputs.uniqueItems || []
  });

        

        console.log("🧪 Column Steel Debug", {
  productName,
  steelDensity,
  concreteVolumeM3,
  steelKg,
  steelCost
});
return; // ✅ prevents falling into fallback logic
       
      } else if (productName.startsWith('CS')) {
        const slabLength = safe(inputs.length);
        const slabWidth = safe(inputs.width);
        const openingLength = safe(inputs.openingLength);
        const openingWidth = safe(inputs.openingWidth);
        const outerVol = slabLength * slabWidth * height;
        const openingVol = openingLength * openingWidth * height;
        concreteVolume = (outerVol - openingVol) * quantity;
      } else {
        concreteVolume = concreteVolume * quantity;
      }

      concreteVolumeM3 = concreteVolume / 1_000_000_000;
      steelKg = concreteVolumeM3 * 120;
      labourHrs = safe(inputs.labourHours);

      concreteCost = concreteVolumeM3 * 137.21;
      steelCost = steelKg * 0.86;
      labourCost = labourHrs * 70.11;

      concreteSubtotal += concreteCost;
      concreteUnitTotal += concreteVolumeM3;
      steelSubtotal += steelCost;
      steelUnitTotal += steelKg;
      labourSubtotal += labourCost;
      labourUnitTotal += labourHrs;

      const baseCode = productName.split('-')[0];
      const productCode = buildProductCode(baseCode, { ...inputs, steelDensity: inputs.steelDensity });

      const additionalItems = inputs.additionalItems || {};
      const additionalMapped = {};

      console.log("🧪 Product Input to Breakdown:", { productName, inputs });

      sourceBreakdowns.push({
        name: baseCode,
        productCode,
        quantity,
        density: inputs.steelDensity || inputs.chamberDensity || undefined,
        concrete: {
          volume: concreteVolumeM3.toFixed(2),
          cost: parseFloat(concreteCost.toFixed(2)),
          antiVol: (inputs.antiFlotation === 'Yes' && antiVol > 0)
            ? (antiVol / 1_000_000_000 * quantity).toFixed(2)
            : undefined
        },
        steel: {
          kg: steelKg.toFixed(2),
          cost: parseFloat(steelCost.toFixed(2))
        },
        labour: {
          hours: labourHrs.toFixed(2),
          cost: parseFloat(labourCost.toFixed(2))
        },
        uniqueItems: inputs.uniqueItems || []
      });
    });
  }

  // Rounding
  concreteSubtotal = parseFloat(concreteSubtotal.toFixed(2));
  concreteUnitTotal = parseFloat(concreteUnitTotal.toFixed(2));
  steelSubtotal = parseFloat(steelSubtotal.toFixed(2));
  steelUnitTotal = parseFloat(steelUnitTotal.toFixed(2));
  labourSubtotal = parseFloat(labourSubtotal.toFixed(2));
  labourUnitTotal = parseFloat(labourUnitTotal.toFixed(2));
  additionalSubtotal = parseFloat(additionalSubtotal.toFixed(2));
  additionalUnitTotal = parseFloat(additionalUnitTotal.toFixed(2));

  // Design
  const designFields = [
    'proposalHours', 'designMeetingsHours', 'structuralDesignHours', 'revitModelHours',
    'approvalCommentsHours', 'detailingJointsHours', 'detailingFloorsHours', 'detailingScreedHours',
    'gasHours', 'productionUnitsHours', 'productionCheckingHours', 'siteQueriesHours', 'asBuiltsHours'
  ];
  const totalDesignHours = designFields.reduce((sum, key) => sum + safe(formData[key]), 0);
  const designRate = 61.12;
  const designCost = totalDesignHours * designRate;

  // Transport and Installation
  const transportRate = safe(formData.transportRate);
  const transportQty = safe(formData.transportQuantity);
  const transportCost = transportRate * transportQty;

  const installationRate = 500;
  const installationDays = safe(formData.installationDays);
  const installationCost = installationDays * installationRate;

  // Final line-item subtotals
  const computedBreakdowns = sourceBreakdowns.map(product => {
    const quantity = safe(product.quantity);
    const concreteCost = safe(product.concrete?.cost);
    const steelCost = safe(product.steel?.cost);
    const labourCost = safe(product.labour?.cost);

    let additionalCost = 0;
    let additionalItems = [];

    const uniqueList = product.uniqueItems || subProductInputs[product.name]?.uniqueItems || [];
    uniqueList.forEach(entry => {
      if (entry && entry.item && entry.qty > 0) {
        const unitQty = quantity * entry.qty;
        const unitPrice = getUnitPriceFromAdditionalData(entry.item);
        const cost = unitQty * unitPrice;
        additionalItems.push({ label: entry.item, qty: unitQty, cost });
        additionalCost += cost;
        additionalUnitTotal += unitQty;
      }
    });

    console.log("➕ Additional Items:", additionalItems);

    let subtotal = concreteCost + steelCost + labourCost + additionalCost;
    subtotal *= 1 + safe(formData.wasteMargin) / 100;
    subtotal *= 1 + safe(formData.groupCost) / 100;
    subtotal *= 1 + safe(formData.margin) / 100;

    grandTotal += subtotal;
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

  // Final summary setState
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
  setShouldResetCT(true);
};




  


const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

useEffect(() => {
  const ct = subProductInputs['CT'];
  if (!ct) return;

  // ✅ Skip if Troughs is not the selected top-level product
  if (topLevelProduct !== 'Troughs') return;

  const crossSection = ct.crossSection;
  const lengthOption = ct.lengthOption;
  const quantity = parseInt(ct.quantity);

  // Only save if all required fields are filled
  if (!crossSection || !lengthOption || !quantity || quantity <= 0) return;

  const variantKey = `CT-${crossSection}-${lengthOption}`;

  // Prevent overwriting an existing variant
  if (subProductInputs[variantKey]) return;

  // Clone CT config into a new variant and clear CT tab
  setSubProductInputs(prev => ({
    ...prev,
    [variantKey]: { ...ct },
    CT: {}  // Reset the CT tab for the next one
  }));
setSelectedProduct('CT');  // Auto-return to CT tab

}, [subProductInputs['CT']]);

  
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
            onChange={(e) => {
  const newProductType = e.target.value;
  setTopLevelProduct(newProductType);
  setConfiguredProductTypes(prev => new Set([...prev, newProductType]));
}}

            className="w-full border p-2 rounded text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Structure</option>
            <option value="Troughs">Troughs</option>
            <option value="Chambers">Chambers</option>
            <option value="Walls">Walls</option>
            <option value="Columns">Columns</option>
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
                {/* ⛔️ Hide quantity input for Cable Troughs (CT) */}
                {code !== 'CT' && (
                  <input
                    type="number"
                    min="0"
                    value={subProductInputs[code]?.quantity || ""}
                    onChange={(e) => handleQuantityChange(code, e.target.value)}
                    className="w-16 text-xs border rounded-full px-2 py-1 text-center"
                    placeholder="Qty"
                  />
                )}
                               
{/* Show Configure button ONLY for base CT */}
      {code === 'CT' && (
        <button
          onClick={() => {
            setShouldResetCT(true);  // trigger reset
            setSelectedProduct('CT');
          }}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
          title="Configure CT variants"
        >
          🔧 Configure
        </button>
      )}
      
              </div>
            </div>
          ))}
        </div>
      </div>

{selectedSubProducts.length > 0 && (
  <>
    {topLevelProduct === 'Chambers' && (
      <div className="mb-4 text-sm text-blue-800 bg-blue-50 border border-blue-300 rounded p-2 shadow-sm">
        💡 Tip: You may want to add a <strong>Cover Slab</strong> to your chamber configuration.
      </div>
    )}

    <div className="mt-6">
<div className="flex gap-2 border-b pb-2 mb-4 flex-wrap">
  {selectedSubProducts.map(({ code }) => {
    const isCT = code.startsWith('CT');
    return (
      <div key={code} className="relative">
        <button
          onClick={() => setSelectedProduct(code)}
          className={`px-4 py-1 pr-6 rounded text-sm font-medium transition border relative
            ${selectedProduct === code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}
            ${isCT ? 'border-blue-400' : 'border-gray-300'}
            ${showCTPulse && code === 'CT' ? 'animate-pulse ring-2 ring-blue-300' : ''}`
          }
        >
          <span title={code === 'CT' ? 'Configure CT variants from here' : ''}>
    {code === 'CT' ? '➕ New CT' : code}
  </span>
        </button>


        {/* ✅ Inserted Remove Button */}
       <button
  onClick={() => {
    setSubProductInputs(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
    setProductBreakdowns(prev =>
      prev.filter(item => item.name !== code && item.productCode !== code)
    );

    if (selectedProduct === code) {
      setSelectedProduct('');
    }
  }}
  className="absolute top-[-6px] right-[-6px] bg-white border border-gray-300 text-xs w-4 h-4 rounded-full text-gray-700 hover:bg-red-100 hover:text-red-600"
  title="Remove"
>
  ×
</button>


        
        {isCT && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-b" />
        )}
      </div>
    );
  })}
</div>

<div className="p-4 border rounded bg-white">
  <h3 className="text-md font-semibold text-blue-700 mb-2">
    Configure: {selectedProduct}
  </h3>

  {topLevelProduct === 'Troughs' && selectedProduct?.startsWith('CT') && (
    <div className="border-2 border-gray-300 shadow-md rounded-lg p-4 bg-white">

     
      <h4 className="text-sm font-bold uppercase text-gray-700 mb-4 tracking-wide border-b border-gray-400 pb-1">
        Select Cable Trough Type
        <span title="Quick-fill from standard CT designs" className="ml-2 text-blue-500 cursor-help">ⓘ</span>
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Cross-Section Selector */}
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-gray-600">Cross Section (W × H)</label>

          <select
  key={`ct-cross-section-${selectedProduct === 'CT' ? (subProductInputs['CT']?.crossSection || 'reset') : 'variant'}`}
  value={subProductInputs[selectedProduct]?.crossSection || ''}

         
onChange={(e) => {
  const [width, height] = e.target.value.split('x').map(val => parseInt(val));
  const crossSection = e.target.value;
 
const key = 'CT';
handleSubInputChange(key, 'crossSection', crossSection);
handleSubInputChange(key, 'width', width);
handleSubInputChange(key, 'height', height);
handleSubInputChange(key, 'autoFilled', {
  ...(subProductInputs[key]?.autoFilled || {}),
  width: true,
  height: true
});

}}
            
            className="border p-2 rounded text-xs bg-white"
          >
            <option value="">Select Size</option>
            <option value="900x900">0.9m × 0.9m</option>
            <option value="900x600">0.9m × 0.6m</option>
            <option value="900x300">0.9m × 0.3m</option>
            <option value="750x750">0.75m × 0.75m</option>
            <option value="750x500">0.75m × 0.5m</option>
            <option value="750x300">0.75m × 0.3m</option>
            <option value="600x600">0.6m × 0.6m</option>
            <option value="600x300">0.6m × 0.3m</option>
            <option value="500x500">0.5m × 0.5m</option>
            <option value="450x400">0.45m × 0.4m</option>
            <option value="350x300">0.35m × 0.3m</option>
          </select>
        </div>

{/* Length Selector */}
<div className="flex flex-col">
  <label className="text-xs font-medium mb-1 text-gray-600">Available Length</label>
  <select
    value={subProductInputs[selectedProduct]?.lengthOption || ''}
    onChange={(e) => {
      const length = parseFloat(e.target.value);
      const lengthMm = length * 1000;
      const crossSection = subProductInputs[selectedProduct]?.crossSection;
      const width = parseInt(crossSection?.split('x')[0]);
      const height = parseInt(crossSection?.split('x')[1]);
      const widthM = width / 1000;
      const heightM = height / 1000;

      const match = standardTroughData.find(
        t => t.Width === widthM && t.Height === heightM && t.Length === length
      );

      const uniqueKey = `CT-${crossSection}-${length}`;
      setSelectedProduct(uniqueKey);

      // Assign core values
      handleSubInputChange(uniqueKey, 'productType', 'CT');
      handleSubInputChange(uniqueKey, 'crossSection', crossSection);
      handleSubInputChange(uniqueKey, 'lengthOption', e.target.value);
      handleSubInputChange(uniqueKey, 'length', lengthMm);

      // Mark CT placeholder tab as cleared
      setSubProductInputs(prev => {
        const next = { ...prev };
       next['CT'] = { ...next['CT'], wasCleared: true };
        return next;
      });

      if (match) {
        // Assign geometry
        handleSubInputChange(uniqueKey, 'width', width);
        handleSubInputChange(uniqueKey, 'height', height);

        // Assign additional values
        handleSubInputChange(uniqueKey, 'steelDensity', match['Steel (kg/m³)']);
        handleSubInputChange(uniqueKey, 'labourHours', match['Labour Hrs/Unit']);

        // ✅ Consolidated autoFilled update
        handleSubInputChange(uniqueKey, 'autoFilled', {
          ...(subProductInputs[uniqueKey]?.autoFilled || {}),
          length: true,
          width: true,
          height: true,
          steelDensity: true,
          labourHours: true
        });



                
                const additionalItems = [];
                if ((match['RD20 Wavy'] ?? 0) > 0) {
                  additionalItems.push({ item: 'RD20 Wavy', qty: match['RD20 Wavy'] });
                }
                if (match['Capstan 7.5A85'] && match['Capstan 7.5A85'] > 0) {
                  additionalItems.push({ item: 'Capstan 7.5A85', qty: match['Capstan 7.5A85'] });
                }
                if (match['Capstan 1.3A85'] && match['Capstan 1.3A85'] > 0) {
                  additionalItems.push({ item: 'Capstan 1.3A85', qty: match['Capstan 1.3A85'] });
                }
                if (additionalItems.length > 0) {
                  const enrichedItems = additionalItems.map(entry => {
                    let category = '';
                    if (entry.item.includes('Capstan') || entry.item.includes('RD20 Wavy')) {
                      category = 'Capstans and Lifters';
                    }
                    let item = entry.item;
                    if (item === 'RD20 Wavy') item = 'RD20 Wavy';
                    return { category, item, qty: entry.qty };
                  });
                  handleSubInputChange(uniqueKey, 'uniqueItems', enrichedItems);
                }
              }
            }}
            className="border p-2 rounded text-xs bg-white"
          >
            <option value="">Select Length</option>
            <option value="0.75">0.75m</option>
            <option value="1.5">1.5m</option>
            <option value="2.5">2.5m</option>     
          </select>
        </div>
        
{/* Quantity for selected CT configuration */}
<div className="flex flex-col">
  <label className="text-xs font-medium mb-1 text-gray-600">Quantity</label>
  <input
    type="number"
    min="1"
    className="border p-2 rounded text-xs w-[100px]"
    placeholder="1" 
    value={subProductInputs[selectedProduct]?.quantity || ''}
    onChange={(e) => handleSubInputChange(selectedProduct, 'quantity', parseInt(e.target.value))}
  />
</div>



        
      </div>
    </div>
  )}

<div className="mt-4"></div>


  <div className="space-y-6">
    {/* Inputs – Common */}
            <div className="border-2 border-gray-300 shadow-md rounded-lg p-4 bg-white">
          <h4 className="text-sm font-bold uppercase text-gray-700 mb-4 tracking-wide border-b border-gray-400 pb-1">
            Inputs – Common
          </h4>

{console.log('🔍 autoFilled debug', selectedProduct, subProductInputs[selectedProduct]?.autoFilled)}

              <div className="mb-4">
                                <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Concrete</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["length", "width", "height", "baseThickness", "wallThickness"].map((field) => {
                    const labelMap = {
                      length: "Length (mm)",
                      width: "Width (mm)",
                      height: "Height (mm)",
                      baseThickness: "Base Thickness (mm)",
                      wallThickness: "Wall Thickness (mm)",
                       };

          
                    return (
                      <div key={field} className="flex flex-col">
                        
<label className="text-xs font-medium mb-1 flex items-center gap-1">
  {labelMap[field]}
  {selectedProduct?.startsWith('CS') && (field === 'length' || field === 'width') && (
    <span
      title={`Auto-filled from Chamber ${field} + 2 × wall thickness`}
      className="cursor-help text-blue-500 text-xs"
    >
      ⓘ
    </span>
  )}
  {selectedProduct?.startsWith('CS') && (field === 'wallThickness' || field === 'baseThickness') && (
    <span
      title={`Auto-filled from Chamber ${field}`}
      className="cursor-help text-blue-500 text-xs"
    >
      ⓘ
    </span>
  )}
</label>

<input
  type="number"
  value={subProductInputs[selectedProduct]?.[field] || ''}
  onChange={(e) => handleSubInputChange(selectedProduct, field, e.target.value)}
  className={`border p-2 rounded text-xs ${
    subProductInputs[selectedProduct]?.autoFilled?.[field] ? 'bg-blue-50' : ''
  }`}
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
  {/* Steel Grade and Density in one column */}
  <div className="flex flex-col">
    <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Steel/Fibres</h5>
        <div className="flex gap-2 items-center">
      {/* Dropdown */}
      <select
        value={subProductInputs[selectedProduct]?.steelGrade || ''}
        onChange={(e) => handleSubInputChange(selectedProduct, 'steelGrade', e.target.value)}
        className="border p-2 rounded text-xs bg-white w-[100px]"
      >
        <option value="">Grade</option>
        <option value="B125">B125</option>
        <option value="C250">C250</option>
        <option value="D400">D400</option>
        <option value="E600">E600</option>
        <option value="Other">Other</option>
      </select>

      {/* Steel Density */}
      <input
        type="number"
        value={subProductInputs[selectedProduct]?.steelDensity || ''}
        onChange={(e) => handleSubInputChange(selectedProduct, 'steelDensity', e.target.value)}
        className={`border p-2 rounded text-xs w-[100px] ${subProductInputs[selectedProduct]?.autoFilled?.steelDensity ? 'bg-blue-50' : ''}`}
        placeholder="kg/m³"
      />
    </div>
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
                    className={`border p-2 rounded text-xs ${subProductInputs[selectedProduct]?.autoFilled?.labourHours ? 'bg-blue-50' : ''}`}

                  />
                </div>
    </div>

  {selectedProduct?.startsWith('C') && (
  <div className="mt-6">
    <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">
      Column Options
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Base Height (mm)</label>
        <input
          type="number"
          value={subProductInputs[selectedProduct]?.baseHeight || ''}
          onChange={(e) => handleSubInputChange(selectedProduct, 'baseHeight', e.target.value)}
          className="border p-2 rounded text-xs"
          placeholder="e.g. 200"
        />
      </div>
    </div>
  </div>
)}


{selectedProduct?.startsWith('CH') && (
  <div className="mt-6">
    <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">
      Chamber Options
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Anti Flotation</label>
        <select
          value={subProductInputs[selectedProduct]?.antiFlotation || ''}
          onChange={(e) => handleSubInputChange(selectedProduct, 'antiFlotation', e.target.value)}
          className="border p-2 rounded text-xs"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Toe Length (m)</label>
        <input
          type="text"
          value={subProductInputs[selectedProduct]?.toeLength || ''}
          onChange={(e) => handleSubInputChange(selectedProduct, 'toeLength', e.target.value)}
          className="border p-2 rounded text-xs"
          placeholder="Qty 2"
        />
      </div>
    </div>
  </div>
)}

{selectedProduct?.startsWith('CS') && (
  <div className="mt-6">
    <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">
      Cover Slab Options
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Opening Length */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Opening Length (mm)</label>
        <input
          type="number"
          value={subProductInputs[selectedProduct]?.openingLength || ''}
          onChange={(e) =>
            handleSubInputChange(selectedProduct, 'openingLength', e.target.value)
          }
          className="border p-2 rounded text-xs"
          placeholder="e.g. 600"
        />
      </div>

      {/* Opening Width */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Opening Width (mm)</label>
        <input
          type="number"
          value={subProductInputs[selectedProduct]?.openingWidth || ''}
          onChange={(e) =>
            handleSubInputChange(selectedProduct, 'openingWidth', e.target.value)
          }
          className="border p-2 rounded text-xs"
          placeholder="e.g. 600"
        />
      </div>

      {/* Roof Slab Density */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Roof Slab Density (kg/m³)</label>
        <input
          type="number"
          value={subProductInputs[selectedProduct]?.roofSlabDensity || ''}
          onChange={(e) =>
            handleSubInputChange(selectedProduct, 'roofSlabDensity', e.target.value)
          }
          className="border p-2 rounded text-xs"
          placeholder="e.g. 155"
        />
      </div>
    </div>
  </div>
)}

             
              </div>
            </div>
      
       


<div className="mt-4"></div>
    
    {/* Inputs - Unique */}
<div className="border-2 border-gray-300 shadow-md rounded-lg p-4 bg-white">
  <h4 className="text-sm font-bold uppercase text-gray-700 mb-4 tracking-wide border-b border-gray-400 pb-1">
    Inputs – Unique
  </h4>

          {(additionalItemsData && Object.keys(additionalItemsData).length > 0) ? (
            <>
              {(subProductInputs[selectedProduct]?.uniqueItems || [{}]).map((entry, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-3 bg-white rounded-lg shadow-sm">
                  {/* Category Selector */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium mb-1 text-gray-600">Category</label>
                    <select
                      className="border rounded p-2 text-xs bg-blue-50"
                      value={entry.category || ''}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        const defaultItem = additionalItemsData[newCategory]?.[0]?.item || '';
                        const updated = [...(subProductInputs[selectedProduct]?.uniqueItems || [])];
                        updated[idx] = { category: newCategory, item: defaultItem, qty: 0 };
                        handleSubInputChange(selectedProduct, 'uniqueItems', updated);
                      }}
                    >
                      <option value="">Select Category</option>
                      {Object.keys(additionalItemsData).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Item Selector */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium mb-1 text-gray-600">Item</label>
                    <select
                      className="border rounded p-2 text-xs"
                      value={entry.item || ''}
                      onChange={(e) => {
                        const updated = [...(subProductInputs[selectedProduct]?.uniqueItems || [])];
                        updated[idx] = { ...updated[idx], item: e.target.value };
                        handleSubInputChange(selectedProduct, 'uniqueItems', updated);
                      }}
                      disabled={!entry.category}
                    >
                      <option value="">Select Item</option>
                      {(additionalItemsData[entry.category] || []).map(i => (
                        <option key={i.item} value={i.item}>{i.item}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div className="flex flex-col">
                            <label className="text-xs font-medium mb-1 text-gray-600">
  Quantity
  <span
    title="Quantities per unit"
    className="ml-1 cursor-help text-blue-500"
  >
    ⓘ
  </span> 
</label>

                            <input
                      type="number"
                      min="0"
                      value={entry.qty || ''}
                      onChange={(e) => {
                        const updated = [...(subProductInputs[selectedProduct]?.uniqueItems || [])];
                        updated[idx] = { ...updated[idx], qty: parseFloat(e.target.value) || 0 };
                        handleSubInputChange(selectedProduct, 'uniqueItems', updated);
                      }}
                      className="border rounded p-2 text-xs"
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>
              ))}

              {/* ➕ Add New Line Button */}
              <button
                type="button"
                onClick={() => {
                  const current = subProductInputs[selectedProduct]?.uniqueItems || [];
                  handleSubInputChange(selectedProduct, 'uniqueItems', [...current, {}]);
                }}
                className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow-sm"
              >
                ➕ Add Item
              </button>
            </>
          ) : (
            <div className="text-xs text-gray-500 italic">Loading additional items...</div>
          )}
        </div>
 </div>
 </div>
    
  </> 
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
        const { quantity, concrete, steel, labour, additionalItems, total, name, productCode } = product;
        const concreteVol = parseFloat(concrete?.volume || 0);
        const antiVol = product.concrete?.antiVol !== undefined ? safe(product.concrete.antiVol) : undefined;

        const steelKg = parseFloat(steel?.kg || 0);
        const labourHrs = parseFloat(labour?.hours || 0);
        const concreteCost = product.concreteCost || 0;
        const steelCost = product.steelCost || 0;
        const labourCost = product.labourCost || 0;

        return (
          <tr key={idx} className="border-b">

<td className="border p-2 font-medium text-sm"> 
  {product.productCode ? (
    <>
      <div className="text-blue-800 font-semibold text-xs">{product.productCode}</div>
      <div className="text-gray-500 text-[10px] italic">{product.name}</div>
    </>
  ) : (
    product.name
  )}
</td>
            
            <td className="border p-2 text-center">{quantity}</td>
<td className="border p-2 text-center">
  {concreteVol.toFixed(2)} m³

  <div className="text-gray-500 text-[10px]">€{concreteCost.toFixed(2)}</div>

  {antiVol && antiVol > 0 && (
    <div className="text-gray-400 text-[10px] italic">
      (incl. {antiVol.toFixed(2)} m³ anti-flot.)
    </div>
  )}
</td>

            <td className="border p-2 text-center">
              {steelKg.toFixed(2)}
              <div className="text-gray-500 text-[10px]">€{steelCost.toFixed(2)}</div>
            </td>
            <td className="border p-2 text-center">
              {labourHrs.toFixed(2)}
              <div className="text-gray-500 text-[10px]">€{labourCost.toFixed(2)}</div>
            </td>
            
<td className="border p-2 align-top text-xs">
  {additionalItems?.length > 0 ? (
    <ul className="space-y-1">
      {additionalItems.map((item, i) => (
        <li key={i} className="mb-1">
          <div
  className="font-semibold text-gray-800 truncate"
  title={item.label}
>
  {item.label.length > 20 ? item.label.slice(0, 20) + '…' : item.label}
</div>

<div className="text-gray-500 text-[11px]">
  {Math.round(item.qty)}x @ €{(item.cost / item.qty).toFixed(2)} ea
</div>

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
        <span>{breakdown.subtotals?.concrete?.units?.toFixed(2)} m³</span>
        <span className="block text-gray-500 text-[10px]">
          €{breakdown.subtotals?.concrete?.cost?.toFixed(2)}
        </span>
      </td>

        <td className="border p-2 text-center">
  {breakdown.subtotals?.steel?.units?.toFixed(2)} kg
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
