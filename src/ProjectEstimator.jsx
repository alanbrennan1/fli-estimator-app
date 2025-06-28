import React, { useState, useEffect } from 'react';  
import './index.css';
import { saveQuoteToSupabase } from './saveQuoteToSupabase';
import PasswordGate from './passwordGate'; //
import OpenQuoteModal from './OpenQuoteModal'; 
import { checkProjectExists, fetchQuoteByProjectNumber } from './quoteHelpers'; 


const productOptions = { 
 Troughs: [
    { name: "Cable Trough", code: "CT" },
    { name: "Cable Trough Mitre", code: "CTS" },
    { name: "Cable Trough 45°", code: "CT45" },
    { name: "Cable Trough Tee", code: "CTT" },
  ],
  Chambers: [  // ✅ Updatedc
    { name: "Chamber", code: "CH" },
    { name: "Cover Slab", code: "CS" },
    { name: "Risers", code: "RR" },
  ],
  Columns: [
    { name: "Column", code: "C" },
  ],
 "Slot Drain": [  // ✅ New Entry
    { name: "Slot Drain - Standard", code: "SD" },
    { name: "Slot Drain - Mitre", code: "SDM" },
    { name: "Slot Drain - Rodding Point", code: "SDR" },
  ],
 Bespoke: [
  { name: "Bespoke", code: "BS" }, // ✅ new sub-product
],
Walls: [
  { name: "Wall", code: "W" },
],
Beams: [
  { name: "Beam", code: "B" },
],
};

const chamberChecklistOptions = [
  { label: "Communication", value: "CV" },
  { label: "Fibre Vault", value: "FV" },
  { label: "Drawpit", value: "DP" },
  { label: "LV Chambers", value: "LV" },
  { label: "MV Chambers", value: "MV" },
];

const bespokeChecklistOptions = [
  { label: "Bespoke/Special", value: "SP" },
  { label: "Bespoke Culverts", value: "CU" },
  { label: "Bespoke Precast Plinths", value: "PL" },
  { label: "Bund", value: "BU" },
  { label: "Equipment Pads", value: "EP" },
  { label: "Foundation Bases", value: "FB" },
  { label: "Retaining Walls", value: "RW" },
  { label: "Security Barriers", value: "SB" }
];

const wallChecklistOptions = [
  { label: "Baffle Walls", value: "BFW" },
  { label: "Blast Walls", value: "BLW" },
  { label: "Fire Walls", value: "FW" },
  { label: "Bund Walls", value: "BW" },
  { label: "External Wall", value: "EX" },
  { label: "External Wall - Corner", value: "EXC" },
  { label: "External Wall - Tee", value: "EXT" },
  { label: "Internal Wall", value: "IN" }
];


function AccordionSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen); // initialize from prop

  // 🧠 Sync defaultOpen to force re-opening accordions if needed
  useEffect(() => {
    if (defaultOpen) setIsOpen(true);
  }, [defaultOpen]);

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




// 🔐 Top-level wrapper with access control
export default function ProjectEstimatorWrapper() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const allowed = localStorage.getItem('fli_estimator_access') === 'true';
    setAuthorized(allowed);
  }, []);

  return authorized ? (
    <ProjectEstimator />
  ) : (
    <PasswordGate onAccess={() => setAuthorized(true)} />
  );
}
 

function ProjectEstimator() {

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
    projectNumber: '', 
    projectName: '',
    installationDays: '',
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
    margin: 10,
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

 const [pricePerTonne, setPricePerTonne] = useState(0);
 const [transportQty, setTransportQty] = useState(0);
 const [installationDays, setInstallationDays] = useState(0);
 const [productCodes, setProductCodes] = useState([]);
 const [forceOpenAccordions, setForceOpenAccordions] = useState(false);
 const [isLoadingOpportunity, setIsLoadingOpportunity] = useState(false);


 const transportService = breakdown?.services?.find(s => s.label === 'Transport');
 const transportCost = parseFloat(transportService?.value || 0);

 const profitMargin = parseFloat(formData.margin || 10);
 const groupCostRate = parseFloat(formData.groupCost || 2.5);

 const transportProfit = (transportCost * profitMargin) / 100;
 const transportGroupCost = ((transportCost + transportProfit) * groupCostRate) / 100;
 const transportGross = transportCost + transportProfit + transportGroupCost;

 const designService = breakdown?.services?.find(s => s.label === 'Design');
 const designCost = parseFloat(designService?.value || 0);

 const designProfit = (designCost * profitMargin) / 100;
 const designGroupCost = ((designCost + designProfit) * groupCostRate) / 100;
 const designGross = designCost + designProfit + designGroupCost;

 const installationService = breakdown?.services?.find(s => s.label === 'Installation');
 const installationCost = parseFloat(installationService?.value || 0);
 
 const installationProfit = (installationCost * profitMargin) / 100;
 const installationGroupCost = ((installationCost + installationProfit) * groupCostRate) / 100;
 const installationGross = installationCost + installationProfit + installationGroupCost;

// Sum only Transport, Design, Installation for now
const totalNet = transportCost + designCost + installationCost;
const totalProfit = transportProfit + designProfit + installationProfit;
const totalGroupCost = transportGroupCost + designGroupCost + installationGroupCost;
const totalGross = totalNet + totalProfit + totalGroupCost;

 // 🧱 BoQ Subtotals
const concreteCost = breakdown?.subtotals?.concrete?.cost || 0;
const steelCost = breakdown?.subtotals?.steel?.cost || 0;
const labourCost = breakdown?.subtotals?.labour?.cost || 0;
const additionalItemsCost = breakdown?.subtotals?.additional?.cost || 0;

// 🧮 Waste % from form (default to 0)
const wasteMargin = parseFloat(formData?.wasteMargin || 0);

// 🧠 Apply waste only to concrete + steel + additional items
const materialCost = concreteCost + steelCost + additionalItemsCost;
const wasteAmount = (materialCost * wasteMargin) / 100;

// 💰 Manufacturing Net = all costs + waste
const manufacturingNet = concreteCost + steelCost + labourCost + additionalItemsCost + wasteAmount;

// 💰 Profit = manufacturingNet × margin%
const manufacturingProfit = (manufacturingNet * profitMargin) / 100;

// 💸 Group Cost = (Net + Profit) × groupCost%
const manufacturingGroupCost = ((manufacturingNet + manufacturingProfit) * groupCostRate) / 100;

// 🧾 Gross = Net + Profit + Group Cost
const manufacturingGross = manufacturingNet + manufacturingProfit + manufacturingGroupCost;


useEffect(() => {
  const totalConcreteTonnes = (breakdown?.subtotals?.concrete?.units || 0) * 2.6;

  if (totalConcreteTonnes > 0) {
    const newPricePerTonne = manufacturingGross / totalConcreteTonnes;
    setPricePerTonne(parseFloat(newPricePerTonne.toFixed(2)));
  } else {
    setPricePerTonne(0);
  }
}, [breakdown, manufacturingGross]);


 

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
  const chamberKeys = Object.keys(subProductInputs).filter(k => k.startsWith('CH-'));
  const coverSlabKeys = Object.keys(subProductInputs).filter(k => k.startsWith('CS-'));

  chamberKeys.forEach((chKey) => {
    const index = chKey.split('-')[1]; // e.g. '1'
    const csKey = `CS-${index}`;

    if (coverSlabKeys.includes(csKey)) {
      const chamber = subProductInputs[chKey];
      const coverSlab = subProductInputs[csKey];

      const chamberLength = parseFloat(chamber.length || 0);
      const chamberWidth = parseFloat(chamber.width || 0);
      const wallThickness = parseFloat(chamber.wallThickness || 0);
      const baseThickness = parseFloat(chamber.baseThickness || 0);

      const calculatedLength = chamberLength + 2 * wallThickness;
      const calculatedWidth = chamberWidth + 2 * wallThickness;

      setSubProductInputs(prev => ({
        ...prev,
        [csKey]: {
          ...prev[csKey],
          length: parseFloat(calculatedLength.toFixed(0)),
          width: parseFloat(calculatedWidth.toFixed(0)),
          wallThickness: wallThickness.toFixed(0),
          baseThickness: baseThickness.toFixed(0),
        }
      }));
    }
  });
}, [subProductInputs]);


 
const selectedSubProducts = Object.entries(subProductInputs)
  .filter(([key, val]) => {
    const hasQty = parseInt(val?.quantity) > 0;
    const isCT = key.startsWith('CT') && (key === 'CT' || key.startsWith('CT-'));
    const isIndexed = /^[A-Z]+-\d+$/.test(key); // e.g., CH-1

    // Get base (e.g., CH) and check if other CH-1, CH-2 exist
    const base = key.split('-')[0];
    const otherKeys = Object.keys(subProductInputs).filter(k =>
      k.startsWith(`${base}-`)
    );
   const isBaseWithTabs = key === base && otherKeys.length > 0;
   const wasCleared = val?.wasCleared === true;

   if (key === 'CT' && wasCleared && Object.keys(subProductInputs).some(k => k.startsWith('CT-'))) {
     return false; // hide CT if it was cleared
   }

    return !isBaseWithTabs && (isCT || isIndexed || hasQty);
  })
  .map(([key]) => ({ code: key, name: key }));


  
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
  const qty = parseInt(value);
  const validQty = isNaN(qty) || qty <= 0 ? 0 : qty;

  setSubProductInputs(prev => {
    const updated = { ...prev };

    // 1. Always store the latest quantity on the base key (for display/control)
    updated[code] = {
      ...updated[code],
      quantity: validQty
    };

    // 2. Track existing tabs
    const existingKeys = Object.keys(prev).filter(k => k.startsWith(`${code}-`));

    // 3. Remove extra tabs if reducing quantity
    existingKeys.forEach(k => {
      const suffix = parseInt(k.split('-')[1]);
      if (suffix > validQty) {
        delete updated[k];
      }
    });

    // 4. Add new tabs if increasing quantity
    for (let i = 1; i <= validQty; i++) {
      const tabKey = `${code}-${i}`;
      if (!updated[tabKey]) {
        updated[tabKey] = { quantity: 1 }; // Empty new tab
      }
    }

    return updated;
  });

  if (validQty > 0) {
    setSelectedProduct(`${code}-1`);
  }
};


const handleSubInputChange = (productName, field, value) => {
  setSubProductInputs(prev => {
    const updatedInputs = {
      ...prev[productName],
      [field]: value
    };

    // ✅ Auto-calculate toe volume AND MKK Cone if height changes
    if (field === 'height') {
      const h = parseInt(value);
      let toeVol = '';

      if (h > 0 && h <= 2000) toeVol = 0.126;
      else if (h > 2000 && h <= 3500) toeVol = 0.063;
      else if (h > 3500 && h <= 5000) toeVol = 0.0975;
      else if (h > 5000 && h <= 7000) toeVol = 0.1365;
      else if (h > 7000 && h <= 9000) toeVol = 0.1755;

      updatedInputs.stabilityToeVolume = toeVol;

      // 👇 Auto-update MKK Cone if MKK is already selected
      const selection = updatedInputs.mkkSelection;
      if (selection === 'Yes' && h > 0) {
        const coneQty = Math.ceil(h / 750) * 2;
        let updatedItems = updatedInputs.uniqueItems || [];
        const mkkIndex = updatedItems.findIndex(
          (entry) => entry.category === 'Fixings' && entry.item === 'MKK Cone'
        );
        const mkkEntry = {
          category: 'Fixings',
          item: 'MKK Cone',
          qty: coneQty,
          autoFilled: true
        };
        if (mkkIndex >= 0) {
          updatedItems[mkkIndex] = mkkEntry;
        } else {
          updatedItems.push(mkkEntry);
        }
        updatedInputs.uniqueItems = updatedItems;
      }
    }

    // ✅ Auto-add/remove MKK Cone if MKK Selection changes
    if (field === 'mkkSelection') {
      const selection = value;
      const height = safe(updatedInputs.height);
      let updatedItems = updatedInputs.uniqueItems || [];
      const mkkIndex = updatedItems.findIndex(
        (entry) => entry.category === 'Fixings' && entry.item === 'MKK Cone'
      );

      if (selection === 'Yes' && height > 0) {
        const coneQty = Math.ceil(height / 750) * 2;
        const mkkEntry = {
          category: 'Fixings',
          item: 'MKK Cone',
          qty: coneQty,
          autoFilled: true
        };
        if (mkkIndex >= 0) {
          updatedItems[mkkIndex] = mkkEntry;
        } else {
          updatedItems.push(mkkEntry);
        }
      } else {
        // Remove MKK Cone
        updatedItems = updatedItems.filter(
          (entry) => !(entry.category === 'Fixings' && entry.item === 'MKK Cone')
        );
      }

      updatedInputs.uniqueItems = updatedItems;
    }


       // ✅ Auto-add Capstans for Walls based on concrete tonnage
   if (
  ['length', 'width', 'height'].includes(field) &&
  productName.startsWith('W')
) {
  const length = safe(field === 'length' ? value : updatedInputs.length);
  const width = safe(field === 'width' ? value : updatedInputs.width);
  const height = safe(field === 'height' ? value : updatedInputs.height);

  if (length && width && height) {
    const volumeM3 = (length * width * height) / 1_000_000_000;
    const concreteTonnes = volumeM3 * 2.6;
    updatedInputs.autoConcreteTonnes = concreteTonnes.toFixed(2); // Optional display only

    let capstanEntry = null;
    if (concreteTonnes > 0 && concreteTonnes <= 15) {
      capstanEntry = {
        category: 'Fixings',
        item: '7.5tn Capstan',
        qty: 4,
        autoFilled: true
      };
    } else if (concreteTonnes > 15 && concreteTonnes <= 30) {
      capstanEntry = {
        category: 'Fixings',
        item: '10tn Capstan',
        qty: 4,
        autoFilled: true
      };
    }

    let updatedItems = updatedInputs.uniqueItems || [];

    // Remove existing capstans
    updatedItems = updatedItems.filter(entry =>
      !(entry.category === 'Fixings' &&
        (entry.item === '7.5tn Capstan' || entry.item === '10tn Capstan'))
    );

    if (capstanEntry) {
      updatedItems.push(capstanEntry);
    }

    updatedInputs.uniqueItems = updatedItems;
  }
}



    return {
      ...prev,
      [productName]: updatedInputs
    };
  });
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
  // Normalize CT-x to CT
  const normalizedCode = /^CT-\d+$/.test(code) ? 'CT' : code;

  const pad = (val, len) => String(val || '').padStart(len, '0');
  const length = pad(inputs.length, 4);
  const width = pad(inputs.width, 4);
  const height = pad(inputs.height, 4);
  const wallThickness = normalizedCode.startsWith('CS') ? '0000' : pad(inputs.wallThickness, 4);
  const steelGrade = inputs.steelGrade || '';
  const density = normalizedCode.startsWith('CS')
    ? inputs.roofSlabDensity || ''
    : inputs.steelDensity || inputs.chamberDensity || '';

  const spec = inputs.surfaceFinish || '';

  // ✅ Unified suffix logic based on product type
  let suffix = '';

  if (normalizedCode === 'CH' && Array.isArray(inputs.chamberUseTags) && inputs.chamberUseTags.length > 0) {
    suffix = `_${inputs.chamberUseTags.join('-')}`;
  } else if (normalizedCode === 'W' && Array.isArray(inputs.wallUseTags) && inputs.wallUseTags.length > 0) {
    suffix = `_${inputs.wallUseTags.join('-')}`;
  } else if (normalizedCode === 'BS' && Array.isArray(inputs.bespokeUseTags) && inputs.bespokeUseTags.length > 0) {
    suffix = `_${inputs.bespokeUseTags.join('-')}`;
  }

  return `${normalizedCode} ${length}${width}${height}_${wallThickness}_${steelGrade}_${density} ${spec}${suffix}`;
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
  

const handleEstimate = async () => {
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
  console.log("🧪 RAW PRODUCT NAME:", JSON.stringify(productName));

     
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

    const productCode = buildProductCode(productName, { ...inputs }); // pass full key

    const uniqueItems = subProductInputs[productName]?.uniqueItems || [];
    
    sourceBreakdowns.push({
      name: productName,
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

} else if (/^C(-\d+)?$/.test(productName.trim())) {

  const baseHeight = 367; // hardcoded base height for Columns
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
    name: productName,
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
        
return; // ✅ prevents falling into fallback logic
      }
      
      
      else if (productName.startsWith('CH')) {
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

        // ✅ Convert volume to m³
        concreteVolumeM3 = concreteVolume / 1_000_000_000;
        
        // ✅ Steel Calculation (default fallback to 120 if not entered)
        let steelDensity = safe(inputs.chamberDensity);
        if (!steelDensity || steelDensity <= 0) steelDensity = 120;
        const steelRate = 0.86;
        steelKg = concreteVolumeM3 * steelDensity;
        steelCost = steelKg * steelRate;
        
        // ✅ Labour
        const labourPerUnit = safe(inputs.labourHours);
        labourHrs = labourPerUnit * quantity;
        labourCost = labourHrs * 70.11;
        
        // ✅ Add to totals
        concreteCost = concreteVolumeM3 * 137.21;
        concreteSubtotal += concreteCost;
        concreteUnitTotal += concreteVolumeM3;
        steelSubtotal += steelCost;
        steelUnitTotal += steelKg;
        labourSubtotal += labourCost;
        labourUnitTotal += labourHrs;
        
        const baseCode = productName.split('-')[0];
        const productCode = buildProductCode(baseCode, { ...inputs });

       // 🔍 🧪 Add this log here:
  console.log('🧪 CH steel check', {
    productName,
    steelDensityUsed: steelDensity,
    concreteVolumeM3,
    steelKg,
    steelCost
  });
        
        sourceBreakdowns.push({
          name: productName,
          productCode,
          quantity,
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
   return;
      } 


// ▶️ Wall logic
else if (/^W(-\d+)?$/.test(productName.trim())) {
  const height = safe(inputs.height);       // mm
  const length = safe(inputs.length);       // mm
  const breadth = safe(inputs.width); // ✅ use width as thickness for Walls
  const quantity = safe(inputs.quantity || 1);

  // 🧮 Concrete volume: wall core volume in mm³
  const coreVolumeMm3 = height * length * breadth;

  // 🧮 Stability toe volume (m³) based on height range
  let stabilityToeVolumePerUnitM3 = 0;
  if (height > 0 && height <= 2000) stabilityToeVolumePerUnitM3 = 0.126;
  else if (height <= 3500) stabilityToeVolumePerUnitM3 = 0.063;
  else if (height <= 5000) stabilityToeVolumePerUnitM3 = 0.0975;
  else if (height <= 7000) stabilityToeVolumePerUnitM3 = 0.1365;
  else if (height <= 9000) stabilityToeVolumePerUnitM3 = 0.1755;

  // 🧮 Total concrete volume in m³
  const coreVolumeM3 = (coreVolumeMm3 / 1_000_000_000) * quantity;
  const toeVolumeM3 = stabilityToeVolumePerUnitM3 * quantity;
  concreteVolumeM3 = coreVolumeM3 + toeVolumeM3;
  concreteCost = concreteVolumeM3 * 137.21;

  // 🧮 Steel
  let steelDensity = safe(inputs.steelDensity);
  if (!steelDensity || steelDensity <= 0) steelDensity = 120;
  steelKg = concreteVolumeM3 * steelDensity;
  steelCost = steelKg * 0.86;

  // 🧮 Labour
  const labourPerUnit = safe(inputs.labourHours);
  labourHrs = labourPerUnit * quantity;
  labourCost = labourHrs * 70.11;

  // 🧮 Totals
  concreteSubtotal += concreteCost;
  concreteUnitTotal += concreteVolumeM3;
  steelSubtotal += steelCost;
  steelUnitTotal += steelKg;
  labourSubtotal += labourCost;
  labourUnitTotal += labourHrs;

  const baseCode = productName.split('-')[0];
  const productCode = buildProductCode(baseCode, { ...inputs });

  sourceBreakdowns.push({
    name: productName,
    productCode,
    quantity,
    concrete: {
      volume: concreteVolumeM3.toFixed(2),
      cost: parseFloat(concreteCost.toFixed(2)),
      toeVol: toeVolumeM3.toFixed(2)
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

  return;
}

       
              
       // Cover Slab logic
  else if (/^CS(-\d+)?$/.test(productName)) {

  
  const slabLength = safe(inputs.length);        // mm
  const slabWidth = safe(inputs.width);          // mm
  const height = safe(inputs.height);            // mm
  const openingLength = safe(inputs.openingLength || 0);  // mm
  const openingWidth = safe(inputs.openingWidth || 0);    // mm
  const quantity = safe(inputs.quantity || 1);
 
  // Calculate slab and opening volumes (mm³)
  const outerVolMm3 = slabLength * slabWidth * height;
  const safeOpeningLength = Math.min(openingLength, slabLength);
  const safeOpeningWidth = Math.min(openingWidth, slabWidth);
  const openingVolMm3 = safeOpeningLength * safeOpeningWidth * height;

  const netVolMm3 = Math.max(outerVolMm3 - openingVolMm3, 0);
  const concreteVolumeM3 = (netVolMm3 / 1_000_000_000) * quantity;

  // Final costs
  const concreteCost = concreteVolumeM3 * 137.21;
  const steelDensity = safe(inputs.roofSlabDensity); // 👈 pull from Roof Slab field
  const steelKg = concreteVolumeM3 * steelDensity;
  const steelCost = steelKg * 0.86;
  const labourHrs = safe(inputs.labourHours);
  const labourCost = labourHrs * 70.11;

  // Push to totals
  concreteSubtotal += concreteCost;
  concreteUnitTotal += concreteVolumeM3;
  steelSubtotal += steelCost;
  steelUnitTotal += steelKg;
  labourSubtotal += labourCost;
  labourUnitTotal += labourHrs;

  const baseCode = productName.split('-')[0];
  const productCode = buildProductCode(baseCode, { ...inputs });

  sourceBreakdowns.push({
    name: productName,
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

  return;
}



   
// ▶️ Beams logic
else if (/^B(-\d+)?$/.test(productName.trim())) {
  const length = safe(inputs.length);  // mm
  const quantity = safe(inputs.quantity || 1);

  // 🧮 Concrete volume = 0.27 × length (in mm → m)
  const concretePerUnitM3 = 0.27 * (length / 1000);  // Convert mm to m
  concreteVolumeM3 = concretePerUnitM3 * quantity;
  concreteCost = concreteVolumeM3 * 137.21;

  // 🧮 Steel = use steelDensity from Steel/Fibres input
  let steelDensity = safe(inputs.steelDensity);
  if (!steelDensity || steelDensity <= 0) steelDensity = 180;  // same as Column fallback
  const steelKg = concreteVolumeM3 * steelDensity;
  const steelCost = steelKg * 0.86;

  // 🧮 Labour
  const labourPerUnit = safe(inputs.labourHours);
  const labourHrs = labourPerUnit * quantity;
  const labourCost = labourHrs * 70.11;

  // Accumulate to totals
  concreteSubtotal += concreteCost;
  concreteUnitTotal += concreteVolumeM3;
  steelSubtotal += steelCost;
  steelUnitTotal += steelKg;
  labourSubtotal += labourCost;
  labourUnitTotal += labourHrs;

  const baseCode = productName.split('-')[0];
  const productCode = buildProductCode(baseCode, { ...inputs });

  sourceBreakdowns.push({
    name: productName,
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

  return;
}



  
            
      else {
       console.warn("🚨 UNMATCHED PRODUCT TYPE:", productName);
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
        name: productName,
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

console.log("✅ computedBreakdowns", computedBreakdowns);

 
  setEstimate(grandTotal.toFixed(2));
  setProductBreakdowns(computedBreakdowns);
  setBreakdown({
   productBreakdowns: computedBreakdowns,
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
  
}; // 👈 End of handleEstimate


async function handleOpportunitySearch(projectNumber) {
  setIsLoadingOpportunity(true); // 🔄 Start spinner

  try {
   console.log("🔍 Checking Supabase...");
    const exists = await checkProjectExists(projectNumber);
   console.log("✅ Exists in Supabase?", exists);
   
    if (exists) {
      alert("Quote already exists in Supabase. Use 'Open Quote' modal.");
      return;
    }

   console.log("🌐 Fetching from Dynamics...");
    const response = await fetch(`/api/opportunity?projectNumber=${projectNumber.trim()}`);
    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Backend API error:", err);
      alert("Failed to fetch project from Dynamics. Please check the project number.");
      return;
    }

    const opp = await response.json();
   console.log("📦 Dynamics data:", opp);
    if (!opp) {
      alert(`No Dynamics 365 opportunity found for project number: ${projectNumber}`);
      return;
    }

    setFormData(prev => ({ ...prev, ...opp }));
  } catch (err) {
    console.error("Error during opportunity lookup:", err);
    alert("An unexpected error occurred while fetching the project.");
  } finally {
    setIsLoadingOpportunity(false); // ✅ End spinner
  }
}



 

 // 👇 Save to Supabase
 const handleSaveToSupabase = async () => {
  try {
    const concreteUnits = breakdown?.subtotals?.concrete?.units || 0;
    const steelUnits = breakdown?.subtotals?.steel?.units || 0;
    const labourHours = breakdown?.subtotals?.labour?.units || 0;

  console.log('🔍 breakdown.services:', breakdown?.services);
   
   const getServiceValue = (label, field) => {
      const service = breakdown?.services?.find(s => s.label === label);
      return service ? service[field] : 0;
    };

    const totalDesignHours = getServiceValue('Design', 'units');
    const totalDesignPrice = getServiceValue('Design', 'value');
    const totalInstallationDays = getServiceValue('Installation', 'units');
    const totalInstallationPrice = getServiceValue('Installation', 'value');
    const totalTransportLoads = getServiceValue('Transport', 'units');
    const totalTransportPrice = getServiceValue('Transport', 'value');


const quotePayload = {
  project_number: formData.projectNumber.split('|')[0].trim() || '',
  project_name: formData.projectName?.trim() || 'Unnamed Project',
  product_type: productBreakdowns.map(p => p.productCode).join(', '),
  concrete_tonnage: (concreteUnits * 2.6).toFixed(2),
  steel_tonnage: (steelUnits / 1000).toFixed(2),
  price_per_tonne: pricePerTonne ? parseFloat(pricePerTonne).toFixed(2) : '0.00',
  total_price: estimate || 0,
  total_labour_hours: labourHours.toFixed(2),
  hrs_per_tonne_job: concreteUnits > 0 ? (labourHours / (concreteUnits * 2.6)).toFixed(2) : '0.00',
  client: 'test',
  sector: formData.sector,

   // ✅ Save all quote slider values
  profit_margin: formData.margin || 10,
  group_cost: formData.groupCost || 2.5,
  waste_margin: formData.wasteMargin || 5,

  total_design_hours: totalDesignHours,
  total_design_price: totalDesignPrice,
  total_installation_days: totalInstallationDays,
  total_installation_price: totalInstallationPrice,
  total_transport_loads: totalTransportLoads,
  total_transport_price: totalTransportPrice,

  project_city: formData.projectCity || '',
  project_country: formData.projectCountry || '',
  sales_stage: formData.salesStage || '',

  // ✅ Embed design values inside breakdown
  breakdown: {
    ...breakdown,
    design: {
      proposalHours: formData.proposalHours || 0,
      designMeetingsHours: formData.designMeetingsHours || 0,
      structuralDesignHours: formData.structuralDesignHours || 0,
      revitModelHours: formData.revitModelHours || 0,
      approvalCommentsHours: formData.approvalCommentsHours || 0,
      detailingJointsHours: formData.detailingJointsHours || 0,
      detailingFloorsHours: formData.detailingFloorsHours || 0,
      detailingScreedHours: formData.detailingScreedHours || 0,
      gasHours: formData.gasHours || 0,
      productionUnitsHours: formData.productionUnitsHours || 0,
      productionCheckingHours: formData.productionCheckingHours || 0,
      siteQueriesHours: formData.siteQueriesHours || 0,
      asBuiltsHours: formData.asBuiltsHours || 0
    },
    transport: {
      rate: formData.transportRate || 0,
      quantity: formData.transportQuantity || 0
  },
   installation: {
      days: formData.installationDays || 0
    }
    },

  // ✅ Remainder of persisted fields
  form_data: formData,
  product_breakdowns: productBreakdowns,
  sub_product_inputs: subProductInputs,
  product_quantities: productQuantities,

  created_at: new Date().toISOString()
};

   

    console.log('🟠 Quote payload about to save:', quotePayload);

    const result = await saveQuoteToSupabase(quotePayload);

    if (result.success) {
      alert('✅ Quote saved!');
    } else {
      alert('❌ Failed to save quote.');
      console.error(result.error);
    }
  } catch (err) {
    alert('❌ Unexpected error saving quote.');
    console.error('❌ Save error:', err);
  }
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

const [isModalOpen, setModalOpen] = useState(false);

const handleLoadQuote = async (projectNumber) => {
const quote = await fetchQuoteByProjectNumber(projectNumber);

  if (!quote) {
    alert('❌ Quote not found.');
    return;
  }

  // ✅ Patch Project Details, Quote Controls, and Margin
  setFormData((prev) => ({
    ...prev,
    projectNumber: quote.project_number || '',
    projectName: quote.project_name || '',
    client: quote.client || '',
    margin: parseFloat(quote.profit_margin || 0),
    wasteMargin: parseFloat(quote.waste_margin || 0),
    groupCost: parseFloat(quote.group_cost || 0),
   sector: quote.sector || '',
   accountName: quote.account_name || '',
   accountContact: quote.account_contact || '',
   endClient: quote.end_client || '',
   salesperson: quote.salesperson || '',
   region: quote.region || '',
   returnDate: quote.return_date || '',
   currency: quote.currency || '',
   probability: quote.probability || '',
   reqProducts: quote.req_products || '',
   oppDescription: quote.opp_description || '',
   address: quote.address || '',

// Quote controls
  margin: parseFloat(quote.profit_margin ?? quote.form_data?.margin ?? 10),
  wasteMargin: parseFloat(quote.waste_margin ?? quote.form_data?.wasteMargin ?? 5),
  groupCost: parseFloat(quote.group_cost ?? quote.form_data?.groupCost ?? 2.5),

  // Transport & Installation
  transportRate: quote.breakdown?.transport?.rate || 0,
  transportQuantity: quote.breakdown?.transport?.quantity || 0,
  installationDays: quote.breakdown?.installation?.days || quote.form_data?.installationDays || 0,

  // Design hours
  ...(quote.breakdown?.design || {}),

  // Fallback — merge any remaining saved form fields
  ...quote.form_data
  }));

 // ✅ Insert this right here:
if (quote.breakdown) {
  setBreakdown(quote.breakdown);
}
 
  // ✅ Patch Quote Breakdown: BoQ, Job Totals, Services
 if (quote.product_breakdowns) {
  setProductBreakdowns(quote.product_breakdowns); // or your actual state setter
}

 
// ✅ Patch sub-product inputs for all variants
if (quote.sub_product_inputs) {
  setSubProductInputs(quote.sub_product_inputs);

  // Automatically select the first variant
  const variantKeys = Object.keys(quote.sub_product_inputs).filter(k => k.includes('-'));
  if (variantKeys.length > 0) {
    setSelectedProduct(variantKeys[0]); // e.g. 'W-1'
  }

  // Also mark top-level product as configured
  const baseKeys = Object.keys(quote.sub_product_inputs).filter(k => !k.includes('-'));
  baseKeys.forEach(base => {
    setConfiguredProductTypes(prev => new Set([...prev, base]));
    setTopLevelProduct(base); // Optional: pre-select dropdown
  });
}

 
if (quote.product_quantities) {
  setProductQuantities(quote.product_quantities);
}

  // ✅ Rehydrate Quote Controls
  if (quote.total_price) setEstimate(parseFloat(quote.total_price));
  if (quote.price_per_tonne) setPricePerTonne(parseFloat(quote.price_per_tonne));

  // ✅ Patch services
const services = [
  {
    label: 'Design',
    units: quote.total_design_hours || 0,
    value: quote.total_design_price || 0,
    unitLabel: 'hrs',
    unitPrice:
      quote.total_design_hours > 0
        ? quote.total_design_price / quote.total_design_hours
        : 0
  },
  {
    label: 'Transport',
    units: quote.total_transport_loads || 0,
    value: quote.total_transport_price || 0,
    unitLabel: 'loads',
    unitPrice:
      quote.total_transport_loads > 0
        ? quote.total_transport_price / quote.total_transport_loads
        : 0
  },
  {
    label: 'Installation',
    units: quote.total_installation_days || 0,
    value: quote.total_installation_price || 0,
    unitLabel: 'days',
    unitPrice:
      quote.total_installation_days > 0
        ? quote.total_installation_price / quote.total_installation_days
        : 0
  }
];
setBreakdown(prev => ({ ...prev, services }));


  // ✅ Rehydrate product codes if stored
  if (quote.product_type) {
    const codes = quote.product_type.split(',').map(p => p.trim());
    setProductCodes(codes); // if you're tracking product codes separately
  }

  // ✅ (Optional) Patch any transport or installation-specific fields
  setTransportQty(quote.total_transport_loads || 0);
  setInstallationDays(quote.total_installation_days || 0);

  // ✅ Trigger accordions to auto-open
  setForceOpenAccordions(true);
 
  alert('✅ Quote loaded successfully!');
};


     
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex items-center">
        <img src="/fli logo.png" alt="FLI Precast Solutions" className="h-10 mr-4" />
        <h1 className="text-2xl font-bold text-blue-800">FLI Project Estimator Tool</h1>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">

<OpenQuoteModal
  isOpen={isModalOpen}
  onClose={() => setModalOpen(false)}
  onLoadQuote={handleLoadQuote}
/>


<div className="flex justify-center items-center py-3">
  <button
    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition"
    onClick={() => setModalOpen(true)}
  >
    📂 Open Quote
  </button>
</div>

       
  {/* 📌 Project Info */}
<AccordionSection title="📌 Project Details" defaultOpen={forceOpenAccordions}>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
    
<div className="flex flex-col relative">
  <label className="text-xs font-medium mb-1">Project Number</label>
  <input
    name="projectNumber"
    value={formData.projectNumber || ""}
    onChange={handleChange}
    onBlur={(e) => handleOpportunitySearch(e.target.value)}
    className="border p-2 rounded text-xs bg-green-100"
    placeholder="Enter Project Number (e.g. 30019)"
  />
  {isLoadingOpportunity && (
    <span className="text-[10px] text-gray-500 mt-1">🔄 Fetching from Dynamics...</span>
  )}
</div>


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
      <input
        type="text"
        name="accountName"
        value={formData.accountName}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        placeholder="Enter Account Name"
      />
    </div>

    {/* Account Contact */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Account Contact</label>
      <input
        type="text"
        name="accountContact"
        value={formData.accountContact}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        placeholder="Enter Account Contact"
      />
    </div>

    {/* End Client */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">End Client</label>
      <input
        type="text"
        name="endClient"
        value={formData.endClient}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
       />
    </div>

    {/* Salesperson */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Salesperson</label>
      <input
        type="text"
        name="salesperson"
        value={formData.salesperson}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        placeholder="Enter Salesperson Name"
      />
    </div>

    {/* Sector */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Sector</label>
      <input
        type="text"
        name="sector"
        value={formData.sector}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        placeholder="Enter Sector"
      />
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

    {/* Currency */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Currency</label>
      <input
        type="text"
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        placeholder="Enter Currency (e.g. £, €)"
      />
    </div>

    {/* Probability */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Probability (%)</label>
      <input
        name="probability"
        type="number"
        value={formData.probability || ''}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>

    {/* Required Products */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Req. Products</label>
      <input
        type="text"
        name="reqProducts"
        value={formData.reqProducts}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
       />
    </div>

    {/* Region */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Region</label>
      <input
        type="text"
        name="region"
        value={formData.region}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        />
    </div>

    {/* Return Date */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Return Date</label>
    <input
      name="returnDate"
      type="date"
      value={formData.returnDate ? formData.returnDate.slice(0, 10) : ''}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
    />
    </div>

    {/* Sales Stage */}
    <div className="flex flex-col">
      <label className="text-xs font-medium mb-1">Sales Stage</label>
      <input
        name="salesStage"
        value={formData.salesStage}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
      />
    </div>

    {/* Opportunity Description */}
    <div className="flex flex-col md:col-span-4">
      <label className="text-xs font-medium mb-1">Opp. Description</label>
      <textarea
        name="oppDescription"
        value={formData.oppDescription}
        onChange={handleChange}
        className="border p-2 rounded text-xs"
        rows={3}
      />
    </div>

    {/* Row 1: Address, Project City, Project State */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-4">
  {/* Address */}
  <div className="flex flex-col">
    <label className="text-xs font-medium mb-1">Address</label>
    <input
      name="address"
      value={formData.address}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
    />
  </div>

  {/* Project City */}
  <div className="flex flex-col">
    <label className="text-xs font-medium mb-1">Project City</label>
    <input
      type="text"
      name="projectCity"
      value={formData.projectCity || ''}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
    
    />
  </div>

  {/* Project State */}
  <div className="flex flex-col">
    <label className="text-xs font-medium mb-1">Project State</label>
    <input
      type="text"
      name="projectState"
      value={formData.projectState || ''}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
   
    />
  </div>
</div>

{/* Row 2: Postcode, Country, Country Code */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-4">
  {/* Project Postcode */}
  <div className="flex flex-col">
    <label className="text-xs font-medium mb-1">Project Postcode</label>
    <input
      type="text"
      name="projectPostcode"
      value={formData.projectPostcode || ''}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
    
    />
  </div>

  {/* Project Country */}
  <div className="flex flex-col">
    <label className="text-xs font-medium mb-1">Project Country</label>
    <input
      type="text"
      name="projectCountry"
      value={formData.projectCountry || ''}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
     
    />
  </div>

  {/* Country Code */}
  <div className="flex flex-col">
    <label className="text-xs font-medium mb-1">Country Code</label>
    <input
      type="text"
      name="countryCode"
      value={formData.countryCode || ''}
      onChange={handleChange}
      className="border p-2 rounded text-xs"
      
    />
  </div>
</div>
   
  </div>
</AccordionSection>




    <AccordionSection title="🏗️ Manufacturing BoQ" defaultOpen={forceOpenAccordions}>
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
  <option value="SATs">SATs</option>
  <option value="Bespoke">Bespoke</option>
  <option value="Slot Drain">Slot Drain</option>
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
                                               
     {code !== 'CT' ? (
  // Generic Configure button for all non-CT sub-products
  <button
onClick={() => {
  const baseKey = `${code}`;
  const variantKey = `${code}-1`;

  setSubProductInputs(prev => ({
    ...prev,
    [baseKey]: { quantity: 1 }, // still used to track overall count
    [variantKey]: prev[variantKey] || { quantity: 1 } // create CH-1 if not already there
  }));

  setSelectedProduct(variantKey);
}}
   
    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
    title="Configure product"
  >
    🔧 Configure
  </button>
) : (
  // Special CT logic

<button
  onClick={() => {
    const existingVariants = Object.keys(subProductInputs).filter(key => key.startsWith('CT-'));
    const variantNumbers = existingVariants
      .map(k => parseInt(k.split('-')[1]))
      .filter(n => !isNaN(n));
    const nextIndex = variantNumbers.length > 0 ? Math.max(...variantNumbers) + 1 : 1;
    const newKey = `CT-${nextIndex}`;

    setSubProductInputs(prev => ({
      ...prev,
      [newKey]: { quantity: 1 }
    }));

    setSelectedProduct(newKey);
  }}
  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
  title="Configure CT variant"
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

       
        <button
  onClick={() => {
    setSubProductInputs(prev => {
      const next = { ...prev };
      delete next[code];

      const baseKey = code.split('-')[0];
      const otherVariantsExist = Object.keys(next).some(
        key => key.startsWith(`${baseKey}-`)
      );

      if (!otherVariantsExist) {
        delete next[baseKey]; // remove orphaned base key
      }

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
<div className="flex justify-between items-center mb-2">
  <h3 className="text-md font-semibold text-blue-700">
    Configure: {selectedProduct}
  </h3>
  <button
    className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full shadow hover:bg-blue-200 transition"
    onClick={() => {
      const baseCode = selectedProduct?.split('-')[0];
      const existingVariants = Object.keys(subProductInputs).filter(key => key.startsWith(`${baseCode}-`));
      
      // Find the next available variant number
      const variantNumbers = existingVariants.map(key => parseInt(key.split('-')[1], 10)).filter(n => !isNaN(n));
      const nextVariantNumber = variantNumbers.length > 0 ? Math.max(...variantNumbers) + 1 : 1;
      const newVariantKey = `${baseCode}-${nextVariantNumber}`;
      
      // Add new variant tab with default quantity = 1
      setSubProductInputs(prev => ({
        ...prev,
        [newVariantKey]: { quantity: 1 }
      }));
      
      // Switch to the new tab
      setSelectedProduct(newVariantKey);

    }}
  >
    ➕ Another Variant
  </button>
</div>


 <label className="text-xs font-medium text-blue-700 mb-1">Qty  </label>
<input
  type="number"
  min="1"
  className="text-center w-[72px] h-[30px] px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-300 shadow-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
  value={subProductInputs[selectedProduct]?.quantity || ''}
  onChange={(e) =>
    handleSubInputChange(selectedProduct, 'quantity', parseInt(e.target.value))
  }
/>




 {topLevelProduct === 'Troughs' && /^CT-\d+$/.test(selectedProduct) && (
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
  key={`ct-cross-section-${selectedProduct}`}
  value={subProductInputs[selectedProduct]?.crossSection || ''}
  onChange={(e) => {
    const [width, height] = e.target.value.split('x').map(val => parseInt(val));
    const crossSection = e.target.value;

    handleSubInputChange(selectedProduct, 'crossSection', crossSection);
    handleSubInputChange(selectedProduct, 'width', width);
    handleSubInputChange(selectedProduct, 'height', height);
    handleSubInputChange(selectedProduct, 'autoFilled', {
      ...(subProductInputs[selectedProduct]?.autoFilled || {}),
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
    const crossSection = subProductInputs[selectedProduct]?.crossSection || '';
    const [w, h] = crossSection.split('x').map(val => parseInt(val));
    const widthM = w / 1000;
    const heightM = h / 1000;

    const match = standardTroughData.find(
      (t) => t.Width === widthM && t.Height === heightM && t.Length === length
    );

    handleSubInputChange(selectedProduct, 'lengthOption', e.target.value);
    handleSubInputChange(selectedProduct, 'length', lengthMm);

    if (match) {
      handleSubInputChange(selectedProduct, 'width', w);
      handleSubInputChange(selectedProduct, 'height', h);
      handleSubInputChange(selectedProduct, 'steelDensity', match['Steel (kg/m³)']);
      handleSubInputChange(selectedProduct, 'labourHours', match['Labour Hrs/Unit']);
      handleSubInputChange(selectedProduct, 'autoFilled', {
        ...(subProductInputs[selectedProduct]?.autoFilled || {}),
        length: true,
        width: true,
        height: true,
        steelDensity: true,
        labourHours: true
      });

      const additionalItems = [];
      if ((match['RD20 Wavy'] ?? 0) > 0) additionalItems.push({ item: 'RD20 Wavy', qty: match['RD20 Wavy'] });
      if ((match['Capstan 7.5A85'] ?? 0) > 0) additionalItems.push({ item: 'Capstan 7.5A85', qty: match['Capstan 7.5A85'] });
      if ((match['Capstan 1.3A85'] ?? 0) > 0) additionalItems.push({ item: 'Capstan 1.3A85', qty: match['Capstan 1.3A85'] });

      if (additionalItems.length > 0) {
        const enrichedItems = additionalItems.map(entry => ({
          item: entry.item,
          qty: entry.qty,
          category: entry.item.includes('Capstan') || entry.item.includes('RD20') ? 'Capstans and Lifters' : ''
        }));
        handleSubInputChange(selectedProduct, 'uniqueItems', enrichedItems);
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

    {/* Concrete Inputs */}
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
                {/* Auto-fill tooltips */}
                {selectedProduct?.startsWith('CS') && (field === 'length' || field === 'width') && (
                  <span title={`Auto-filled from Chamber ${field} + 2 × wall thickness`} className="cursor-help text-blue-500 text-xs">ⓘ</span>
                )}
                {selectedProduct?.startsWith('CS') && (field === 'wallThickness' || field === 'baseThickness') && (
                  <span title={`Auto-filled from Chamber ${field}`} className="cursor-help text-blue-500 text-xs">ⓘ</span>
                )}
              </label>

              <input
                type="number"
                value={subProductInputs[selectedProduct]?.[field] || ''}
                onChange={(e) => handleSubInputChange(selectedProduct, field, e.target.value)}
                className={`border p-2 rounded text-xs ${subProductInputs[selectedProduct]?.autoFilled?.[field] ? 'bg-blue-50' : ''}`}
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

    {/* Steel/Fibres, Surface Finish, Labour */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col">
        <h5 className="text-xs font-semibold text-blue-800 uppercase mb-2 border-b pb-1">Steel/Fibres</h5>
        <div className="flex gap-2 items-center">
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

    {/* Column Options */}
 {configuredProductTypes.has("Columns") && /^C(-\d+)?$/.test(selectedProduct || '') && (
  <div className="mt-6">
    <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">
      Column Options
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Base Height (mm)</label>
     <input
       type="number"
       value={367}
       readOnly
       disabled
       className="border p-2 rounded text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
     />

      </div>
    </div>
  </div>
)}

   
    {/* Chamber Options */}
    {selectedProduct?.startsWith('CH') && (
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">Chamber Options</h4>
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

          <div className="flex flex-col md:col-span-3">
            <label className="text-xs font-medium mb-1">Chamber Types</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {chamberChecklistOptions.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(subProductInputs[selectedProduct]?.chamberUseTags || []).includes(value)}
                    onChange={(e) => {
                      const current = subProductInputs[selectedProduct]?.chamberUseTags || [];
                      const updated = e.target.checked
                        ? [...current, value]
                        : current.filter((v) => v !== value);
                      handleSubInputChange(selectedProduct, 'chamberUseTags', updated);
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}



   {topLevelProduct === 'Walls' && selectedProduct?.startsWith('W') && (
  <div className="mt-6">
    <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">
      Wall Options
    </h4>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stability Toe Volume (read-only, auto-filled) */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1 flex items-center gap-1">
          Stability Toe Volume (m³)
          <span
            title="Calculated based on wall height"
            className="text-blue-500 cursor-help text-xs"
          >
            ⓘ
          </span>
        </label>
        <input
          type="number"
          readOnly
          disabled
          className="border p-2 rounded text-xs bg-blue-50 text-blue-800 font-semibold cursor-not-allowed"
          value={subProductInputs[selectedProduct]?.stabilityToeVolume || ''}
          placeholder="Auto from height"
        />
      </div>

      {/* MKK Selection */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">MKK Selection</label>
        <select
          value={subProductInputs[selectedProduct]?.mkkSelection || ''}
          onChange={(e) =>
            handleSubInputChange(selectedProduct, 'mkkSelection', e.target.value)
          }
          className="border p-2 rounded text-xs bg-white"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Finish Type */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Finish Type</label>
        <select
          value={subProductInputs[selectedProduct]?.wallFinishType || ''}
          onChange={(e) =>
            handleSubInputChange(selectedProduct, 'wallFinishType', e.target.value)
          }
          className="border p-2 rounded text-xs bg-white"
        >
          <option value="">Select Finish Type</option>
          <option value="FLI-F1 PWC - Potable Water Contact">
            FLI-F1 PWC - Potable Water Contact
          </option>
          <option value="FLI-F1 NWC - Non-potable Water Contact">
            FLI-F1 NWC - Non-potable Water Contact
          </option>
          <option value="FLI-F2 P - Plain">FLI-F2 P - Plain</option>
          <option value="FLI-F2 O - Ordinary">FLI-F2 O - Ordinary</option>
          <option value="FLI-F3 R - Rough">FLI-F3 R - Rough</option>
          <option value="FLI-F3 S - Scabbled">FLI-F3 S - Scabbled</option>
        </select>
      </div>
    </div>
  </div>
)}




   
   
    {selectedProduct?.startsWith('BS') && (
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase text-teal-800 mb-4 tracking-wider border-b pb-2">
          Bespoke Options
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col md:col-span-3">
            <label className="text-xs font-medium mb-1">Bespoke Types</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {bespokeChecklistOptions.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(subProductInputs[selectedProduct]?.bespokeUseTags || []).includes(value)}
                    onChange={(e) => {
                      const current = subProductInputs[selectedProduct]?.bespokeUseTags || [];
                      const updated = e.target.checked
                        ? [...current, value]
                        : current.filter((v) => v !== value);
                      handleSubInputChange(selectedProduct, 'bespokeUseTags', updated);
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

   {topLevelProduct === 'Walls' && selectedProduct?.startsWith('W') && (
  <div className="mt-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col md:col-span-3">
        <label className="text-xs font-medium mb-1">Wall Types</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {wallChecklistOptions.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(subProductInputs[selectedProduct]?.wallUseTags || []).includes(value)}
                onChange={(e) => {
                  const current = subProductInputs[selectedProduct]?.wallUseTags || [];
                  const updated = e.target.checked
                    ? [...current, value]
                    : current.filter((v) => v !== value);
                  handleSubInputChange(selectedProduct, 'wallUseTags', updated);
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
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
           {subProductInputs[selectedProduct]?.uniqueItems?.map((entry, idx) => (
           <div
             key={idx}
             className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-3 rounded-lg shadow-sm ${
               entry.autoFilled ? 'bg-blue-50' : 'bg-white'
             }`}
           >

                  {/* Category Selector */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium mb-1 text-gray-600">Category</label>
                    <select
                     className={`border rounded p-2 text-xs ${
                entry.autoFilled ? 'bg-blue-50 text-blue-800 font-semibold' : 'bg-white'
              }`}
                      value={entry.category || ''}
              onChange={(e) => {
                const newCategory = e.target.value;
                const defaultItem = additionalItemsData[newCategory]?.[0]?.item || '';
                const updated = [...(subProductInputs[selectedProduct]?.uniqueItems || [])];
                updated[idx] = { category: newCategory, item: defaultItem, qty: 0, autoFilled: false };
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
                     className={`border rounded p-2 text-xs ${
                       entry.autoFilled ? 'bg-blue-50 text-blue-800 font-semibold' : ''
                     }`}
                     value={entry.item || ''}
                     onChange={(e) => {
                       const updated = [...(subProductInputs[selectedProduct]?.uniqueItems || [])];
                       updated[idx] = { ...updated[idx], item: e.target.value, autoFilled: false };
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
                       updated[idx] = {
                         ...updated[idx],
                         qty: parseFloat(e.target.value) || 0,
                         autoFilled: false
                       };
                       handleSubInputChange(selectedProduct, 'uniqueItems', updated);
                     }}
                     className={`border rounded p-2 text-xs ${
                       entry.autoFilled ? 'bg-blue-50 text-blue-800 font-semibold' : ''
                     }`}
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

        


    <AccordionSection title="🎨 Design" defaultOpen={forceOpenAccordions}>
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
    

<AccordionSection title="🚚 Transport" defaultOpen={forceOpenAccordions}>
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


        


<AccordionSection title="🛠 Installation" defaultOpen={forceOpenAccordions}>
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
<th className="border p-2 text-center bg-orange-100 text-orange-800 font-semibold text-xs uppercase tracking-wider">
  Hrs/Tn
</th>
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
{/* Hrs/Tn column */}
<td className="border p-2 text-center text-xs bg-orange-100 font-medium">
  {(() => {
    const volumePerUnit = concreteVol / quantity;
    const unitWeightTn = volumePerUnit * 2.6;
    const labourPerUnit = labourHrs / quantity;
    const hrsPerTn = labourPerUnit / unitWeightTn;
    return isFinite(hrsPerTn) ? hrsPerTn.toFixed(2) : '—';
  })()}
</td>

          
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

{/* ➕ New Hrs/Tn column */}
  <td className="border p-2 text-center bg-orange-100 font-semibold text-sm">
    {(() => {
      const totalLabourHrs = breakdown.subtotals?.labour?.units || 0;
      const totalConcreteVol = breakdown.subtotals?.concrete?.units || 0;
      const totalConcreteWeight = totalConcreteVol * 2.6;
      const avgHrsPerTn =
        totalConcreteWeight > 0
          ? (totalLabourHrs / totalConcreteWeight).toFixed(2)
          : '—';
      return avgHrsPerTn;
    })()}
  </td>
       
      </tr>
    </tbody>
  </table>
</div>

   
<div className="mt-8">
  
<h2 className="text-lg font-bold text-gray-800 mb-1">🗂️ Job Totals</h2>
<div className="mt-2 overflow-x-auto">
  <table className="w-full text-xs border border-gray-300">
    <thead className="bg-blue-100 text-left text-blue-800 uppercase tracking-wider">
      <tr>
        <th className="border p-2 text-left"></th>
        <th className="border p-2 text-center">Concrete (tonnes)</th>
        <th className="border p-2 text-center">Steel (tonnes)</th>
        <th className="border p-2 text-center">Labour (hrs)</th>
        <th className="border p-2 text-center">Add. items</th>
        <th className="border p-2 text-center bg-orange-100 text-orange-800 relative group"
           title="Avg. Hrs/Tn across all products"
         >
           Hrs/Tn
         </th>
      </tr>
    </thead>
    <tbody className="bg-white text-gray-800">
      <tr className="text-sm align-top">
       
        <td className="border p-2 font-semibold">Manufacturing</td>
        <td className="border p-2 text-center">
          {(breakdown?.subtotals?.concrete?.units * 2.6).toFixed(2)}
        </td>
        <td className="border p-2 text-center">
          {(breakdown?.subtotals?.steel?.units / 1000).toFixed(2)}
        </td>
        <td className="border p-2 text-center">
          {breakdown?.subtotals?.labour?.units?.toFixed(2)}
        </td>
<td className="border p-2 text-center font-medium">
    {breakdown?.subtotals?.additional?.units || 0} items – €
    {parseFloat(breakdown?.subtotals?.additional?.cost || 0).toFixed(2)}
  
</td>

       
       <td className="border p-2 text-center bg-orange-50 text-orange-800 font-semibold">
          {(() => {
            const tonnes = breakdown?.subtotals?.concrete?.units * 2.6;
            const hrs = breakdown?.subtotals?.labour?.units;
            return tonnes && hrs ? (hrs / tonnes).toFixed(2) : "0.00";
          })()}
        </td>
      </tr>
    </tbody>
  </table>
</div>

</div>

   <div className="mt-8">

{/* 🛠 Service Costs Table */}
<h2 className="text-lg font-bold text-gray-800 mb-1">🛠️ Services Breakdown</h2>
<div className="mt-6 overflow-x-auto">
  <table className="w-full text-xs border border-gray-300">
   <thead className="bg-blue-100 text-left text-blue-800 uppercase tracking-wider">

      <tr className="text-xs">
        <th className="border p-2 text-left">Service</th>
        <th className="border p-2 text-center">Qty (Unit)</th>
        <th className="border p-2 text-center">Unit Price</th>
        <th className="border p-2 text-right">Total (€)</th>
      </tr>
    </thead>
    <tbody className="bg-white text-gray-800">
{breakdown.services?.map((s, i) => (
  <tr key={i} className="text-xs">
    <td className="border p-2 font-medium font-semibold">{s.label}</td>
    <td className="border p-2 text-center">
      {s.units} {s.unitLabel}
    </td>
    <td className="border p-2 text-center">
      €{parseFloat(s.unitPrice).toFixed(2)}
    </td>
    <td className="border p-2 text-right font-semibold">
      €{parseFloat(s.value).toFixed(2)}

      {/* Only show breakdown for Transport row */}
      {s.label === "Transport" && breakdown?.productBreakdowns && (
        <div className="mt-2 text-[10px] text-gray-500 text-left space-y-1 text-right">
          {breakdown.productBreakdowns.map((prod, idx) => {
            const vol = parseFloat(prod.concrete?.volume || 0);
            const totalVol = breakdown.subtotals?.concrete?.units || 1;
            const share = (vol / totalVol) * parseFloat(s.value || 0);
            return (
              <div key={idx}>
                {prod.name}: €{share.toFixed(2)}
              </div>
            );
          })}
        </div>
      )}
    </td>
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
</div>

<div className="mt-8">
  
{/* 💼 Commercial Summary Table */}
<h2 className="text-lg font-bold text-gray-800 mb-1">📊 Commercial Summary</h2>
<div className="mt-6 overflow-x-auto">
  <table className="w-full text-xs border border-gray-300">
    <thead className="bg-blue-100 text-left text-blue-800 uppercase tracking-wider">
      <tr>
        <th className="border p-2 text-left"></th>
        <th className="border p-2 text-center">Net</th>
        <th className="border p-2 text-center">
  Profit
  <span
    className="ml-1 cursor-help text-blue-600"
    title="Adjust profit margin in Quote Controls above"
  >
    ℹ️
  </span>
</th>

<th className="border p-2 text-center">
  Group Cost
  <span
    className="ml-1 cursor-help text-blue-600"
    title="Adjust Group Cost margin in Quote Controls above"
  >
    ℹ️
  </span>
</th>


        <th className="border p-2 text-center">Gross</th>
        <th className="border p-2 text-center bg-orange-100 text-orange-800 text-xs uppercase tracking-wider">
  Price/Tn
</th>

      </tr>
    </thead>
    <tbody className="bg-white text-gray-800">
<tr className="text-xs">
  <td className="border p-2 font-semibold">Manufacturing</td>
  <td className="border p-2 text-center">
    €{manufacturingNet.toFixed(2)}
  </td>
  <td className="border p-2 text-center">
    €{manufacturingProfit.toFixed(2)}
  </td>
  <td className="border p-2 text-center">
    €{manufacturingGroupCost.toFixed(2)}
  </td>
  <td className="border p-2 text-center">
    €{manufacturingGross.toFixed(2)}
  </td>
  <td className="border p-2 text-center bg-orange-100 text-orange-800 font-semibold">
    {pricePerTonne > 0 ? `€${pricePerTonne.toFixed(2)}` : ''}
  </td>
</tr>
     
      <tr className="text-xs">
        <td className="border p-2 font-semibold">Logistics / Transport</td>
        <td className="border p-2 text-center">
          €{transportCost.toFixed(2)}
        </td>
        <td className="border p-2 text-center">
          €{transportProfit.toFixed(2)}
        </td>
        <td className="border p-2 text-center">
          €{transportGroupCost.toFixed(2)}
        </td>
        <td className="border p-2 text-center">
          €{transportGross.toFixed(2)}
        </td>
</tr>

      <tr className="text-xs">
         <td className="border p-2 font-semibold">Design</td>
         <td className="border p-2 text-center">
           €{designCost.toFixed(2)}
         </td>
         <td className="border p-2 text-center">
           €{designProfit.toFixed(2)}
         </td>
         <td className="border p-2 text-center">
           €{designGroupCost.toFixed(2)}
         </td>
         <td className="border p-2 text-center">
           €{designGross.toFixed(2)}
         </td>
     </tr>

     <tr className="text-xs">
          <td className="border p-2 font-semibold">Installation</td>
          <td className="border p-2 text-center">
            €{installationCost.toFixed(2)}
          </td>
          <td className="border p-2 text-center">
            €{installationProfit.toFixed(2)}
          </td>
          <td className="border p-2 text-center">
            €{installationGroupCost.toFixed(2)}
          </td>
          <td className="border p-2 text-center">
            €{installationGross.toFixed(2)}
          </td>
     </tr>

<tr className="bg-blue-100 text-blue-800 font-semibold text-xs border-t-2 border-blue-300">
  <td className="border p-2 text-right">Total Price:</td>
  <td className="border p-2 text-center">€{totalNet.toFixed(2)}</td>
  <td className="border p-2 text-center">€{totalProfit.toFixed(2)}</td>
  <td className="border p-2 text-center">€{totalGroupCost.toFixed(2)}</td>
  <td className="border p-2 text-center">€{totalGross.toFixed(2)}</td>
  <td className="border p-2 text-center bg-orange-100 text-orange-800 font-semibold">
  €{pricePerTonne.toFixed(2)}
</td>

</tr>

    </tbody>
  </table>
</div>
</div>

   
    {/* 💰 Grand Total */}
    <div className="mt-6 text-right text-base font-bold text-blue-900">
      Grand Total: €{estimate}
    </div>
  </div>
)}


       {/* 💾 Save Quote */}
<div className="mt-6 text-center">
  <button
    onClick={handleSaveToSupabase}
    className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-6 rounded shadow text-sm"
  >
    Save Quote
  </button>
</div>


        
</main>
    </div>
  );
}
