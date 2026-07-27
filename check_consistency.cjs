const fs = require('fs');
const phones = JSON.parse(fs.readFileSync('./data/phones.json', 'utf8'));

function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

// ===== 1) CPU TAGS =====
console.log("===== 1) CPU TAG MATCHING v====");
console.log("Filter code checks p.tags.includes(c) for CPU, NOT p.processor.\n");

const cpuTags = ["骁龙8 Elite 5","骁龙8 Elite 1","骁龙8 Gen3","天玑9500","天玑9400","麒麟9030 Pro","麒麟9020","A19 Pro","A19"];

// Find ALL unique processor values
const allProcs = new Set();
phones.forEach(p => { if (p.processor) allProcs.add(p.processor.trim()); });
console.log("All unique processor strings:");
[...allProcs].sort().forEach(p => console.log("  " + p));

console.log("\n--- Per-cpuTag analysis ---");
for (const ct of cpuTags) {
  const nct = norm(ct);
  // Phones whose processor field CONTAINS this chip name
  const procMatch = phones.filter(p => p.processor && norm(p.processor).includes(nct));
  // Phones that have this cpuTag in their tags array
  const tagMatch = phones.filter(p => (p.tags || []).some(t => norm(t) === nct));
  
  console.log(ct + ": " + procMatch.length + " phones match processor, " + tagMatch.length + " tagged");
  if (procMatch.length !== tagMatch.length) {
    const missing = procMatch.filter(p => !(p.tags || []).some(t => norm(t) === nct));
    console.log("  Tagged-but-processor-different (false positives): " + 
      tagMatch.filter(p => !p.processor || !norm(p.processor).includes(nct)).map(p => p.id + ":" + p.model).join(", "));
    console.log("  Processor-matches-but-NOT-tagged: " + 
      missing.map(p => p.id + ":" + p.model + " (" + p.processor + ")").join(", "));
  }
}

console.log("\n--- Phones whose processor matches NO cpuTag ---");
const unmatched = [];
phones.forEach(p => {
  if (!p.processor) { unmatched.push({ id: p.id, model: p.model, processor: "MISSING" }); return; }
  const np = norm(p.processor);
  const matched = cpuTags.some(ct => np.includes(norm(ct)));
  if (!matched) unmatched.push({ id: p.id, model: p.model, processor: p.processor });
});
console.log("Count: " + unmatched.length);
unmatched.forEach(u => console.log("  #" + u.id + " " + u.model + " -> processor=\"" + u.processor + "\""));

// Check for untagged high-end chips (processors matching cpuTags but not in tags)
console.log("\n--- Phones with high-end chip BUT missing tag ---");
const highEndMissing = [];
phones.forEach(p => {
  if (!p.processor) return;
  const np = norm(p.processor);
  for (const ct of cpuTags) {
    const nct = norm(ct);
    if (np.includes(nct)) {
      const hasTag = (p.tags || []).some(t => norm(t) === nct);
      if (!hasTag) {
        highEndMissing.push({ id: p.id, model: p.model, processor: p.processor, cpuTag: ct });
        break;
      }
    }
  }
});
if (highEndMissing.length > 0) {
  console.log("Count: " + highEndMissing.length);
  highEndMissing.forEach(h => console.log("  #" + h.id + " " + h.model + " has " + h.processor + " but NOT tagged with " + h.cpuTag));
} else {
  console.log("None! All good.");
}

// ===== 2) FEATURE TAGS + PROTOCOLS =====
console.log("\n\n===== 2) FEATURE TAGS =====");
const featureTags = ["潜望长焦","≤200g","防尘抗水","NFC","红外","USB3.0","无线充电","有线投屏","散热风扇"];

for (const ft of featureTags) {
  const inTags = phones.filter(p => (p.tags || []).includes(ft)).length;
  const inFeatures = phones.filter(p => (p.features || []).some(f => f.includes ? f.includes(ft) : false)).length;
  const either = phones.filter(p => {
    return (p.tags || []).includes(ft) || (p.features || []).some(f => typeof f === 'string' && f.includes(ft));
  }).length;
  console.log("  " + ft + ": inTags=" + inTags + ", inFeatures=" + inFeatures + ", either=" + either);
}

console.log("\n===== PROTOCOL TAGS =====");
const protocolTags = ["5A PPS","UFCS","PPS","PD","QC","SCP","FCP","VFCP","Qi"];

for (const pt of protocolTags) {
  const has = phones.filter(p => (p.charge_protocols || []).includes(pt)).length;
  console.log("  " + pt + ": " + has + " phones");
}

// Check for phones with no charge_protocols
const noProtoField = phones.filter(p => !p.charge_protocols || p.charge_protocols.length === 0);
console.log("Phones with NO charge_protocols: " + noProtoField.length);
noProtoField.forEach(p => console.log("  #" + p.id + " " + p.model));

// ===== 3) SCREEN SIZE TAGS =====
console.log("\n===== 3) SCREEN SIZE TAGS =====");
const screenSizeRanges = [
  { name: "6.1-6.4英寸", min: 5.9, max: 6.45 },
  { name: "6.5-6.7英寸", min: 6.35, max: 6.75 },
  { name: "6.8-7.0英寸", min: 6.65, max: 7.05 },
  { name: "7.0英寸以上", min: 6.85, max: 99 }
];
const allSizeTags = new Set(screenSizeRanges.map(r => r.name));

function findCorrectRange(ss) {
  for (const r of screenSizeRanges) {
    if (ss >= r.min && ss <= r.max) return r.name;
  }
  return null;
}

// Distribution first
console.log("\nScreen size distribution:");
const dist = {};
phones.forEach(p => {
  if (p.screen_size === undefined || p.screen_size === null) { dist["MISSING"] = (dist["MISSING"]||0)+1; return; }
  const range = findCorrectRange(p.screen_size);
  const key = range || "UNMATCHED(" + p.screen_size + ")";
  dist[key] = (dist[key] || 0) + 1;
});
Object.entries(dist).sort().forEach(([k,v]) => console.log("  " + k + ": " + v));

console.log("\n--- Size tag mismatches ---");
const sizeIssues = [];
phones.forEach(p => {
  const ss = p.screen_size;
  if (ss === undefined || ss === null) {
    sizeIssues.push({ id: p.id, model: p.model, issue: "MISSING screen_size field" });
    return;
  }
  const correct = findCorrectRange(ss);
  if (!correct) {
    sizeIssues.push({ id: p.id, model: p.model, issue: "screen_size=" + ss + " falls in NO range" });
    return;
  }
  const hasCorrectTag = (p.tags || []).includes(correct);
  const otherSizeTag = (p.tags || []).find(t => allSizeTags.has(t) && t !== correct);
  if (!hasCorrectTag) {
    sizeIssues.push({
      id: p.id,
      model: p.model,
      issue: otherSizeTag 
        ? "WRONG size tag: has \"" + otherSizeTag + "\", expected \"" + correct + "\" (screen_size=" + ss + ")"
        : "MISSING size tag: expected \"" + correct + "\" (screen_size=" + ss + ")"
    });
  }
});

console.log("Total issues: " + sizeIssues.length);
sizeIssues.forEach(s => console.log("  #" + s.id + " " + s.model + " → " + s.issue));

// Foldable note
const foldables = phones.filter(p => p.screen_form === "折叠屏");
console.log("\nFoldables (" + foldables.length + "):");
foldables.forEach(p => {
  const sizeTags = (p.tags || []).filter(t => allSizeTags.has(t));
  console.log("  #" + p.id + " " + p.model + " screen_size=" + p.screen_size + 
    " unfolded=" + ((p.screen_unfolded||{}).size||"N/A") + 
    " folded=" + ((p.screen_folded||{}).size||"N/A") + 
    " tags=" + sizeTags.join(","));
});

// ==== 4) MISSING FIELDS ====
console.log("\n===== 4) MISSING/INCONSISTENT price/processor/tags =====");
const missingField = [];
phones.forEach((p, idx) => {
  const issues = [];
  if (p.price === undefined || p.price === null) issues.push("MISSING price");
  if (typeof p.price === 'string') issues.push("price is STRING: " + p.price);
  if (!p.processor || p.processor.trim() === '') issues.push("MISSING processor");
  if (!p.tags || p.tags.length === 0) issues.push("MISSING/EMPTY tags");
  if (!Array.isArray(p.tags)) issues.push("tags is NOT array: " + typeof p.tags);
  if (issues.length > 0) missingField.push({ id: p.id, model: p.model, index: idx, issues });
});
console.log("Total phones: " + phones.length);
console.log("Phones with issues: " + missingField.length);
missingField.forEach(m => console.log("  #" + m.id + " " + m.phone + " (index " + m.index + "): " + m.issues.join(", ")));