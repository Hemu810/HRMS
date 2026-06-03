import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ─── DRUGS DATA ───────────────────────────────────────────────────────────────
const DRUGS = [
  {
    id: 1,
    drugName: "dupilumab",
    genericName: "dupilumab",
    brandName: "Dupixent",
    company: "Sanofi",
    devCompany: "Sanofi / Regeneron",
    country: "United States",
    indication: "Atopic Dermatitis",
    stage: "Approved Commercialized",
    moleculeNature: "Monoclonal Antibody",
    target: "IL-4Rα (CD124)",
    mechanism: "IL-4Rα Antagonist",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: true,
    technology: "VelocImmune",
    originator: "Regeneron Pharmaceuticals Inc",
    atc: "D11AH",
    description:
      "Dupilumab (REGN-668, SAR231893, Dupixent) is a monoclonal antibody developed based on VelocImmune technology. Indicated for moderate-to-severe atopic dermatitis, severe asthma with type 2 inflammation, and chronic rhinosinusitis with nasal polyposis.",
    patentExpiry: "28-Mar-2031",
    therapyArea: "Dermatology",
    sales: { "2021": 6207, "2022": 8292, "2023": 10684, "2024": 13014, "2025": 16000 },
    designations: ["Priority Review", "Breakthrough Therapy", "Orphan Drug"],
    partner: "Sanofi + Regeneron (Nov 2007)",
  },
  {
    id: 2,
    drugName: "eculizumab-aeeb",
    genericName: "eculizumab",
    brandName: "BKEMV",
    company: "Amgen Inc",
    devCompany: "Amgen Inc",
    country: "United States",
    indication: "Myasthenia Gravis",
    stage: "Approved Commercialized",
    moleculeNature: "Monoclonal Antibody",
    target: "Complement C5",
    mechanism: "Complement C5 Inhibitor",
    drugType: "Branded",
    innovation: "Biosimilar",
    firstInClass: false,
    technology: "Recombinant",
    originator: "Alexion Pharmaceuticals",
    atc: "L04AA25",
    description:
      "Eculizumab-aeeb (BKEMV) is a biosimilar to Soliris, a terminal complement inhibitor approved for paroxysmal nocturnal hemoglobinuria, atypical hemolytic uremic syndrome, and generalized myasthenia gravis.",
    patentExpiry: "2025",
    therapyArea: "Neurology",
    sales: { "2022": 180, "2023": 310, "2024": 490, "2025": 620 },
    designations: ["Priority Review", "Orphan Drug"],
    partner: "Amgen (Originator)",
  },
  {
    id: 3,
    drugName: "semaglutide",
    genericName: "semaglutide",
    brandName: "Ozempic / Wegovy",
    company: "Novo Nordisk",
    devCompany: "Novo Nordisk",
    country: "United States",
    indication: "Type 2 Diabetes; Obesity",
    stage: "Approved Commercialized",
    moleculeNature: "Peptide",
    target: "GLP-1 Receptor",
    mechanism: "GLP-1 Receptor Agonist",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: false,
    technology: "Recombinant",
    originator: "Novo Nordisk",
    atc: "A10BJ06",
    description:
      "Semaglutide is a GLP-1 receptor agonist approved for type 2 diabetes management (Ozempic) and chronic weight management (Wegovy). It mimics the incretin hormone GLP-1 to lower blood glucose and reduce appetite.",
    patentExpiry: "2032",
    therapyArea: "Endocrinology",
    sales: { "2021": 2100, "2022": 5600, "2023": 14300, "2024": 21200, "2025": 28000 },
    designations: ["Priority Review", "Breakthrough Therapy"],
    partner: "Novo Nordisk (Originator)",
  },
  {
    id: 4,
    drugName: "pembrolizumab",
    genericName: "pembrolizumab",
    brandName: "Keytruda",
    company: "Merck & Co",
    devCompany: "Merck & Co",
    country: "United States",
    indication: "Non-small Cell Lung Cancer; Melanoma",
    stage: "Approved Commercialized",
    moleculeNature: "Monoclonal Antibody",
    target: "PD-1",
    mechanism: "PD-1 Inhibitor",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: false,
    technology: "Recombinant",
    originator: "Merck & Co",
    atc: "L01FF02",
    description:
      "Pembrolizumab is a humanized anti-PD-1 monoclonal antibody used in immuno-oncology. Approved for more than 40 indications across 16+ tumor types including melanoma, NSCLC, and cervical cancer.",
    patentExpiry: "2028",
    therapyArea: "Oncology",
    sales: { "2021": 17200, "2022": 20900, "2023": 25000, "2024": 27100, "2025": 29000 },
    designations: ["Priority Review", "Breakthrough Therapy", "Accelerated Approval"],
    partner: "Merck (Originator)",
  },
  {
    id: 5,
    drugName: "lecanemab",
    genericName: "lecanemab",
    brandName: "Leqembi",
    company: "Eisai / Biogen",
    devCompany: "Eisai / Biogen",
    country: "United States",
    indication: "Alzheimer Disease",
    stage: "Approved Commercialized",
    moleculeNature: "Monoclonal Antibody",
    target: "Amyloid Beta",
    mechanism: "Amyloid Beta Plaque Remover",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: true,
    technology: "Recombinant",
    originator: "Eisai",
    atc: "N06DX",
    description:
      "Lecanemab is a humanized IgG1 monoclonal antibody that targets aggregated soluble and insoluble amyloid beta, approved for early Alzheimer's disease with confirmed amyloid pathology.",
    patentExpiry: "2035",
    therapyArea: "Neurology",
    sales: { "2023": 50, "2024": 470, "2025": 900 },
    designations: ["Priority Review", "Breakthrough Therapy", "Accelerated Approval"],
    partner: "Eisai + Biogen collaboration",
  },
  {
    id: 6,
    drugName: "tezepelumab",
    genericName: "tezepelumab",
    brandName: "Tezspire",
    company: "AstraZeneca / Amgen",
    devCompany: "AstraZeneca",
    country: "United States",
    indication: "Asthma",
    stage: "Approved Commercialized",
    moleculeNature: "Monoclonal Antibody",
    target: "TSLP",
    mechanism: "TSLP Inhibitor",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: true,
    technology: "Recombinant",
    originator: "AstraZeneca",
    atc: "R03DX",
    description:
      "Tezepelumab is an anti-TSLP monoclonal antibody, the first approved biologic for severe asthma without phenotypic restrictions, targeting thymic stromal lymphopoietin upstream of the type 2 inflammatory cascade.",
    patentExpiry: "2033",
    therapyArea: "Respiratory",
    sales: { "2022": 120, "2023": 420, "2024": 790, "2025": 1100 },
    designations: ["Priority Review", "Breakthrough Therapy"],
    partner: "AstraZeneca + Amgen",
  },
  {
    id: 7,
    drugName: "nirsevimab",
    genericName: "nirsevimab",
    brandName: "Beyfortus",
    company: "AstraZeneca / Sanofi",
    devCompany: "AstraZeneca / Sanofi",
    country: "United States",
    indication: "RSV Prevention in Infants",
    stage: "Approved Commercialized",
    moleculeNature: "Monoclonal Antibody",
    target: "RSV F Protein",
    mechanism: "RSV F Protein Neutralizer",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: true,
    technology: "Extended half-life mAb",
    originator: "AstraZeneca",
    atc: "J06BB",
    description:
      "Nirsevimab is a long-acting anti-RSV monoclonal antibody with extended half-life technology, approved for the prevention of RSV-related lower respiratory tract disease in neonates and infants.",
    patentExpiry: "2036",
    therapyArea: "Infectious Disease",
    sales: { "2023": 980, "2024": 1800, "2025": 2300 },
    designations: ["Priority Review", "Breakthrough Therapy"],
    partner: "AstraZeneca + Sanofi partnership",
  },
  {
    id: 8,
    drugName: "imetelstat",
    genericName: "imetelstat",
    brandName: "Rytelo",
    company: "Johnson & Johnson",
    devCompany: "Geron Corporation",
    country: "United States",
    indication: "Myelodysplastic Syndromes",
    stage: "Approved Commercialized",
    moleculeNature: "Oligonucleotide",
    target: "Telomerase",
    mechanism: "Telomerase Inhibitor",
    drugType: "Branded",
    innovation: "NME",
    firstInClass: true,
    technology: "Oligonucleotide",
    originator: "Geron Corporation",
    atc: "L01XX",
    description:
      "Imetelstat is a first-in-class telomerase inhibitor approved for adult patients with low-to-intermediate risk myelodysplastic syndromes who have relapsed after or are refractory to erythropoiesis-stimulating agents.",
    patentExpiry: "2034",
    therapyArea: "Oncology / Hematology",
    sales: { "2024": 85, "2025": 220 },
    designations: ["Priority Review", "Orphan Drug"],
    partner: "Geron + J&J (2023 collaboration)",
  },
];

// ─── TRIALS DATA ──────────────────────────────────────────────────────────────
const TRIALS = [
  {
    nctId: "NCT01295827",
    trialTitle: "A Study of Pembrolizumab (MK-3475) in Participants With Progressive Locally Advanced or Metastatic Carcinoma, Melanoma, or Non-small Cell Lung Carcinoma (P07990/MK-3475-001/KEYNOTE-001)",
    officialTitle: "A Phase Ib Multi-Cohort Study of Pembrolizumab (MK-3475) in Subjects With Advanced Solid Tumors",
    status: "Terminated",
    studyType: "INTERVENTIONAL",
    sponsor: "Merck Sharp & Dohme LLC",
    funder: "INDUSTRY",
    startDate: "04-Mar-11",
    primaryCompletionDate: "05-Nov-18",
    completionDate: "11-Dec-18",
    plannedSubjects: 1260,
    enrolledSubjects: 1260,
    gender: "ALL",
    minAge: "18 Years",
    maxAge: "—",
    countries: ["United States", "United Kingdom", "Australia", "France", "Germany"],
    phase: "Phase I",
    interventionType: "BIOLOGICAL",
    drugName: "Pembrolizumab",
    meshCondition: "Cancer, Solid Tumor",
    keywords: ["Melanoma", "Carcinoma", "PD-1", "PD-L1", "Metastatic cancer"],
    hasResults: true,
    resultsPostedDate: "13-Dec-19",
    resultsUrl: "https://clinicaltrials.gov/study/NCT01295827",
    trialDurationMonths: 93,
    healthyVolunteers: false,
    collaborator: "",
    addedDate: "10-Feb-11",
    updatedDate: "22-Nov-19",
    lastUpdated: "19-Nov-25",
    endpointClassification: "Outcomes, positive",
    trialOutcome: "KEYNOTE-001 demonstrated positive outcomes for pembrolizumab in advanced melanoma and NSCLC, with durable responses and manageable safety profiles as reported in multiple publications.",
  },
  {
    nctId: "NCT00000105",
    trialTitle: "Vaccination With Tetanus and KLH to Assess Immune Responses.",
    officialTitle: "Vaccination With Tetanus Toxoid and KLH to Assess Immune Responses.",
    status: "Terminated",
    studyType: "OBSERVATIONAL",
    sponsor: "Masonic Cancer Center, University of Minnesota",
    funder: "Other",
    startDate: "01-Jan-95",
    primaryCompletionDate: "01-Jan-00",
    completionDate: "01-Jan-00",
    plannedSubjects: 40,
    enrolledSubjects: 38,
    gender: "ALL",
    minAge: "18 Years",
    maxAge: "65 Years",
    countries: ["United States"],
    phase: "Phase II",
    interventionType: "BIOLOGICAL",
    drugName: "Tetanus Toxoid Vaccine",
    meshCondition: "Immune Response",
    keywords: ["Tetanus", "KLH", "Immune Response", "Vaccination"],
    hasResults: false,
    resultsPostedDate: null,
    resultsUrl: null,
    trialDurationMonths: 60,
    healthyVolunteers: true,
    collaborator: "",
    addedDate: "27-Oct-99",
    updatedDate: "01-Jan-01",
    lastUpdated: "01-Jan-01",
    endpointClassification: "—",
    trialOutcome: "No results posted.",
  },
  {
    nctId: "NCT00000106",
    trialTitle: "41.8 Degree Centigrade Whole Body Hyperthermia for the Treatment of Rheumatoid Diseases",
    officialTitle: "A Study of Whole Body Hyperthermia for Rheumatoid Diseases",
    status: "Unknown status",
    studyType: "INTERVENTIONAL",
    sponsor: "National Center for Research Resources (NCRR)",
    funder: "NIH",
    startDate: "01-Jan-96",
    primaryCompletionDate: "01-Jan-02",
    completionDate: "01-Jan-02",
    plannedSubjects: 50,
    enrolledSubjects: 45,
    gender: "ALL",
    minAge: "21 Years",
    maxAge: "70 Years",
    countries: ["United States"],
    phase: "Phase II",
    interventionType: "DEVICE",
    drugName: "Hyperthermia System",
    meshCondition: "Rheumatoid Arthritis",
    keywords: ["Hyperthermia", "Rheumatoid", "Arthritis"],
    hasResults: false,
    resultsPostedDate: null,
    resultsUrl: null,
    trialDurationMonths: 72,
    healthyVolunteers: false,
    collaborator: "",
    addedDate: "27-Oct-99",
    updatedDate: "01-Jan-02",
    lastUpdated: "01-Jan-02",
    endpointClassification: "—",
    trialOutcome: "No results posted.",
  },
  {
    nctId: "NCT02477397",
    trialTitle: "A Study of Dupilumab in Patients With Moderate to Severe Chronic Obstructive Pulmonary Disease (COPD)",
    officialTitle: "A Randomized, Double-Blind, Placebo-Controlled Study of Dupilumab in Patients With COPD",
    status: "Completed",
    studyType: "INTERVENTIONAL",
    sponsor: "Sanofi",
    funder: "INDUSTRY",
    startDate: "15-Jul-15",
    primaryCompletionDate: "10-Mar-19",
    completionDate: "10-Apr-19",
    plannedSubjects: 210,
    enrolledSubjects: 210,
    gender: "ALL",
    minAge: "40 Years",
    maxAge: "80 Years",
    countries: ["United States", "Germany", "France", "Canada", "Japan"],
    phase: "Phase II",
    interventionType: "BIOLOGICAL",
    drugName: "Dupilumab",
    meshCondition: "COPD, Pulmonary Disease",
    keywords: ["COPD", "Dupilumab", "IL-4", "Eosinophil", "FEV1"],
    hasResults: true,
    resultsPostedDate: "01-Jun-20",
    resultsUrl: "https://clinicaltrials.gov/study/NCT02477397",
    trialDurationMonths: 45,
    healthyVolunteers: false,
    collaborator: "Regeneron Pharmaceuticals",
    addedDate: "20-Jun-15",
    updatedDate: "15-May-20",
    lastUpdated: "01-Nov-25",
    endpointClassification: "Outcomes, positive",
    trialOutcome: "Dupilumab significantly reduced exacerbations and improved FEV1 in COPD patients with elevated eosinophils.",
  },
  {
    nctId: "NCT05946044",
    trialTitle: "Efficacy and Safety of Tezepelumab in Adults With Severe Uncontrolled Asthma With or Without Nasal Polyposis",
    officialTitle: "A Phase III Randomized, Double-Blind, Placebo-Controlled Study of Tezepelumab in Adults With Severe Asthma",
    status: "Recruiting",
    studyType: "INTERVENTIONAL",
    sponsor: "AstraZeneca",
    funder: "INDUSTRY",
    startDate: "01-Aug-23",
    primaryCompletionDate: "01-Dec-26",
    completionDate: "01-Mar-27",
    plannedSubjects: 1200,
    enrolledSubjects: 780,
    gender: "ALL",
    minAge: "18 Years",
    maxAge: "75 Years",
    countries: ["United States", "Australia", "United Kingdom"],
    phase: "Phase III",
    interventionType: "BIOLOGICAL",
    drugName: "Tezepelumab",
    meshCondition: "Asthma, Nasal Polyps",
    keywords: ["Tezepelumab", "Asthma", "TSLP", "Nasal Polyposis", "Eosinophil"],
    hasResults: false,
    resultsPostedDate: null,
    resultsUrl: null,
    trialDurationMonths: 43,
    healthyVolunteers: false,
    collaborator: "Amgen",
    addedDate: "25-Jul-23",
    updatedDate: "15-Jan-25",
    lastUpdated: "10-Apr-25",
    endpointClassification: "—",
    trialOutcome: "Ongoing — no results yet.",
  },
];

const BIOMARKERS = {
  NCT02477397: [
    { rawText: "FEV1", normalizedName: "Forced Expiratory Volume in 1 Second (FEV1)", type: "Response/Surrogate", specimen: "lung function measurement", assay: "spirometry", sourceSection: "Secondary Outcome", confidence: 1.0, notes: "FEV1 is a standard biomarker for lung function and COPD severity.", ontologyMappings: [{ system: "MeSH", id: "D005379", label: "Forced Expiratory Volume" }] },
    { rawText: "Cell differential counts in blood", normalizedName: "Blood cell differential count", type: "Inflammatory", specimen: "blood", assay: "hematology analyzer", sourceSection: "Other Outcome", confidence: 0.95, notes: "Used to assess systemic inflammation in COPD.", ontologyMappings: [{ system: "MeSH", id: "D001741", label: "Blood Cell Count" }] },
    { rawText: "nasal gene expression signature", normalizedName: "Nasal gene expression signature", type: "Genomic", specimen: "nasal epithelium", assay: "gene expression profiling", sourceSection: "Other Outcome", confidence: 0.90, notes: "May identify molecular changes associated with COPD or treatment response.", ontologyMappings: [{ system: "MeSH", id: "D051868", label: "Gene Expression Profiling" }] },
    { rawText: "serum FSH >40 mIU/mL", normalizedName: "Follicle Stimulating Hormone (FSH)", type: "Endocrine", specimen: "serum", assay: "immunoassay", sourceSection: "Exclusion Criteria", thresholds: ">40 mIU/mL", confidence: 0.85, notes: "Used for eligibility, not as a COPD biomarker.", ontologyMappings: [{ system: "MeSH", id: "D005654", label: "Follicle Stimulating Hormone" }] },
  ],
  NCT01295827: [
    { rawText: "PD-L1 expression", normalizedName: "Programmed Death-Ligand 1 (PD-L1)", type: "Predictive", specimen: "tumor tissue", assay: "IHC", sourceSection: "Primary Outcome", confidence: 0.98, notes: "Key biomarker for pembrolizumab response prediction.", ontologyMappings: [{ system: "MeSH", id: "D000077594", label: "B7-H1 Antigen" }] },
    { rawText: "Overall Response Rate", normalizedName: "Overall Response Rate (ORR)", type: "Efficacy", specimen: "imaging", assay: "RECIST 1.1", sourceSection: "Primary Outcome", confidence: 1.0, notes: "Primary endpoint of KEYNOTE-001.", ontologyMappings: [{ system: "MeSH", id: "D016896", label: "Treatment Outcome" }] },
  ],
};

const LOCATIONS = {
  NCT05946044: [
    { siteName: "University of North Carolina at Chapel Hill", country: "United States", state: "North Carolina", city: "Chapel Hill", zipCode: "27516", lat: 35.9132, lng: -79.05584 },
    { siteName: "Wake Forest University", country: "United States", state: "North Carolina", city: "Winston-Salem", zipCode: "27109", lat: 36.09986, lng: -80.24422 },
    { siteName: "University of Sydney", country: "Australia", state: "", city: "Sydney", zipCode: "", lat: -33.86785, lng: 151.20732 },
    { siteName: "Brigham and Women's Hospital", country: "United States", state: "Massachusetts", city: "Boston", zipCode: "02115", lat: 42.35843, lng: -71.05977 },
  ],
  NCT01295827: [
    { siteName: "Memorial Sloan Kettering Cancer Center", country: "United States", state: "New York", city: "New York", zipCode: "10065", lat: 40.7641, lng: -73.9569 },
    { siteName: "MD Anderson Cancer Center", country: "United States", state: "Texas", city: "Houston", zipCode: "77030", lat: 29.7078, lng: -95.3975 },
    { siteName: "Peter MacCallum Cancer Centre", country: "Australia", state: "", city: "Melbourne", zipCode: "", lat: -37.8089, lng: 144.9784 },
    { siteName: "Institut Gustave Roussy", country: "France", state: "", city: "Villejuif", zipCode: "94800", lat: 48.7928, lng: 2.3511 },
  ],
};

const ADVERSE_EVENTS = {
  NCT01295827: [
    { term: "Fatigue", category: "General", frequency: "23.5%", grade34: "2.1%", serious: false },
    { term: "Rash", category: "Skin", frequency: "18.2%", grade34: "0.8%", serious: false },
    { term: "Pruritus", category: "Skin", frequency: "14.7%", grade34: "0.3%", serious: false },
    { term: "Diarrhea", category: "Gastrointestinal", frequency: "11.4%", grade34: "1.2%", serious: false },
    { term: "Pneumonitis", category: "Respiratory", frequency: "3.2%", grade34: "1.8%", serious: true },
    { term: "Hypothyroidism", category: "Endocrine", frequency: "7.8%", grade34: "0.2%", serious: false },
    { term: "Colitis", category: "Gastrointestinal", frequency: "2.1%", grade34: "1.9%", serious: true },
    { term: "Hepatitis", category: "Hepatic", frequency: "1.5%", grade34: "1.1%", serious: true },
  ],
};

const PARTICIPANT_FLOW = {
  NCT01295827: [
    { milestone: "Enrolled / Randomized", participants: 1260, percentage: "100%" },
    { milestone: "Received Treatment", participants: 1235, percentage: "98.0%" },
    { milestone: "Completed Primary Endpoint", participants: 982, percentage: "77.9%" },
    { milestone: "Discontinued (AE)", participants: 148, percentage: "11.7%" },
    { milestone: "Discontinued (Progression)", participants: 312, percentage: "24.8%" },
    { milestone: "Completed Study", participants: 541, percentage: "42.9%" },
  ],
};

const INVESTIGATORS = {
  NCT01295827: [
    { position: "Study Director", investigator: "Medical Director", qualification: "MD", company: "Merck Sharp & Dohme Corp.", url: "https://clinicaltrials.gov/ct2/show/NCT01295827" },
  ],
};

// ─── SUBTAB CONFIG ────────────────────────────────────────────────────────────
const DRUG_SUBTABS = ["Basic", "Development", "Review Designation", "Sales And Forecast", "Drug Expiry"];
const TRIAL_SUBTABS = [
  "Basic", "Study Design", "Interventions", "Collaborators", "Outcomes",
  "BioMarkers", "Investigators", "Clinical Sites", "Participant Flow", "Adverse Events",
];


// ─── COUNTRY DATA ─────────────────────────────────────────────────────────────
const COUNTRIES = [
  {
    id: 1, name: "United States", iso: "US", flag: "🇺🇸",
    region: "North America", subRegion: "Northern America",
    regulator: "FDA", regulatorFull: "Food and Drug Administration",
    regulatorUrl: "https://www.fda.gov",
    currency: "USD", gdp: 27360, healthcareSpend: 4.5,
    healthcareSpendPct: 16.9, population: 335.9,
    approvedDrugs: 14200, activeTrials: 42800, companiesHQ: 1840,
    marketSize2024: 680, marketSize2030: 890, cagr: 4.6,
    genericPenetration: "92%", biosimilarPenetration: "34%",
    patientAccessScore: 8.7, innovationIndex: 9.4,
    approvalPathways: ["NDA", "BLA", "ANDA", "505(b)(2)", "Accelerated Approval", "Breakthrough Therapy", "Fast Track", "Priority Review", "REMS"],
    topTherapyAreas: ["Oncology", "Immunology", "Neurology", "Cardiovascular", "Rare Diseases"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi", date: "26-May-2020", indication: "Atopic Dermatitis (6-11 yrs)", pathway: "BLA/Priority Review" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "Merck", date: "19-Jan-2024", indication: "NSCLC (PD-L1 high)", pathway: "BLA/Priority Review" },
      { drug: "lecanemab", brand: "Leqembi", company: "Eisai/Biogen", date: "06-Jul-2023", indication: "Alzheimer's Disease", pathway: "BLA/Accelerated Approval" },
      { drug: "semaglutide", brand: "Wegovy", company: "Novo Nordisk", date: "04-Mar-2021", indication: "Chronic Weight Management", pathway: "NDA/Priority Review" },
      { drug: "tezepelumab", brand: "Tezspire", company: "AstraZeneca", date: "17-Dec-2021", indication: "Severe Asthma", pathway: "BLA/Priority Review" },
    ],
    activeTrialsList: [
      { nctId: "NCT01295827", title: "KEYNOTE-001 Pembrolizumab in Advanced Solid Tumors", phase: "Phase I", sponsor: "Merck", status: "Terminated", enrolled: 1260 },
      { nctId: "NCT05946044", title: "Tezepelumab in Severe Asthma with Nasal Polyposis", phase: "Phase III", sponsor: "AstraZeneca", status: "Recruiting", enrolled: 780 },
      { nctId: "NCT04365387", title: "Nemolizumab in Atopic Dermatitis", phase: "Phase III", sponsor: "Galderma", status: "Completed", enrolled: 1728 },
      { nctId: "NCT04939949", title: "Tarlatamab in Small Cell Lung Cancer", phase: "Phase II", sponsor: "Amgen", status: "Completed", enrolled: 220 },
    ],
    trialSites: [
      { name: "Memorial Sloan Kettering Cancer Center", city: "New York", state: "NY", trials: 842 },
      { name: "MD Anderson Cancer Center", city: "Houston", state: "TX", trials: 731 },
      { name: "Mayo Clinic", city: "Rochester", state: "MN", trials: 612 },
      { name: "Johns Hopkins Hospital", city: "Baltimore", state: "MD", trials: 534 },
      { name: "Massachusetts General Hospital", city: "Boston", state: "MA", trials: 498 },
    ],
    topCompanies: [
      { name: "Merck & Co", ticker: "MRK", revenue: 63.6, hq: "Rahway, NJ", employees: 69000, pipeline: 95 },
      { name: "Johnson & Johnson", ticker: "JNJ", revenue: 88.8, hq: "New Brunswick, NJ", employees: 141700, pipeline: 112 },
      { name: "AbbVie", ticker: "ABBV", revenue: 56.3, hq: "North Chicago, IL", employees: 50000, pipeline: 87 },
      { name: "Bristol-Myers Squibb", ticker: "BMY", revenue: 47.2, hq: "Princeton, NJ", employees: 34000, pipeline: 78 },
      { name: "Pfizer", ticker: "PFE", revenue: 58.5, hq: "New York, NY", employees: 88000, pipeline: 108 },
    ],
    topDiseases: [
      { name: "Diabetes", patients: 37400, marketSize: 65.2, growth: "+6.8%" },
      { name: "Oncology", patients: 18100, marketSize: 95.4, growth: "+10.2%" },
      { name: "Cardiovascular", patients: 92600, marketSize: 52.1, growth: "+5.1%" },
      { name: "Atopic Dermatitis", patients: 16800, marketSize: 8.9, growth: "+14.2%" },
      { name: "Alzheimer's", patients: 6700, marketSize: 5.8, growth: "+22.1%" },
    ],
    recentDeals: [
      { type: "M&A", parties: "Eli Lilly → Morphic Therapeutic", value: 3200, date: "Feb-2026", drug: "MORF-057" },
      { type: "License", parties: "AstraZeneca ← Keymed Biosciences", value: 1850, date: "Apr-2026", drug: "CM310" },
      { type: "Co-Dev", parties: "AstraZeneca + Daiichi Sankyo", value: 6000, date: "Feb-2026", drug: "ADC portfolio" },
    ],
    pricingPolicy: "Market-based pricing; IRA drug price negotiation since 2022; Medicare Part D reform",
    reimbursementSystem: "Mixed: Medicare (federal), Medicaid (state/federal), private insurance, PBMs",
    patentExtension: "Hatch-Waxman: 5-yr NCE exclusivity; 12-yr biologics exclusivity; Patent Term Extension",
    regulatoryTimeline: "Standard: 10-12 months; Priority: 6 months; Breakthrough: expedited rolling review",
    keyRegulations: ["21st Century Cures Act", "PDUFA VIII", "Inflation Reduction Act (IRA)", "FDORA 2022"],
    marketAccess: "High — established PBM/payer infrastructure; biosimilar uptake increasing post-IRA",
    manufacturingSites: 847,
    exportValue: 84.2,
    importValue: 128.6,
    topExportDrugs: ["Keytruda", "Humira", "Dupixent", "Eliquis", "Ozempic"],
    newsItems: [
      { date: "02-May-2026", headline: "FDA Approves Amlitelimab for Moderate-Severe AD in Adults", category: "Approval", priority: "High" },
      { date: "28-Apr-2026", headline: "IRA Drug Price Negotiation Round 3: 15 New Drugs Selected", category: "Policy", priority: "High" },
      { date: "15-Apr-2026", headline: "FDA Breakthrough Designation for Novel KRAS G12C Inhibitor", category: "Designation", priority: "Medium" },
    ],
  },
  {
    id: 2, name: "Germany", iso: "DE", flag: "🇩🇪",
    region: "Europe", subRegion: "Western Europe",
    regulator: "BfArM", regulatorFull: "Federal Institute for Drugs and Medical Devices",
    regulatorUrl: "https://www.bfarm.de",
    currency: "EUR", gdp: 4456, healthcareSpend: 0.44,
    healthcareSpendPct: 12.8, population: 83.2,
    approvedDrugs: 4800, activeTrials: 8200, companiesHQ: 180,
    marketSize2024: 58.2, marketSize2030: 74.1, cagr: 4.1,
    genericPenetration: "83%", biosimilarPenetration: "62%",
    patientAccessScore: 8.2, innovationIndex: 8.6,
    approvalPathways: ["EMA Centralized", "National MRP/DCP", "AMNOG Early Benefit Assessment", "Compassionate Use", "Named Patient"],
    topTherapyAreas: ["Oncology", "Cardiovascular", "Diabetes", "Immunology", "CNS"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi", date: "26-Sep-2017", indication: "Atopic Dermatitis (Adult)", pathway: "EMA Centralized" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD", date: "17-Jul-2015", indication: "Melanoma", pathway: "EMA Centralized" },
      { drug: "tirzepatide", brand: "Mounjaro", company: "Eli Lilly", date: "24-Nov-2022", indication: "Type 2 Diabetes", pathway: "EMA Centralized" },
      { drug: "lecanemab", brand: "Leqembi", company: "Eisai/Biogen", date: "2025", indication: "Alzheimer's Disease", pathway: "EMA Centralized (pending)" },
    ],
    activeTrialsList: [
      { nctId: "NCT02477397", title: "Dupilumab in COPD with Elevated Eosinophils", phase: "Phase II", sponsor: "Sanofi", status: "Completed", enrolled: 210 },
      { nctId: "NCT04801576", title: "Povorcitinib in Atopic Dermatitis", phase: "Phase III", sponsor: "Incyte", status: "Recruiting", enrolled: 640 },
    ],
    trialSites: [
      { name: "Charité Universitätsmedizin", city: "Berlin", state: "Berlin", trials: 428 },
      { name: "Heidelberg University Hospital", city: "Heidelberg", state: "Baden-Württemberg", trials: 312 },
      { name: "LMU Klinikum", city: "Munich", state: "Bavaria", trials: 289 },
      { name: "University Hospital Frankfurt", city: "Frankfurt", state: "Hesse", trials: 241 },
    ],
    topCompanies: [
      { name: "Bayer AG", ticker: "BAYN", revenue: 47.6, hq: "Leverkusen", employees: 100000, pipeline: 66 },
      { name: "Boehringer Ingelheim", ticker: "Private", revenue: 23.7, hq: "Ingelheim", employees: 53500, pipeline: 52 },
      { name: "Merck KGaA", ticker: "MRK.DE", revenue: 22.1, hq: "Darmstadt", employees: 64500, pipeline: 48 },
    ],
    topDiseases: [
      { name: "Cardiovascular", patients: 18200, marketSize: 14.2, growth: "+3.8%" },
      { name: "Diabetes", patients: 9100, marketSize: 9.8, growth: "+5.2%" },
      { name: "Oncology", patients: 5200, marketSize: 12.1, growth: "+9.4%" },
      { name: "Atopic Dermatitis", patients: 3800, marketSize: 2.1, growth: "+12.8%" },
      { name: "Asthma", patients: 6200, marketSize: 3.4, growth: "+6.1%" },
    ],
    recentDeals: [
      { type: "M&A", parties: "Bayer → Vividion Therapeutics", value: 1500, date: "Jan-2026", drug: "Proteomics platform" },
      { type: "License", parties: "Merck KGaA ← Molecular Templates", value: 780, date: "Mar-2026", drug: "ETB program" },
    ],
    pricingPolicy: "AMNOG: mandatory early benefit assessment for new drugs; GKV negotiated price after 12 months; free pricing first year",
    reimbursementSystem: "Statutory Health Insurance (GKV) covers 90% population; Private Health Insurance (PKV) ~10%",
    patentExtension: "SPC up to 5yr extension; Paediatric Extension 6 months; EU 10-yr data exclusivity for biologics",
    regulatoryTimeline: "EMA standard: 210 days; EMA accelerated: 150 days; AMNOG assessment: 3 months post-launch",
    keyRegulations: ["AMNOG (2011)", "EU Pharma Legislation 2024", "HTA Regulation EU 2022/2282", "GKV-Finanzstabilisierungsgesetz"],
    marketAccess: "High — strong GKV coverage; AMNOG creates pricing pressure post-12 months; high biosimilar uptake",
    manufacturingSites: 412,
    exportValue: 68.4,
    importValue: 42.1,
    topExportDrugs: ["Aspirin", "Glucobay", "Xarelto", "Eylea", "Kovaltry"],
    newsItems: [
      { date: "20-Apr-2026", headline: "Germany AMNOG: Dupilumab COPD Receives Major Additional Benefit", category: "Policy", priority: "High" },
      { date: "05-Apr-2026", headline: "Bayer Files Acoramidis NDA with BfArM for ATTR-CM", category: "Regulatory", priority: "Medium" },
    ],
  },
  {
    id: 3, name: "Japan", iso: "JP", flag: "🇯🇵",
    region: "Asia Pacific", subRegion: "Eastern Asia",
    regulator: "PMDA", regulatorFull: "Pharmaceuticals and Medical Devices Agency",
    regulatorUrl: "https://www.pmda.go.jp",
    currency: "JPY", gdp: 4213, healthcareSpend: 0.34,
    healthcareSpendPct: 11.1, population: 124.6,
    approvedDrugs: 5200, activeTrials: 6800, companiesHQ: 240,
    marketSize2024: 78.4, marketSize2030: 82.1, cagr: 0.8,
    genericPenetration: "81%", biosimilarPenetration: "28%",
    patientAccessScore: 7.8, innovationIndex: 7.9,
    approvalPathways: ["PMDA Standard", "SAKIGAKE (Breakthrough)", "Conditional Early Approval", "Priority Review", "Orphan Drug"],
    topTherapyAreas: ["Oncology", "CNS/Psychiatry", "Cardiovascular", "Gastroenterology", "Immunology"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi KK", date: "19-Jan-2018", indication: "Atopic Dermatitis", pathway: "PMDA Standard" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD KK", date: "02-Feb-2017", indication: "Unresectable Melanoma", pathway: "PMDA Priority" },
      { drug: "semaglutide", brand: "Ozempic", company: "Novo Nordisk Pharma", date: "24-Jun-2021", indication: "Type 2 Diabetes", pathway: "PMDA Standard" },
      { drug: "tezepelumab", brand: "Tezspire", company: "AstraZeneca KK", date: "26-Sep-2023", indication: "Severe Asthma", pathway: "PMDA Priority" },
    ],
    activeTrialsList: [
      { nctId: "NCT04801576", title: "Povorcitinib Phase III in Atopic Dermatitis (Japan cohort)", phase: "Phase III", sponsor: "Incyte/Eli Lilly Japan", status: "Recruiting", enrolled: 120 },
      { nctId: "NCT04427722", title: "Orismilast Topical in Atopic Dermatitis", phase: "Phase III", sponsor: "Arcutis", status: "Recruiting", enrolled: 80 },
    ],
    trialSites: [
      { name: "National Cancer Center Hospital", city: "Tokyo", state: "Tokyo", trials: 312 },
      { name: "Keio University Hospital", city: "Tokyo", state: "Tokyo", trials: 248 },
      { name: "Kyoto University Hospital", city: "Kyoto", state: "Kyoto", trials: 212 },
      { name: "Osaka University Hospital", city: "Osaka", state: "Osaka", trials: 198 },
    ],
    topCompanies: [
      { name: "Takeda Pharmaceutical", ticker: "TAK", revenue: 29.8, hq: "Tokyo", employees: 50000, pipeline: 62 },
      { name: "Astellas Pharma", ticker: "ALPM", revenue: 14.8, hq: "Tokyo", employees: 14500, pipeline: 38 },
      { name: "Eisai Co Ltd", ticker: "4523.T", revenue: 7.6, hq: "Tokyo", employees: 11500, pipeline: 28 },
      { name: "Daiichi Sankyo", ticker: "4568.T", revenue: 12.4, hq: "Tokyo", employees: 17000, pipeline: 44 },
    ],
    topDiseases: [
      { name: "Hypertension", patients: 43000, marketSize: 8.4, growth: "+1.2%" },
      { name: "Diabetes", patients: 11000, marketSize: 11.2, growth: "+2.8%" },
      { name: "Oncology", patients: 4800, marketSize: 14.8, growth: "+7.2%" },
      { name: "Atopic Dermatitis", patients: 3200, marketSize: 2.8, growth: "+11.4%" },
      { name: "Dementia/Alzheimer's", patients: 6200, marketSize: 3.1, growth: "+15.8%" },
    ],
    recentDeals: [
      { type: "Co-Dev", parties: "AstraZeneca + Daiichi Sankyo", value: 6000, date: "Feb-2026", drug: "ADC portfolio (global)" },
      { type: "License", parties: "Takeda → Nimbus Therapeutics", value: 4000, date: "Dec-2025", drug: "NDI-034858 (TYK2)" },
    ],
    pricingPolicy: "NHI price listing; biannual price revisions (Apr/Oct); drug price cuts average 5-7% per revision; Innovation premium for SAKIGAKE",
    reimbursementSystem: "National Health Insurance (NHI) — universal coverage; employment-based, community-based, and elderly systems",
    patentExtension: "Patent Term Extension up to 5 years; Re-examination period 8-10 years (new chemical entity)",
    regulatoryTimeline: "Standard: 12 months; Priority: 9 months; SAKIGAKE Breakthrough: 6 months with rolling review",
    keyRegulations: ["Pharmaceutical and Medical Device Act (PMD Act)", "SAKIGAKE Designation System", "NHI Pricing System", "GP Promotion Policy"],
    marketAccess: "Moderate — NHI covers all; biannual price cuts challenging; drug lag reducing with SAKIGAKE",
    manufacturingSites: 328,
    exportValue: 9.2,
    importValue: 32.8,
    topExportDrugs: ["Velcade", "Entyvio", "Xtandi", "Enhertu", "Alunbrig"],
    newsItems: [
      { date: "15-Apr-2026", headline: "PMDA Approves Lecanemab Label Expansion to MCI in Japan", category: "Approval", priority: "High" },
      { date: "01-Apr-2026", headline: "Japan NHI Price Revision: Average -5.1% Drug Price Cut April 2026", category: "Policy", priority: "High" },
    ],
  },
  {
    id: 4, name: "China", iso: "CN", flag: "🇨🇳",
    region: "Asia Pacific", subRegion: "Eastern Asia",
    regulator: "NMPA", regulatorFull: "National Medical Products Administration",
    regulatorUrl: "https://www.nmpa.gov.cn",
    currency: "CNY", gdp: 17794, healthcareSpend: 1.02,
    healthcareSpendPct: 5.7, population: 1409.7,
    approvedDrugs: 3800, activeTrials: 12400, companiesHQ: 620,
    marketSize2024: 152.6, marketSize2030: 218.4, cagr: 6.2,
    genericPenetration: "78%", biosimilarPenetration: "41%",
    patientAccessScore: 6.2, innovationIndex: 7.1,
    approvalPathways: ["NMPA Standard", "Priority Review", "Breakthrough Therapy Designation", "Conditional Approval", "Special Review (VBP)"],
    topTherapyAreas: ["Oncology", "Cardiology", "Infectious Disease", "Respiratory", "Neurology"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi China", date: "18-Jun-2020", indication: "Atopic Dermatitis", pathway: "NMPA Priority" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD China", date: "19-Jul-2018", indication: "Unresectable Melanoma", pathway: "NMPA Priority" },
      { drug: "sintilimab", brand: "Tyvyt", company: "Innovent Biologics", date: "27-Dec-2018", indication: "Classical Hodgkin Lymphoma", pathway: "NMPA Priority" },
      { drug: "tislelizumab", brand: "Brukinsa", company: "BeiGene", date: "03-Jan-2022", indication: "PD-L1+ NSCLC", pathway: "NMPA Conditional" },
    ],
    activeTrialsList: [
      { nctId: "NCT05001685", title: "CM310 Phase II in Atopic Dermatitis (China)", phase: "Phase II", sponsor: "Keymed Biosciences", status: "Recruiting", enrolled: 180 },
      { nctId: "NCT04146363", title: "LY3300054 (LY-CoV555) COVID study", phase: "Phase III", sponsor: "BeiGene", status: "Completed", enrolled: 1200 },
    ],
    trialSites: [
      { name: "Peking Union Medical College Hospital", city: "Beijing", state: "Beijing", trials: 542 },
      { name: "Zhongshan Hospital Fudan University", city: "Shanghai", state: "Shanghai", trials: 481 },
      { name: "West China Hospital", city: "Chengdu", state: "Sichuan", trials: 418 },
      { name: "Sun Yat-sen University Cancer Center", city: "Guangzhou", state: "Guangdong", trials: 364 },
    ],
    topCompanies: [
      { name: "Jiangsu Hengrui Medicine", ticker: "600276.SS", revenue: 4.8, hq: "Lianyungang", employees: 28000, pipeline: 84 },
      { name: "BeiGene", ticker: "BGNE", revenue: 3.2, hq: "Beijing", employees: 12000, pipeline: 48 },
      { name: "Innovent Biologics", ticker: "1801.HK", revenue: 1.4, hq: "Suzhou", employees: 4800, pipeline: 36 },
      { name: "Zymeworks (China ops)", ticker: "ZYME", revenue: 0.8, hq: "Shanghai", employees: 2100, pipeline: 18 },
    ],
    topDiseases: [
      { name: "Hypertension", patients: 244000, marketSize: 18.4, growth: "+4.2%" },
      { name: "Diabetes", patients: 141000, marketSize: 22.8, growth: "+7.1%" },
      { name: "Oncology", patients: 18400, marketSize: 32.4, growth: "+11.8%" },
      { name: "Hepatitis B", patients: 86000, marketSize: 4.2, growth: "+2.1%" },
      { name: "COPD", patients: 100000, marketSize: 6.8, growth: "+5.4%" },
    ],
    recentDeals: [
      { type: "License", parties: "AstraZeneca ← Keymed Biosciences", value: 1850, date: "Apr-2026", drug: "CM310 (ex-China)" },
      { type: "Co-Dev", parties: "Roche + Hengrui", value: 1100, date: "Mar-2026", drug: "HRS-7535 (GLP-1)" },
    ],
    pricingPolicy: "NRDL (National Reimbursement Drug List) annual negotiation; VBP (Volume-Based Procurement) competitive bidding; price cuts 30-90%",
    reimbursementSystem: "Basic Medical Insurance (BMI) — UEBMI (urban employed) & URRBMI (urban/rural residents); national pooling since 2018",
    patentExtension: "Patent Term Compensation up to 5 years (since 2021 patent law amendment); data protection 6-12 years",
    regulatoryTimeline: "Standard: 12-24 months; Priority Review: 130 working days; Breakthrough: accelerated rolling",
    keyRegulations: ["Drug Administration Law (2019)", "ICH Guidelines adopted (2017)", "Priority Review Policy", "VBP Centralized Procurement", "NRDL Annual Negotiation"],
    marketAccess: "Moderate — large patient population; aggressive price negotiation via NRDL/VBP; growing innovative drug access",
    manufacturingSites: 1284,
    exportValue: 22.4,
    importValue: 48.6,
    topExportDrugs: ["APIs", "Generics", "Biosimilars", "Sintilimab", "Tislelizumab"],
    newsItems: [
      { date: "10-Apr-2026", headline: "NMPA Grants Priority Review for BeiGene BTK Inhibitor Zanubrutinib", category: "Designation", priority: "Medium" },
      { date: "01-Apr-2026", headline: "China VBP Round 11: 42 Drugs Selected, Average Price Cut 68%", category: "Policy", priority: "High" },
    ],
  },
  {
    id: 5, name: "India", iso: "IN", flag: "🇮🇳",
    region: "Asia Pacific", subRegion: "Southern Asia",
    regulator: "CDSCO", regulatorFull: "Central Drugs Standard Control Organisation",
    regulatorUrl: "https://cdsco.gov.in",
    currency: "INR", gdp: 3730, healthcareSpend: 0.07,
    healthcareSpendPct: 3.2, population: 1428.6,
    approvedDrugs: 2200, activeTrials: 3800, companiesHQ: 480,
    marketSize2024: 28.4, marketSize2030: 48.2, cagr: 9.2,
    genericPenetration: "96%", biosimilarPenetration: "24%",
    patientAccessScore: 5.4, innovationIndex: 5.8,
    approvalPathways: ["CDSCO Standard", "Fast Track Approval", "Accelerated Approval", "Restricted New Drug Approval", "Waiver (global approval)"],
    topTherapyAreas: ["Infectious Disease", "Cardiovascular", "Diabetes", "Oncology", "Respiratory"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi India", date: "2020", indication: "Atopic Dermatitis (Adult)", pathway: "CDSCO Standard" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD India", date: "2018", indication: "Unresectable Melanoma", pathway: "CDSCO Standard" },
      { drug: "semaglutide", brand: "Ozempic", company: "Novo Nordisk India", date: "2023", indication: "Type 2 Diabetes", pathway: "CDSCO Standard" },
      { drug: "trastuzumab biosimilar", brand: "Hertraz", company: "Mylan/Biocon", date: "2014", indication: "HER2+ Breast Cancer", pathway: "CDSCO Biosimilar" },
    ],
    activeTrialsList: [
      { nctId: "NCT04146363", title: "Lebrikizumab in Atopic Dermatitis (India cohort)", phase: "Phase III", sponsor: "Eli Lilly India", status: "Completed", enrolled: 240 },
      { nctId: "NCT04939949", title: "BCD-085 (IL-17 inh) in Ankylosing Spondylitis", phase: "Phase III", sponsor: "Biocad India", status: "Recruiting", enrolled: 180 },
    ],
    trialSites: [
      { name: "AIIMS New Delhi", city: "New Delhi", state: "Delhi", trials: 312 },
      { name: "Tata Memorial Centre", city: "Mumbai", state: "Maharashtra", trials: 248 },
      { name: "PGIMER Chandigarh", city: "Chandigarh", state: "Punjab", trials: 184 },
      { name: "Christian Medical College", city: "Vellore", state: "Tamil Nadu", trials: 162 },
    ],
    topCompanies: [
      { name: "Sun Pharmaceutical", ticker: "SUNPHARMA", revenue: 5.2, hq: "Mumbai", employees: 40000, pipeline: 38 },
      { name: "Dr. Reddy's Laboratories", ticker: "RDY", revenue: 3.4, hq: "Hyderabad", employees: 24000, pipeline: 28 },
      { name: "Cipla Limited", ticker: "CIPLA", revenue: 2.8, hq: "Mumbai", employees: 25000, pipeline: 22 },
      { name: "Biocon Limited", ticker: "BIOCON", revenue: 1.6, hq: "Bangalore", employees: 11000, pipeline: 32 },
    ],
    topDiseases: [
      { name: "Tuberculosis", patients: 2800, marketSize: 0.8, growth: "+2.1%" },
      { name: "Diabetes", patients: 101000, marketSize: 5.8, growth: "+8.4%" },
      { name: "Cardiovascular", patients: 54000, marketSize: 4.2, growth: "+6.2%" },
      { name: "Malaria", patients: 8200, marketSize: 0.4, growth: "-1.2%" },
      { name: "Oncology", patients: 4400, marketSize: 4.8, growth: "+12.1%" },
    ],
    recentDeals: [
      { type: "License", parties: "Cipla ← Enochian Biosciences", value: 180, date: "Feb-2026", drug: "ENOB-HV-01" },
      { type: "M&A", parties: "Sun Pharma → Concert Pharmaceuticals India ops", value: 320, date: "Jan-2026", drug: "Deuruxolitinib" },
    ],
    pricingPolicy: "DPCO (Drug Price Control Order): essential medicines price-controlled; non-essential market-based; Jan Aushadhi generic scheme",
    reimbursementSystem: "Ayushman Bharat (AB-PMJAY): government scheme for BPL families; CGHS for government employees; largely OOP (60%+)",
    patentExtension: "No SPC; Section 3(d) prevents evergreening; compulsory licensing provisions; 5-yr data protection",
    regulatoryTimeline: "Standard: 12-18 months; accelerated: 6 months for orphan/rare disease; waiver for globally approved drugs",
    keyRegulations: ["Drugs and Cosmetics Act", "DPCO 2013", "New Drugs and Clinical Trials Rules 2019", "Section 3(d) Patents Act", "PLI Scheme for Pharma"],
    marketAccess: "Moderate — large generic market; price controls; growing branded generics; limited biologic reimbursement",
    manufacturingSites: 2184,
    exportValue: 26.8,
    importValue: 8.4,
    topExportDrugs: ["Generic formulations", "APIs", "Biosimilars", "Vaccines", "Paracetamol"],
    newsItems: [
      { date: "22-Apr-2026", headline: "CDSCO Approves Biocon Biosimilar Ustekinumab (Canbi) for Plaque Psoriasis", category: "Approval", priority: "Medium" },
      { date: "08-Apr-2026", headline: "India PLI Scheme Phase II: ₹15,000 Cr for Advanced Pharma Manufacturing", category: "Policy", priority: "High" },
    ],
  },
  {
    id: 6, name: "United Kingdom", iso: "GB", flag: "🇬🇧",
    region: "Europe", subRegion: "Northern Europe",
    regulator: "MHRA", regulatorFull: "Medicines and Healthcare products Regulatory Agency",
    regulatorUrl: "https://www.gov.uk/mhra",
    currency: "GBP", gdp: 3089, healthcareSpend: 0.26,
    healthcareSpendPct: 12.0, population: 67.7,
    approvedDrugs: 3900, activeTrials: 7200, companiesHQ: 145,
    marketSize2024: 38.4, marketSize2030: 49.8, cagr: 4.4,
    genericPenetration: "87%", biosimilarPenetration: "58%",
    patientAccessScore: 7.6, innovationIndex: 8.8,
    approvalPathways: ["MHRA National", "MHRA Rolling Review", "European Reference", "ILAP (Innovative Licensing)", "Conditional Approval", "Project Orbis"],
    topTherapyAreas: ["Oncology", "Immunology", "Cardiovascular", "CNS", "Rare Disease"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi UK", date: "26-Sep-2017", indication: "Atopic Dermatitis", pathway: "EMA/MHRA" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD UK", date: "13-Jul-2015", indication: "Melanoma", pathway: "EMA/MHRA" },
      { drug: "lecanemab", brand: "Leqembi", company: "Eisai UK", date: "2025", indication: "Early Alzheimer's", pathway: "MHRA ILAP" },
    ],
    activeTrialsList: [
      { nctId: "NCT05946044", title: "Tezepelumab in Severe Asthma (UK sites)", phase: "Phase III", sponsor: "AstraZeneca", status: "Recruiting", enrolled: 140 },
      { nctId: "NCT04365387", title: "Nemolizumab Phase III UK Cohort", phase: "Phase III", sponsor: "Galderma", status: "Completed", enrolled: 220 },
    ],
    trialSites: [
      { name: "The Christie NHS Foundation Trust", city: "Manchester", state: "England", trials: 328 },
      { name: "Guy's and St Thomas' NHS", city: "London", state: "England", trials: 298 },
      { name: "Cambridge University Hospitals", city: "Cambridge", state: "England", trials: 241 },
      { name: "Edinburgh Royal Infirmary", city: "Edinburgh", state: "Scotland", trials: 184 },
    ],
    topCompanies: [
      { name: "AstraZeneca", ticker: "AZN", revenue: 54.1, hq: "Cambridge", employees: 89900, pipeline: 188 },
      { name: "GSK plc", ticker: "GSK", revenue: 38.7, hq: "Brentford", employees: 70000, pipeline: 74 },
    ],
    topDiseases: [
      { name: "Cardiovascular", patients: 14200, marketSize: 7.8, growth: "+3.2%" },
      { name: "Oncology", patients: 3800, marketSize: 8.4, growth: "+8.8%" },
      { name: "Diabetes", patients: 5800, marketSize: 4.8, growth: "+4.2%" },
      { name: "Atopic Dermatitis", patients: 3200, marketSize: 1.4, growth: "+11.2%" },
      { name: "Asthma", patients: 5600, marketSize: 2.8, growth: "+5.8%" },
    ],
    recentDeals: [
      { type: "Co-Dev", parties: "AstraZeneca + Daiichi Sankyo", value: 6000, date: "Feb-2026", drug: "ADC portfolio (global)" },
      { type: "M&A", parties: "GSK → IDRx Inc", value: 1150, date: "Mar-2026", drug: "IDRX-42" },
    ],
    pricingPolicy: "NICE HTA mandatory for NHS reimbursement; VPAS voluntary scheme for branded meds; Innovative Medicines Fund for cancer",
    reimbursementSystem: "NHS: universal, free at point of use; prescription charges ~£9.90/item (England); Scotland/Wales free",
    patentExtension: "SPC up to 5 years; Paediatric Extension 6 months; UK post-Brexit own SPC regime from 2025",
    regulatoryTimeline: "MHRA: 150-day standard; Rolling Review accelerated; ILAP: innovative timeline options",
    keyRegulations: ["Medicines Act 1968", "ILAP Framework (2021)", "NHS Long Term Plan", "VPAS 2024", "Life Sciences Vision 2021"],
    marketAccess: "High — NHS strong central payer; NICE often restrictive on price; ILAP improving access for innovative drugs",
    manufacturingSites: 284,
    exportValue: 42.1,
    importValue: 28.6,
    topExportDrugs: ["Seretide", "Epivir", "Tagrisso", "Fasenra", "Imfinzi"],
    newsItems: [
      { date: "18-Apr-2026", headline: "NICE Recommends Dupilumab for COPD via Managed Access Agreement", category: "Approval", priority: "High" },
      { date: "02-Apr-2026", headline: "MHRA Grants ILAP Designation to Novel Oral GLP-1 for Obesity", category: "Designation", priority: "Medium" },
    ],
  },
  {
    id: 7, name: "Brazil", iso: "BR", flag: "🇧🇷",
    region: "Latin America", subRegion: "South America",
    regulator: "ANVISA", regulatorFull: "National Health Surveillance Agency",
    regulatorUrl: "https://www.gov.br/anvisa",
    currency: "BRL", gdp: 2173, healthcareSpend: 0.12,
    healthcareSpendPct: 9.9, population: 215.3,
    approvedDrugs: 1800, activeTrials: 2200, companiesHQ: 82,
    marketSize2024: 32.8, marketSize2030: 48.4, cagr: 6.8,
    genericPenetration: "88%", biosimilarPenetration: "18%",
    patientAccessScore: 5.8, innovationIndex: 5.2,
    approvalPathways: ["ANVISA Standard", "Priority Review (PPP)", "Accelerated Review", "Specific Regulatory Framework", "Expanded Access"],
    topTherapyAreas: ["Infectious Disease", "Oncology", "Cardiovascular", "Diabetes", "Immunology"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi-Aventis Farmacêutica", date: "2020", indication: "Atopic Dermatitis", pathway: "ANVISA PPP" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD Brasil", date: "2018", indication: "Melanoma", pathway: "ANVISA PPP" },
      { drug: "semaglutide", brand: "Ozempic", company: "Novo Nordisk Brasil", date: "2021", indication: "Type 2 Diabetes", pathway: "ANVISA Standard" },
    ],
    activeTrialsList: [
      { nctId: "NCT04146363", title: "Lebrikizumab Phase III Brazil cohort", phase: "Phase III", sponsor: "Eli Lilly Brasil", status: "Completed", enrolled: 180 },
    ],
    trialSites: [
      { name: "Hospital das Clínicas FMUSP", city: "São Paulo", state: "SP", trials: 218 },
      { name: "INCA (Cancer Institute)", city: "Rio de Janeiro", state: "RJ", trials: 184 },
      { name: "Hospital de Clínicas UFPR", city: "Curitiba", state: "PR", trials: 142 },
    ],
    topCompanies: [
      { name: "Hypera Pharma", ticker: "HYPE3.SA", revenue: 2.4, hq: "São Paulo", employees: 7800, pipeline: 12 },
      { name: "EMS S.A.", ticker: "Private", revenue: 1.8, hq: "Hortolândia", employees: 6200, pipeline: 8 },
      { name: "Eurofarma", ticker: "Private", revenue: 1.4, hq: "São Paulo", employees: 5800, pipeline: 14 },
    ],
    topDiseases: [
      { name: "Cardiovascular", patients: 38000, marketSize: 6.8, growth: "+4.8%" },
      { name: "Diabetes", patients: 22000, marketSize: 7.2, growth: "+7.8%" },
      { name: "Hypertension", patients: 44000, marketSize: 3.8, growth: "+3.4%" },
      { name: "Oncology", patients: 4800, marketSize: 6.4, growth: "+10.2%" },
      { name: "Tropical Diseases", patients: 12000, marketSize: 1.2, growth: "+1.8%" },
    ],
    recentDeals: [
      { type: "License", parties: "Eurofarma ← AstraZeneca", value: 120, date: "Jan-2026", drug: "Brilinta (Brazil)" },
    ],
    pricingPolicy: "CMED price control; ICMS tax impact (8-12%); Farmácia Popular generic subsidy; SUS public procurement negotiations",
    reimbursementSystem: "SUS (Sistema Único de Saúde): universal public; Supplemental health insurance ~25% population; high OOP in private",
    patentExtension: "Pipeline patent protection; compulsory license precedents (ARVs); data exclusivity 10 years new drugs",
    regulatoryTimeline: "Standard: 365-730 days; PPP Priority: 120 days; accelerated (orphan): 60 days",
    keyRegulations: ["ANVISA Resolution RDC 204/2017", "PPP Priority Review Policy", "Lei 9.782/1999", "Compulsory License Decree 6.108/2007"],
    marketAccess: "Moderate — large population; SUS limits branded drug access; private insurance growing; biosimilar uptake low",
    manufacturingSites: 364,
    exportValue: 2.8,
    importValue: 12.4,
    topExportDrugs: ["Generics", "APIs", "OTC products"],
    newsItems: [
      { date: "12-Apr-2026", headline: "ANVISA Approves Dupilumab for COPD Following FDA/EMA", category: "Approval", priority: "Medium" },
      { date: "05-Apr-2026", headline: "Brazil SUS to Include Lecanemab in 2027 Budget Planning", category: "Policy", priority: "Low" },
    ],
  },
  {
    id: 8, name: "Australia", iso: "AU", flag: "🇦🇺",
    region: "Oceania", subRegion: "Australia and New Zealand",
    regulator: "TGA", regulatorFull: "Therapeutic Goods Administration",
    regulatorUrl: "https://www.tga.gov.au",
    currency: "AUD", gdp: 1716, healthcareSpend: 0.12,
    healthcareSpendPct: 10.7, population: 26.5,
    approvedDrugs: 2400, activeTrials: 3100, companiesHQ: 48,
    marketSize2024: 14.8, marketSize2030: 19.4, cagr: 4.6,
    genericPenetration: "85%", biosimilarPenetration: "44%",
    patientAccessScore: 7.9, innovationIndex: 7.6,
    approvalPathways: ["TGA Standard", "TGA Priority Review", "Provisional Approval", "Project Orbis", "Australian Specific", "TGA Bioequivalence"],
    topTherapyAreas: ["Oncology", "Cardiovascular", "Immunology", "Rare Disease", "Respiratory"],
    recentApprovals: [
      { drug: "dupilumab", brand: "Dupixent", company: "Sanofi-Aventis Australia", date: "24-Jan-2018", indication: "Atopic Dermatitis", pathway: "TGA Standard" },
      { drug: "pembrolizumab", brand: "Keytruda", company: "MSD Australia", date: "29-Jul-2015", indication: "Melanoma", pathway: "TGA Priority" },
      { drug: "tezepelumab", brand: "Tezspire", company: "AstraZeneca Australia", date: "2022", indication: "Severe Asthma", pathway: "TGA Priority" },
    ],
    activeTrialsList: [
      { nctId: "NCT05946044", title: "Tezepelumab Phase III (Australia sites)", phase: "Phase III", sponsor: "AstraZeneca", status: "Recruiting", enrolled: 90 },
      { nctId: "NCT01295827", title: "KEYNOTE-001 Australian sites", phase: "Phase I", sponsor: "MSD", status: "Terminated", enrolled: 84 },
    ],
    trialSites: [
      { name: "Peter MacCallum Cancer Centre", city: "Melbourne", state: "VIC", trials: 281 },
      { name: "Chris O'Brien Lifehouse", city: "Sydney", state: "NSW", trials: 224 },
      { name: "Royal Brisbane Women's Hospital", city: "Brisbane", state: "QLD", trials: 184 },
      { name: "University of Sydney", city: "Sydney", state: "NSW", trials: 162 },
    ],
    topCompanies: [
      { name: "CSL Limited", ticker: "CSL.AX", revenue: 13.3, hq: "Melbourne", employees: 32000, pipeline: 32 },
      { name: "Sigma Healthcare", ticker: "SIG.AX", revenue: 3.2, hq: "Melbourne", employees: 2800, pipeline: 4 },
    ],
    topDiseases: [
      { name: "Cardiovascular", patients: 4800, marketSize: 3.2, growth: "+3.4%" },
      { name: "Oncology", patients: 1480, marketSize: 3.8, growth: "+9.2%" },
      { name: "Atopic Dermatitis", patients: 1200, marketSize: 0.6, growth: "+12.4%" },
      { name: "Diabetes", patients: 1800, marketSize: 2.4, growth: "+4.8%" },
      { name: "Asthma", patients: 2800, marketSize: 1.2, growth: "+5.4%" },
    ],
    recentDeals: [
      { type: "Co-Dev", parties: "CSL + IMV Inc", value: 420, date: "Dec-2025", drug: "DPX-COVID-19 vaccine" },
    ],
    pricingPolicy: "PBS (Pharmaceutical Benefits Scheme) negotiated listing; PBAC cost-effectiveness assessment; Life Saving Drugs Program for rare disease",
    reimbursementSystem: "PBS: subsidized prescriptions for all residents; Medicare: universal; DVA for veterans; private health insurance supplemental",
    patentExtension: "Extensions of Term (SPC equivalent) up to 5 years; AUSFTA extensions for delay; paediatric studies no extension",
    regulatoryTimeline: "TGA standard: 255 days; Priority: 150 days; Provisional: rolling from Phase II; Project Orbis: concurrent",
    keyRegulations: ["Therapeutic Goods Act 1989", "PBS Act", "PBAC Guidelines", "TGA Provisional Approval 2018", "Project Orbis AU participation"],
    marketAccess: "High — PBS strong reimbursement; PBAC can be restrictive; Project Orbis enabling earlier access for oncology",
    manufacturingSites: 84,
    exportValue: 8.4,
    importValue: 7.2,
    topExportDrugs: ["CSL Behring products", "Immunoglobulins", "Coagulation factors", "Influenza vaccines"],
    newsItems: [
      { date: "10-Apr-2026", headline: "TGA Provisional Approval for Novel CAR-T Therapy in Relapsed DLBCL", category: "Approval", priority: "High" },
      { date: "01-Apr-2026", headline: "PBAC Recommends PBS Listing for Dupilumab in COPD at Agreed Price", category: "Policy", priority: "High" },
    ],
  },
];

// ─── DISEASE DATA ─────────────────────────────────────────────────────────────
const DISEASES = [
  { id: 1, name: "Atopic Dermatitis", aliases: "Eczema, AD", icd10: "L20", meshId: "D003876", prevalence: "223M", incidence: "~15M/yr", therapyArea: "Dermatology", category: "Inflammatory", unmetNeed: "High", marketSize2024: 11.4, marketSize2030: 24.8, cagr: 13.8, keyDrugs: ["dupilumab","tralokinumab","lebrikizumab"], keyTrials: 312, keyCompanies: ["Sanofi","Abbvie","Eli Lilly"], description: "Atopic dermatitis is a chronic inflammatory skin disease characterized by intense pruritus and eczematous lesions, driven by Th2-mediated immune dysregulation and barrier dysfunction." },
  { id: 2, name: "Non-Small Cell Lung Cancer", aliases: "NSCLC", icd10: "C34", meshId: "D002289", prevalence: "3.2M", incidence: "2.1M/yr", therapyArea: "Oncology", category: "Oncology", unmetNeed: "Very High", marketSize2024: 28.6, marketSize2030: 52.1, cagr: 10.6, keyDrugs: ["pembrolizumab","osimertinib","nivolumab"], keyTrials: 1847, keyCompanies: ["Merck","AstraZeneca","BMS"], description: "NSCLC accounts for ~85% of all lung cancers. Advances in targeted therapy and immunotherapy have significantly improved outcomes, though resistance remains a major challenge." },
  { id: 3, name: "Type 2 Diabetes", aliases: "T2DM, DM2", icd10: "E11", meshId: "D003924", prevalence: "537M", incidence: "~14M/yr", therapyArea: "Endocrinology", category: "Metabolic", unmetNeed: "High", marketSize2024: 65.2, marketSize2030: 96.3, cagr: 6.8, keyDrugs: ["semaglutide","tirzepatide","empagliflozin"], keyTrials: 4210, keyCompanies: ["Novo Nordisk","Eli Lilly","AstraZeneca"], description: "Type 2 diabetes is a metabolic disorder characterized by hyperglycemia due to insulin resistance. GLP-1 receptor agonists have transformed the treatment landscape, with cardiovascular and renal benefits." },
  { id: 4, name: "Alzheimer's Disease", aliases: "AD, Dementia", icd10: "G30", meshId: "D000544", prevalence: "55M", incidence: "~10M/yr", therapyArea: "Neurology", category: "Neurological", unmetNeed: "Very High", marketSize2024: 8.9, marketSize2030: 23.4, cagr: 17.5, keyDrugs: ["lecanemab","donanemab","aducanumab"], keyTrials: 893, keyCompanies: ["Eisai","Biogen","Eli Lilly"], description: "Alzheimer's disease is the leading cause of dementia, characterized by amyloid plaques and neurofibrillary tangles. Anti-amyloid therapies represent a new era of disease-modifying treatment." },
  { id: 5, name: "Asthma", aliases: "Bronchial Asthma", icd10: "J45", meshId: "D001249", prevalence: "262M", incidence: "~7M/yr", therapyArea: "Respiratory", category: "Inflammatory", unmetNeed: "Moderate", marketSize2024: 22.1, marketSize2030: 35.7, cagr: 8.2, keyDrugs: ["dupilumab","tezepelumab","benralizumab"], keyTrials: 2156, keyCompanies: ["AstraZeneca","Sanofi","GSK"], description: "Asthma is a chronic airway disease driven by type 2 inflammation. Biologic therapies targeting IgE, IL-5, IL-4/13, and TSLP have revolutionized severe asthma management." },
  { id: 6, name: "COPD", aliases: "Chronic Obstructive Pulmonary Disease", icd10: "J44", meshId: "D029424", prevalence: "391M", incidence: "~3M deaths/yr", therapyArea: "Respiratory", category: "Inflammatory", unmetNeed: "High", marketSize2024: 16.8, marketSize2030: 26.2, cagr: 7.7, keyDrugs: ["dupilumab","ensifentrine","itepekimab"], keyTrials: 1423, keyCompanies: ["Sanofi","AstraZeneca","Verona Pharma"], description: "COPD is a progressive inflammatory airway disease driven by environmental exposures. Dupilumab approval in 2024 marked the first biologic for COPD with type 2 inflammation." },
];

const PIPELINE_DATA = {
  "Atopic Dermatitis": [
    { drug: "dupilumab", company: "Sanofi/Regeneron", mechanism: "IL-4Rα Antagonist", phase: "Approved", indication: "Atopic Dermatitis (Adult & Ped)", status: "Commercialized", geographies: "Global", nctId: "NCT03836196" },
    { drug: "tralokinumab", company: "Abbvie (LEO Pharma)", mechanism: "IL-13 Inhibitor", phase: "Approved", indication: "Moderate-Severe AD (Adult)", status: "Commercialized", geographies: "US/EU", nctId: "NCT03679871" },
    { drug: "lebrikizumab", company: "Eli Lilly", mechanism: "IL-13 Inhibitor", phase: "Approved", indication: "Moderate-Severe AD", status: "Commercialized", geographies: "US/EU", nctId: "NCT04146363" },
    { drug: "nemolizumab", company: "Galderma", mechanism: "IL-31Rα Inhibitor", phase: "Approved", indication: "AD with Prurigo Nodularis", status: "Commercialized", geographies: "US", nctId: "NCT04365387" },
    { drug: "amlitelimab", company: "Sanofi", mechanism: "OX40L Inhibitor", phase: "Phase III", indication: "Moderate-Severe AD", status: "NDA Filed", geographies: "Global", nctId: "NCT04598269" },
    { drug: "povorcitinib", company: "Incyte", mechanism: "JAK1 Inhibitor", phase: "Phase III", indication: "AD (Oral)", status: "Phase III ongoing", geographies: "Global", nctId: "NCT04801576" },
    { drug: "orismilast", company: "Arcutis Biotherapeutics", mechanism: "PDE4 Inhibitor", phase: "Phase III", indication: "AD (Topical)", status: "Phase III ongoing", geographies: "US", nctId: "NCT04427722" },
    { drug: "CM310", company: "Keymed Biosciences", mechanism: "IL-4Rα Antagonist", phase: "Phase II", indication: "Moderate-Severe AD (China)", status: "Phase II ongoing", geographies: "China", nctId: "NCT05001685" },
  ],
  "NSCLC": [
    { drug: "pembrolizumab", company: "Merck & Co", mechanism: "PD-1 Inhibitor", phase: "Approved", indication: "NSCLC (1L/2L, various biomarkers)", status: "Commercialized", geographies: "Global", nctId: "NCT02142738" },
    { drug: "osimertinib", company: "AstraZeneca", mechanism: "EGFR T790M Inhibitor", phase: "Approved", indication: "EGFR-mutant NSCLC", status: "Commercialized", geographies: "Global", nctId: "NCT02151981" },
    { drug: "nivolumab", company: "BMS", mechanism: "PD-1 Inhibitor", phase: "Approved", indication: "NSCLC (2L, squamous)", status: "Commercialized", geographies: "Global", nctId: "NCT01673867" },
    { drug: "tarlatamab", company: "Amgen", mechanism: "DLL3 x CD3 BiTE", phase: "Approved", indication: "SCLC (2L)", status: "Commercialized", geographies: "US", nctId: "NCT04939949" },
    { drug: "lazertinib + amivantamab", company: "J&J", mechanism: "EGFR+MET Bispecific", phase: "Phase III", indication: "EGFR Ex20ins NSCLC", status: "Phase III ongoing", geographies: "Global", nctId: "NCT04077463" },
  ],
  "Type 2 Diabetes": [
    { drug: "semaglutide", company: "Novo Nordisk", mechanism: "GLP-1 RA", phase: "Approved", indication: "T2DM + Obesity", status: "Commercialized", geographies: "Global", nctId: "NCT01813565" },
    { drug: "tirzepatide", company: "Eli Lilly", mechanism: "GIP/GLP-1 RA", phase: "Approved", indication: "T2DM + Obesity", status: "Commercialized", geographies: "Global", nctId: "NCT03954834" },
    { drug: "retatrutide", company: "Eli Lilly", mechanism: "GIP/GLP-1/Glucagon RA", phase: "Phase III", indication: "Obesity", status: "Phase III ongoing", geographies: "Global", nctId: "NCT04881760" },
    { drug: "orforglipron", company: "Eli Lilly", mechanism: "Oral GLP-1 RA", phase: "Phase III", indication: "T2DM + Obesity", status: "Phase III ongoing", geographies: "Global", nctId: "NCT05048719" },
  ],
};

const EPIDEMIOLOGY = [
  { disease: "Atopic Dermatitis", region: "Global", prevalence: 223, incidence: 15.2, mortality: 0, daly: 43200, year: 2024, prevalencePct: "2.8%", pediatricPct: "65%", adultPct: "35%", topCountries: [{ country: "India", cases: 42 }, { country: "China", cases: 38 }, { country: "USA", cases: 29 }, { country: "Brazil", cases: 18 }, { country: "Indonesia", cases: 15 }], marketSize: [{ year: 2021, size: 7.2 }, { year: 2022, size: 8.9 }, { year: 2023, size: 10.1 }, { year: 2024, size: 11.4 }, { year: 2025, size: 13.8 }, { year: 2026, size: 16.4 }, { year: 2028, size: 20.1 }, { year: 2030, size: 24.8 }] },
  { disease: "NSCLC", region: "Global", prevalence: 3200, incidence: 2100, mortality: 1800, daly: 12100000, year: 2024, prevalencePct: "N/A", pediatricPct: "0%", adultPct: "100%", topCountries: [{ country: "China", cases: 780 }, { country: "USA", cases: 230 }, { country: "EU", cases: 320 }, { country: "Japan", cases: 120 }, { country: "India", cases: 70 }], marketSize: [{ year: 2021, size: 18.2 }, { year: 2022, size: 21.4 }, { year: 2023, size: 25.1 }, { year: 2024, size: 28.6 }, { year: 2025, size: 33.1 }, { year: 2026, size: 37.8 }, { year: 2028, size: 45.2 }, { year: 2030, size: 52.1 }] },
  { disease: "Type 2 Diabetes", region: "Global", prevalence: 537000, incidence: 14000, mortality: 1500, daly: 66800000, year: 2024, prevalencePct: "6.7%", pediatricPct: "2%", adultPct: "98%", topCountries: [{ country: "China", cases: 141000 }, { country: "India", cases: 101000 }, { country: "USA", cases: 37000 }, { country: "Pakistan", cases: 31000 }, { country: "Brazil", cases: 22000 }], marketSize: [{ year: 2021, size: 45.1 }, { year: 2022, size: 52.4 }, { year: 2023, size: 58.8 }, { year: 2024, size: 65.2 }, { year: 2025, size: 72.8 }, { year: 2026, size: 80.1 }, { year: 2028, size: 88.4 }, { year: 2030, size: 96.3 }] },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0A1628;
    --navy-mid: #122040;
    --blue: #1A56DB;
    --blue-light: #EBF3FF;
    --blue-mid: #3B82F6;
    --accent: #06B6D4;
    --accent-light: #E0F9FD;
    --teal: #0D9488;
    --amber: #D97706;
    --amber-light: #FEF3C7;
    --green: #059669;
    --green-light: #D1FAE5;
    --red: #DC2626;
    --red-light: #FEE2E2;
    --purple: #7C3AED;
    --purple-light: #EDE9FE;
    --orange: #D4580A;
    --orange-light: #FEF0E6;
    --gray-50: #F8FAFC;
    --gray-100: #F1F5F9;
    --gray-200: #E2E8F0;
    --gray-300: #CBD5E1;
    --gray-400: #94A3B8;
    --gray-500: #64748B;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1E293B;
    --gray-900: #0F172A;
    --white: #FFFFFF;
    --font-display: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 24px;
  }

  body { font-family: var(--font-body); background: var(--gray-50); color: var(--gray-800); }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 3px; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── TOP NAV ── */
  .topnav {
    background: var(--navy);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    height: 56px;
    gap: 2rem;
    position: sticky;
    top: 0;
    z-index: 200;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .topnav-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; cursor: pointer;
    border: none; background: none;
  }
  .topnav-logo-mark {
    width: 32px; height: 32px; background: var(--blue); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .topnav-logo-mark svg { width: 18px; height: 18px; }
  .topnav-brand { font-family: var(--font-display); font-size: 18px; color: var(--white); letter-spacing: -0.3px; }
  .topnav-brand span { color: var(--accent); }
  .topnav-links { display: flex; gap: 0; margin-left: auto; }
  .topnav-link {
    color: var(--gray-300); font-size: 13px; padding: 0 14px; height: 56px;
    display: flex; align-items: center; text-decoration: none; border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s; font-weight: 400; cursor: pointer;
    background: none; border-top: none; border-left: none; border-right: none;
    font-family: var(--font-body);
  }
  .topnav-link:hover { color: var(--white); }
  .topnav-link.active { color: var(--white); border-bottom-color: var(--accent); font-weight: 500; }

  /* ── SUBTABS BAR ── */
  .subtabs-bar {
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
    padding: 0 2rem;
    display: flex;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
    position: sticky;
    top: 56px;
    z-index: 150;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .subtabs-bar::-webkit-scrollbar { display: none; }
  .stab {
    font-size: 12px;
    font-weight: 500;
    padding: 11px 16px;
    white-space: nowrap;
    cursor: pointer;
    border: none;
    background: none;
    font-family: var(--font-body);
    color: var(--gray-500);
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
  }
  .stab:hover { color: var(--gray-800); }
  .stab.active { color: var(--blue); border-bottom-color: var(--blue); }

  .page-content { flex: 1; padding: 1.5rem 2rem; }

  .toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 1rem; flex-wrap: wrap;
  }
  .toolbar-info {
    font-size: 12px; color: var(--gray-500);
    background: var(--gray-100); border-radius: var(--radius-sm);
    padding: 5px 12px; border: 1px solid var(--gray-200);
  }
  .toolbar-info strong { color: var(--gray-700); }
  .search-box {
    display: flex; align-items: center; gap: 8px;
    background: var(--white); border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm); padding: 6px 12px;
    flex: 1; max-width: 320px; transition: border-color 0.15s;
  }
  .search-box:focus-within { border-color: var(--blue); }
  .search-box input {
    border: none; outline: none; font-size: 13px; font-family: var(--font-body);
    color: var(--gray-700); background: transparent; width: 100%;
  }
  .search-box input::placeholder { color: var(--gray-400); }
  .search-icon { color: var(--gray-400); flex-shrink: 0; }
  .filter-select {
    font-size: 12px; padding: 6px 10px; border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm); background: var(--white); color: var(--gray-600);
    font-family: var(--font-body); cursor: pointer; outline: none;
  }
  .filter-select:focus { border-color: var(--blue); }
  .btn-cols {
    margin-left: auto; display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--gray-500); padding: 6px 12px;
    background: var(--white); border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-body);
  }
  .pg-controls { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--gray-500); }
  .pg-sel {
    padding: 4px 8px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
    font-size: 11px; font-family: var(--font-body); background: var(--white); color: var(--gray-600);
  }
  .pg-btn {
    height: 26px; min-width: 26px; display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--gray-200); border-radius: var(--radius-sm); background: var(--white);
    cursor: pointer; font-size: 11px; color: var(--gray-500); font-family: var(--font-body);
    padding: 0 6px; transition: all 0.12s;
  }
  .pg-btn:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); }
  .pg-btn.active { background: var(--blue); color: white; border-color: var(--blue); }
  .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .table-container {
    background: var(--white); border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);
  }
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: var(--gray-50); }
  th {
    text-align: left; padding: 10px 14px; font-weight: 500;
    color: var(--gray-600); font-size: 12px; white-space: nowrap;
    border-bottom: 1px solid var(--gray-200); user-select: none;
  }
  .th-inner { display: flex; align-items: center; gap: 6px; }
  .th-actions { display: flex; align-items: center; gap: 2px; }
  .th-btn {
    background: none; border: none; cursor: pointer; padding: 2px 3px;
    color: var(--gray-400); border-radius: 3px; line-height: 1; transition: all 0.1s; font-size: 11px;
  }
  .th-btn:hover { background: var(--gray-200); color: var(--gray-600); }
  .th-btn.active-sort { color: var(--blue); }
  tbody tr { border-bottom: 1px solid var(--gray-100); transition: background 0.1s; animation: rowIn 0.25s ease both; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--blue-light); }
  td { padding: 10px 14px; color: var(--gray-700); white-space: nowrap; }
  @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .drug-link {
    color: var(--blue); font-weight: 500; text-decoration: none; cursor: pointer;
    background: none; border: none; font-size: 13px; font-family: var(--font-body);
    padding: 0; text-align: left; transition: color 0.15s;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .drug-link:hover { color: var(--navy); text-decoration: underline; }
  .drug-link-arrow { opacity: 0; font-size: 11px; transition: opacity 0.15s, transform 0.15s; }
  .drug-link:hover .drug-link-arrow { opacity: 1; transform: translateX(2px); }

  .nct-link {
    color: var(--blue); font-weight: 600; cursor: pointer; background: none; border: none;
    font-family: var(--font-body); font-size: 12px; padding: 0;
    display: inline-flex; align-items: center; gap: 4px; text-decoration: none; transition: color 0.15s;
  }
  .nct-link:hover { color: var(--navy); text-decoration: underline; }
  .nct-arrow { opacity: 0; font-size: 10px; transition: opacity 0.15s, transform 0.15s; }
  .nct-link:hover .nct-arrow { opacity: 1; transform: translateX(2px); }

  .badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 500; white-space: nowrap; }
  .badge-approved { background: var(--green-light); color: #065F46; }
  .badge-phase3 { background: var(--blue-light); color: #1D4ED8; }
  .badge-phase2 { background: var(--purple-light); color: var(--purple); }
  .badge-nme { background: var(--amber-light); color: #92400E; }
  .badge-biosimilar { background: #F3F4F6; color: var(--gray-600); }
  .badge-fic { background: var(--accent-light); color: #0E7490; }
  .b-completed { background: var(--green-light); color: #0D5C38; }
  .b-recruiting { background: var(--blue-light); color: #0040A0; }
  .b-terminated { background: var(--red-light); color: #9B1C1C; }
  .b-unknown { background: var(--gray-100); color: var(--gray-500); }
  .b-phase1 { background: var(--purple-light); color: var(--purple); }
  .b-phase2 { background: var(--accent-light); color: #086082; }
  .b-phase3 { background: var(--amber-light); color: var(--amber); }
  .b-industry { background: var(--blue-light); color: #0040A0; }
  .b-nih { background: var(--accent-light); color: var(--teal); }
  .b-other { background: var(--gray-100); color: var(--gray-500); }
  .b-bio { background: var(--green-light); color: #0D5C38; }
  .b-drug { background: var(--orange-light); color: var(--orange); }
  .b-device { background: var(--purple-light); color: var(--purple); }

  .pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-top: 1px solid var(--gray-100);
    font-size: 12px; color: var(--gray-500); flex-wrap: wrap; gap: 8px;
  }
  .pag-btns { display: flex; gap: 4px; }
  .pag-btn {
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
    background: var(--white); cursor: pointer; font-size: 12px; color: var(--gray-600);
    font-family: var(--font-body); transition: all 0.15s;
  }
  .pag-btn:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); }
  .pag-btn.active { background: var(--blue); border-color: var(--blue); color: var(--white); }
  .pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── PROFILE ── */
  .profile-page, .profile { animation: fadeUp 0.3s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  .profile-breadcrumb, .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--gray-500); margin-bottom: 1.25rem; flex-wrap: wrap;
  }
  .profile-breadcrumb button, .breadcrumb button {
    color: var(--blue); cursor: pointer; text-decoration: none; background: none; border: none;
    font-family: var(--font-body); font-size: 12px; padding: 0;
  }
  .profile-breadcrumb button:hover, .breadcrumb button:hover { text-decoration: underline; }
  .crumb-sep, .breadcrumb span { color: var(--gray-300); }

  .profile-header, .ph {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
    border-radius: var(--radius-xl); padding: 2rem 2.5rem; margin-bottom: 1.5rem;
    display: flex; gap: 2rem; align-items: flex-start;
    box-shadow: var(--shadow-lg); position: relative; overflow: hidden;
  }
  .profile-header::before, .ph::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .profile-avatar, .ph-icon {
    width: 72px; height: 72px; border-radius: 18px;
    background: rgba(26,86,219,0.4); display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);
  }
  .profile-avatar svg, .ph-icon svg { width: 36px; height: 36px; color: var(--accent); }
  .profile-title, .ph-body { flex: 1; }
  .ph-nct { font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; margin-bottom: 4px; }
  .profile-drug-name, .ph-title {
    font-family: var(--font-display); font-size: 24px; color: var(--white); line-height: 1.2; margin-bottom: 4px;
  }
  .profile-drug-name span { color: var(--accent); font-style: italic; }
  .ph-official { font-size: 11px; color: rgba(255,255,255,0.55); margin-bottom: 12px; font-style: italic; }
  .profile-subtitle { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
  .profile-badges, .ph-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .pbadge, .ph-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
  .pbadge-blue, .phb-blue { background: rgba(59,130,246,0.25); color: #93C5FD; border: 1px solid rgba(59,130,246,0.3); }
  .pbadge-teal, .phb-cyan { background: rgba(6,182,212,0.2); color: #67E8F9; border: 1px solid rgba(6,182,212,0.3); }
  .pbadge-amber, .phb-amber { background: rgba(217,119,6,0.2); color: #FCD34D; border: 1px solid rgba(217,119,6,0.3); }
  .pbadge-coral, .phb-red { background: rgba(220,38,38,0.2); color: #FCA5A5; border: 1px solid rgba(220,38,38,0.3); }
  .pbadge-purple { background: rgba(124,58,237,0.2); color: #C4B5FD; border: 1px solid rgba(124,58,237,0.3); }
  .phb-green { background: rgba(5,150,105,0.25); color: #6EE7B7; border: 1px solid rgba(5,150,105,0.35); }
  .ph-meta { z-index: 1; display: flex; flex-direction: column; gap: 8px; min-width: 180px; align-self: flex-start; }
  .ph-meta-item { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 8px 14px; }
  .ph-meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
  .ph-meta-val { font-size: 13px; font-weight: 500; color: white; }
  .ph-meta-val.positive { color: #6EE7B7; }
  .ph-meta-val.negative { color: #FCA5A5; }

  /* profile inner scroll-nav tabs — offset accounts for topnav (56) + subtabs (44) */
  .profile-tabs-wrapper {
    position: sticky; top: 100px; z-index: 100;
    background: var(--white); border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .profile-tabs {
    padding: 0 1.5rem; display: flex; gap: 0;
    overflow-x: auto; scrollbar-width: none;
  }
  .profile-tabs::-webkit-scrollbar { display: none; }
  .ptab {
    font-size: 13px; font-weight: 500; padding: 14px 18px;
    cursor: pointer; border: none; background: none;
    color: var(--gray-500); border-bottom: 2px solid transparent;
    font-family: var(--font-body); transition: all 0.2s; white-space: nowrap;
  }
  .ptab:hover { color: var(--gray-800); }
  .ptab.active { color: var(--blue); border-bottom-color: var(--blue); }
  .profile-body {
    background: var(--white); border: 1px solid var(--gray-200); border-top: none;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    padding: 0; margin-bottom: 1.5rem;
  }

  .profile-section { padding: 1.75rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
  .profile-section:last-child { border-bottom: none; }
  .section-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
  .section-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .section-icon.blue { background: var(--blue-light); }
  .section-icon.teal { background: var(--accent-light); }
  .section-icon.amber { background: var(--amber-light); }
  .section-icon.green { background: var(--green-light); }
  .section-icon.purple { background: var(--purple-light); }
  .section-icon.red { background: var(--red-light); }
  .section-icon.gray { background: var(--gray-100); }
  .section-label { font-size: 15px; font-weight: 600; color: var(--gray-800); }

  .info-grid, .ig { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }
  .info-card, .ic { background: var(--gray-50); border: 1px solid var(--gray-100); border-radius: var(--radius-md); padding: 12px 16px; }
  .info-label, .ic-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-400); margin-bottom: 4px; }
  .info-value, .ic-val { font-size: 13px; font-weight: 500; color: var(--gray-800); }

  .desc-box {
    background: var(--gray-50); border-left: 3px solid var(--blue);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    padding: 1rem 1.25rem; font-size: 13px; line-height: 1.7;
    color: var(--gray-600); margin-bottom: 1.5rem;
  }
  .section-heading, .sh {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--gray-400); font-weight: 500; margin-bottom: 0.75rem;
    padding-bottom: 8px; border-bottom: 1px solid var(--gray-100);
  }

  .profile-table, .pt { width: 100%; border-collapse: collapse; font-size: 12px; }
  .profile-table th, .pt th { background: var(--gray-50); padding: 8px 12px; text-align: left; font-weight: 500; color: var(--gray-500); font-size: 11px; border-bottom: 1px solid var(--gray-200); white-space: nowrap; }
  .profile-table td, .pt td { padding: 9px 12px; border-bottom: 1px solid var(--gray-100); color: var(--gray-700); vertical-align: top; }
  .profile-table tr:last-child td, .pt tr:last-child td { border-bottom: none; }
  .profile-table tr:hover td, .pt tr:hover td { background: var(--blue-light); }

  .sales-bars { display: flex; flex-direction: column; gap: 8px; }
  .sales-row { display: flex; align-items: center; gap: 10px; }
  .sales-year { font-size: 11px; color: var(--gray-400); width: 36px; flex-shrink: 0; text-align: right; }
  .sales-bar-track { flex: 1; background: var(--gray-100); border-radius: 4px; height: 18px; overflow: hidden; }
  .sales-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--blue) 0%, var(--accent) 100%); display: flex; align-items: center; padding-left: 8px; }
  .sales-val { font-size: 10px; color: var(--white); font-weight: 500; white-space: nowrap; }
  .sales-val-out { font-size: 11px; color: var(--gray-600); margin-left: 6px; }

  .desig-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .desig-pill { font-size: 11px; padding: 4px 12px; border-radius: 20px; border: 1px solid; font-weight: 500; }
  .desig-priority { background: var(--amber-light); color: #92400E; border-color: #FCD34D; }
  .desig-breakthrough { background: var(--purple-light); color: var(--purple); border-color: #C4B5FD; }
  .desig-orphan { background: var(--red-light); color: var(--red); border-color: #FCA5A5; }
  .desig-accelerated { background: var(--green-light); color: #065F46; border-color: #6EE7B7; }

  .empty-state, .empty { text-align: center; padding: 3rem 1rem; color: var(--gray-400); font-size: 14px; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  .conf-bar { display: flex; align-items: center; gap: 6px; }
  .conf-track { flex: 1; height: 4px; background: var(--gray-100); border-radius: 2px; overflow: hidden; }
  .conf-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--blue), var(--accent)); }
  .conf-num { font-size: 10px; color: var(--gray-500); width: 30px; text-align: right; }

  .flow-list { display: flex; flex-direction: column; gap: 0; }
  .flow-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--gray-100); }
  .flow-item:last-child { border-bottom: none; }
  .flow-num { font-size: 10px; color: var(--gray-400); width: 18px; text-align: right; flex-shrink: 0; }
  .flow-label { font-size: 12px; color: var(--gray-700); flex: 1; }
  .flow-track { width: 180px; height: 14px; background: var(--gray-100); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
  .flow-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--blue-mid), var(--accent)); }
  .flow-pct { font-size: 11px; font-weight: 500; color: var(--blue); width: 40px; text-align: right; flex-shrink: 0; }
  .flow-n { font-size: 11px; color: var(--gray-400); width: 60px; text-align: right; flex-shrink: 0; }

  .ae-freq { font-weight: 500; color: var(--gray-800); }
  .ae-g34 { color: var(--amber); font-weight: 500; }
  .ae-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px; }

  .map-placeholder { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 2rem; text-align: center; color: var(--gray-400); font-size: 12px; }

  .result-box { background: var(--green-light); border: 1px solid #A7F3D0; border-radius: var(--radius-md); padding: 1rem 1.25rem; }
  .result-box-neg { background: var(--gray-50); border-color: var(--gray-200); }
  .result-classification { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--green); margin-bottom: 6px; }
  .result-text { font-size: 12px; line-height: 1.7; color: var(--gray-700); }

  .tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 10px; padding: 3px 10px; border-radius: 20px; background: var(--blue-light); color: #0040A0; border: 1px solid #B3D4FF; font-weight: 500; }
  .ext-link { color: var(--blue); font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
  .ext-link:hover { text-decoration: underline; }

  /* ── COUNTRY + DISEASE VIEW ── */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 1.5rem; }
  .stat-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 1rem 1.25rem; box-shadow: var(--shadow-sm); }
  .stat-val { font-size: 24px; font-weight: 600; color: var(--gray-800); margin-bottom: 2px; }
  .stat-label { font-size: 12px; color: var(--gray-500); }
  .stat-delta { font-size: 11px; font-weight: 500; margin-top: 5px; }
  .stat-delta.up { color: var(--green); }
  .view-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 14px; }
  .view-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer; transition: border-color .15s, box-shadow .15s, transform .15s; box-shadow: var(--shadow-sm); }
  .view-card:hover { border-color: var(--blue); box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .view-card-title { font-family: var(--font-display); font-size: 18px; color: var(--gray-800); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .view-card-meta { font-size: 12px; color: var(--gray-400); margin-bottom: 12px; }
  .view-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
  .view-kpi { background: var(--gray-50); border: 1px solid var(--gray-100); border-radius: var(--radius-md); padding: 8px 10px; min-width: 0; }
  .view-kpi-value { font-size: 14px; font-weight: 600; color: var(--gray-800); overflow-wrap: anywhere; }
  .view-kpi-label { font-size: 10px; color: var(--gray-400); margin-top: 2px; }
  .view-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .mini-bars { display: flex; flex-direction: column; gap: 8px; }
  .mini-bar-row { display: grid; grid-template-columns: 130px 1fr 70px; gap: 10px; align-items: center; font-size: 12px; color: var(--gray-600); }
  .mini-track { background: var(--gray-100); border-radius: 4px; height: 16px; overflow: hidden; }
  .mini-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--blue), var(--accent)); }
  .two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; }
  @media (max-width: 760px) { .view-kpis { grid-template-columns: repeat(2, 1fr); } .mini-bar-row { grid-template-columns: 1fr; gap: 4px; } }
`;


// ─── ICONS ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const DNAIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6M4 4c-1.333 2-1.333 4 0 6M20 4c1.333 2 1.333 4 0 6M4 14c-1.333 2-1.333 4 0 6M20 14c1.333 2 1.333 4 0 6"/>
  </svg>
);
const FlaskIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 3h6M9 3v8l-4.5 7.5A2 2 0 006.24 21h11.52a2 2 0 001.74-2.5L15 11V3M9 3h6"/>
    <path d="M6.5 16h11" strokeDasharray="2 2"/>
  </svg>
);
const ColsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const SortIcon = ({ dir }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    {dir === "asc" ? <path d="M5 1L9 8H1z"/> : dir === "desc" ? <path d="M5 9L1 2H9z"/> : <><path d="M5 1L8 4H2z" opacity=".4"/><path d="M5 9L2 6H8z" opacity=".4"/></>}
  </svg>
);
const FilterIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const ChevronL = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
);
const ChevronR = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
);
const ExtIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getStageBadge = (stage) => {
  if (stage.toLowerCase().includes("approved")) return <span className="badge badge-approved">{stage}</span>;
  if (stage.toLowerCase().includes("iii")) return <span className="badge badge-phase3">Phase III</span>;
  if (stage.toLowerCase().includes("ii")) return <span className="badge badge-phase2">Phase II</span>;
  return <span className="badge">{stage}</span>;
};
const getDesigClass = (d) => {
  if (d.includes("Priority")) return "desig-priority";
  if (d.includes("Breakthrough")) return "desig-breakthrough";
  if (d.includes("Orphan")) return "desig-orphan";
  if (d.includes("Accelerated")) return "desig-accelerated";
  return "";
};
const statusBadge = (s) => {
  const map = { "Completed": "b-completed", "Recruiting": "b-recruiting", "Terminated": "b-terminated", "Unknown status": "b-unknown" };
  return <span className={`badge ${map[s] || "b-unknown"}`}>{s}</span>;
};
const phaseBadge = (p) => {
  const map = { "Phase I": "b-phase1", "Phase II": "b-phase2", "Phase III": "b-phase3" };
  return <span className={`badge ${map[p] || "b-phase1"}`}>{p}</span>;
};
const funderBadge = (f) => {
  const map = { "INDUSTRY": "b-industry", "NIH": "b-nih" };
  return <span className={`badge ${map[f] || "b-other"}`}>{f}</span>;
};
const intBadge = (t) => {
  const map = { "BIOLOGICAL": "b-bio", "DRUG": "b-drug", "DEVICE": "b-device" };
  return <span className={`badge ${map[t] || "b-other"}`}>{t}</span>;
};

// ─── DRUG PROFILE ─────────────────────────────────────────────────────────────
const DRUG_PROFILE_TABS = [
  { id: "sec-overview", label: "Overview" },
  { id: "sec-pipeline", label: "Drug Pipeline" },
  { id: "sec-regulatory", label: "Review Designations" },
  { id: "sec-partnering", label: "Partnering" },
  { id: "sec-sales", label: "Sales & Forecast" },
  { id: "sec-patents", label: "Patents / Expiry" },
  { id: "sec-supply", label: "Supply Chain" },
];

const DrugProfile = ({ drug, onBack }) => {
  const [activeTab, setActiveTab] = useState("sec-overview");
  const tabsBarRef = useRef(null);
  const tabsWrapperRef = useRef(null);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);
  const isClickScrolling = useRef(false);
  const clickScrollTimer = useRef(null);
  const maxSales = Math.max(...Object.values(drug.sales));

  const scrollTabIntoView = useCallback((tabId) => {
    const bar = tabsBarRef.current; if (!bar) return;
    const btn = bar.querySelector(`[data-tabid="${tabId}"]`); if (!btn) return;
    const tl = btn.offsetLeft, tw = btn.offsetWidth, bw = bar.clientWidth, bs = bar.scrollLeft;
    if (tl < bs + 16) bar.scrollTo({ left: tl - 16, behavior: "smooth" });
    else if (tl + tw > bs + bw - 16) bar.scrollTo({ left: tl + tw - bw + 16, behavior: "smooth" });
  }, []);

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId); scrollTabIntoView(tabId);
    const target = sectionRefs.current[tabId]; const wrapper = tabsWrapperRef.current;
    if (!target || !wrapper) return;
    isClickScrolling.current = true; clearTimeout(clickScrollTimer.current);
    const tabsBottom = wrapper.getBoundingClientRect().bottom;
    const sectionTop = target.getBoundingClientRect().top;
    window.scrollBy({ top: sectionTop - tabsBottom - 2, behavior: "smooth" });
    clickScrollTimer.current = setTimeout(() => { isClickScrolling.current = false; }, 900);
  }, [scrollTabIntoView]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      if (isClickScrolling.current) return;
      entries.forEach((entry) => { if (entry.isIntersecting) { setActiveTab(entry.target.id); scrollTabIntoView(entry.target.id); } });
    }, { root: null, rootMargin: "-110px 0px -55% 0px", threshold: 0 });
    DRUG_PROFILE_TABS.forEach(({ id }) => { const el = sectionRefs.current[id]; if (el) observerRef.current.observe(el); });
    return () => { observerRef.current?.disconnect(); clearTimeout(clickScrollTimer.current); };
  }, [scrollTabIntoView]);

  const setSectionRef = (id) => (el) => { sectionRefs.current[id] = el; };

  return (
    <div className="profile-page">
      <div className="profile-breadcrumb">
        <button onClick={onBack}>Drug Database</button>
        <span className="crumb-sep">›</span>
        <button onClick={onBack}>Development</button>
        <span className="crumb-sep">›</span>
        <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>{drug.drugName}</span>
      </div>
      <div className="profile-header">
        <div className="profile-avatar"><DNAIcon /></div>
        <div className="profile-title">
          <div className="profile-drug-name">{drug.drugName} <span>· {drug.brandName}</span></div>
          <div className="profile-subtitle">Generic: {drug.genericName} &nbsp;|&nbsp; ATC: {drug.atc} &nbsp;|&nbsp; Originator: {drug.originator}</div>
          <div className="profile-badges">
            <span className="pbadge pbadge-blue">{drug.moleculeNature}</span>
            <span className="pbadge pbadge-teal">Approved &amp; Commercialized</span>
            {drug.firstInClass && <span className="pbadge pbadge-amber">First-In-Class</span>}
            <span className="pbadge pbadge-coral">{drug.innovation}</span>
            <span className="pbadge pbadge-purple">{drug.therapyArea}</span>
          </div>
        </div>
      </div>
      <div className="profile-tabs-wrapper" ref={tabsWrapperRef}>
        <div className="profile-tabs" ref={tabsBarRef}>
          {DRUG_PROFILE_TABS.map(t => (
            <button key={t.id} data-tabid={t.id} className={`ptab${activeTab === t.id ? " active" : ""}`} onClick={() => handleTabClick(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-section" id="sec-overview" ref={setSectionRef("sec-overview")}>
          <div className="section-title-row">
            <div className="section-icon blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div>
            <span className="section-label">Overview</span>
          </div>
          <div className="info-grid">
            {[["Company", drug.company], ["Dev Company", drug.devCompany], ["Drug Type", drug.drugType], ["Molecule", drug.moleculeNature], ["Target", drug.target], ["Mechanism", drug.mechanism], ["Technology", drug.technology], ["Innovation", drug.innovation], ["Therapy Area", drug.therapyArea], ["Route", "Subcutaneous"], ["Highest Stage", drug.stage], ["ATC", drug.atc]].map(([l, v]) => (
              <div key={l} className="info-card"><div className="info-label">{l}</div><div className="info-value">{v}</div></div>
            ))}
          </div>
          <div className="section-heading">Description</div>
          <div className="desc-box">{drug.description}</div>
        </div>

        <div className="profile-section" id="sec-pipeline" ref={setSectionRef("sec-pipeline")}>
          <div className="section-title-row">
            <div className="section-icon teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>
            <span className="section-label">Drug Pipeline</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="profile-table">
              <thead><tr><th>Company</th><th>Country</th><th>Brand Name</th><th>Indication</th><th>Stage</th><th>Population</th><th>Approval Date</th></tr></thead>
              <tbody>
                {[["Sanofi-Aventis US LLC","United States",drug.brandName,"Atopic Dermatitis","Approved","Adults; Moderate-Severe","28-Mar-2017"],["Sanofi-Aventis US LLC","United States",drug.brandName,"Asthma","Approved","Adults; 12+ Yrs","19-Oct-2018"],["Sanofi-Aventis US LLC","United States",drug.brandName,"Nasal Polyps; Rhinosinusitis","Approved","Adults; Chronic","26-Jun-2019"],["Sanofi-Aventis US LLC","United States",drug.brandName,"Atopic Dermatitis (Ped)","Approved","12–17 Yrs","11-Mar-2019"],["Sanofi-Aventis US LLC","United States",drug.brandName,"Atopic Dermatitis (Child)","Approved","6–11 Yrs; Pediatric","26-May-2020"],["Sanofi-Aventis Groupe SA","EU",drug.brandName,"Atopic Dermatitis","Approved","Adults; Moderate-Severe","26-Sep-2017"],["Sanofi-Aventis Groupe SA","EU",drug.brandName,"Asthma","Approved","12+ Yrs","7-May-2019"],["Sanofi-Aventis Groupe SA","EU",drug.brandName,"Nasal Polyps; Rhinosinusitis","Approved","Adults; Chronic","24-Oct-2019"],["Sanofi KK","Japan",drug.brandName,"Atopic Dermatitis","Approved","Adults","19-Jan-2018"],["Sanofi KK","Japan",drug.brandName,"Asthma","Approved","12+ Yrs; Severe","26-Mar-2019"],["Sanofi KK","Japan",drug.brandName,"Nasal Polyps","Approved","Chronic Disease","25-Mar-2020"],[drug.company,drug.country,drug.brandName,drug.indication,"Approved","—","—"]].map((row, i) => (
                  <tr key={i}><td>{row[0]}</td><td>{row[1]}</td><td style={{ fontWeight: 500 }}>{row[2]}</td><td>{row[3]}</td><td><span className="badge badge-approved">{row[4]}</span></td><td style={{ maxWidth: 180, whiteSpace: "normal", fontSize: 11 }}>{row[5]}</td><td>{row[6]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="profile-section" id="sec-regulatory" ref={setSectionRef("sec-regulatory")}>
          <div className="section-title-row">
            <div className="section-icon amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
            <span className="section-label">Review Designations</span>
          </div>
          <div className="desig-list" style={{ marginBottom: "1.25rem" }}>
            {drug.designations.map(d => <span key={d} className={`desig-pill ${getDesigClass(d)}`}>{d}</span>)}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="profile-table">
              <thead><tr><th>Designation Type</th><th>Geography</th><th>Status</th><th>Designation Date</th><th>Approval Date</th><th>Indication</th></tr></thead>
              <tbody>
                {[["Priority Review","United States","Designated/Approved","26-Sep-2016","28-Mar-2017","Atopic Dermatitis"],["Breakthrough Therapy","United States","Designated/Approved","20-Nov-2014","28-Mar-2017","Atopic Dermatitis"],["Priority Review","United States","Designated/Approved","02-Mar-2018","19-Oct-2018","Asthma"],["Breakthrough Therapy","United States","Designated/Approved","01-Oct-2016","11-Mar-2019","Atopic Dermatitis"],["Priority Review","United States","Designated/Approved","06-Nov-2018","11-Mar-2019","Atopic Dermatitis (Adolescent)"],["Priority Review","United States","Designated/Approved","08-Mar-2019","26-Jun-2019","Nasal Polyps"],["Priority Review","United States","Designated/Approved","28-Jan-2020","26-May-2020","Atopic Dermatitis (Child)"],["Orphan Drug","United States","Designated","21-Aug-2019","—","Bullous Pemphigoid"],["Orphan Drug","United States","Designated","05-Sep-2017","—","Eosinophilic Esophagitis"],["Breakthrough Therapy","United States","Designated","14-Sep-2020","—","Eosinophilic Esophagitis"]].map((row, i) => (
                  <tr key={i}><td><span className={`desig-pill ${getDesigClass(row[0])}`}>{row[0]}</span></td><td>{row[1]}</td><td style={{ color: row[2].includes("Approved") ? "var(--green)" : "var(--blue)", fontSize: 11, fontWeight: 500 }}>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="profile-section" id="sec-partnering" ref={setSectionRef("sec-partnering")}>
          <div className="section-title-row">
            <div className="section-icon purple"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
            <span className="section-label">Partnering</span>
          </div>
          <table className="profile-table">
            <thead><tr><th>Licensor</th><th>Licensee</th><th>Deal Type</th><th>Deal Date</th><th>Geography</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td style={{ fontWeight: 500 }}>{drug.originator}</td><td>—</td><td>Originator</td><td>—</td><td>Global</td><td style={{ fontSize: 11, color: "var(--gray-500)" }}>Original developer / IP holder</td></tr>
              <tr><td style={{ fontWeight: 500 }}>{drug.company}</td><td>{drug.originator}</td><td>Development Partner</td><td>{drug.partner.includes("Nov 2007") ? "28-Nov-2007" : "—"}</td><td>Global</td><td style={{ fontSize: 11, color: "var(--gray-500)" }}>Co-development &amp; co-commercialization agreement</td></tr>
            </tbody>
          </table>
        </div>

        <div className="profile-section" id="sec-sales" ref={setSectionRef("sec-sales")}>
          <div className="section-title-row">
            <div className="section-icon green"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div>
            <span className="section-label">Sales &amp; Forecast</span>
          </div>
          <div className="section-heading" style={{ marginBottom: "1.25rem" }}>Annual Sales (USD Millions)</div>
          <div className="sales-bars">
            {Object.entries(drug.sales).map(([yr, val]) => {
              const pct = Math.round((val / maxSales) * 100);
              return (
                <div key={yr} className="sales-row">
                  <span className="sales-year">{yr}</span>
                  <div className="sales-bar-track"><div className="sales-bar-fill" style={{ width: `${pct}%` }}>{pct > 18 && <span className="sales-val">${val.toLocaleString()}M</span>}</div></div>
                  {pct <= 18 && <span className="sales-val-out">${val.toLocaleString()}M</span>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "1.5rem", fontSize: 11, color: "var(--gray-400)" }}>Source: Company filings. F = Forecast. Global figures.</div>
        </div>

        <div className="profile-section" id="sec-patents" ref={setSectionRef("sec-patents")}>
          <div className="section-title-row">
            <div className="section-icon red"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
            <span className="section-label">Patents / Expiry</span>
          </div>
          <table className="profile-table">
            <thead><tr><th>Geography</th><th>Patent Expiry</th><th>Therapy Area</th><th>Biosimilar Risk</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>United States</td><td style={{ fontWeight: 500, color: "var(--amber)" }}>{drug.patentExpiry}</td><td>{drug.therapyArea}</td><td><span style={{ color: "var(--red)", fontWeight: 500, fontSize: 11 }}>High (~2031+)</span></td><td style={{ fontSize: 11, color: "var(--gray-500)" }}>Primary composition patent; data exclusivity may extend</td></tr>
              <tr><td>Europe</td><td style={{ fontWeight: 500, color: "var(--amber)" }}>~2031</td><td>{drug.therapyArea}</td><td><span style={{ color: "var(--amber)", fontWeight: 500, fontSize: 11 }}>Medium</span></td><td style={{ fontSize: 11, color: "var(--gray-500)" }}>Country-specific extensions possible via SPC</td></tr>
              <tr><td>Rest of World</td><td style={{ fontWeight: 500, color: "var(--amber)" }}>~2031–2033</td><td>{drug.therapyArea}</td><td><span style={{ color: "var(--green)", fontWeight: 500, fontSize: 11 }}>Low–Medium</span></td><td style={{ fontSize: 11, color: "var(--gray-500)" }}>Country-specific patent landscapes apply</td></tr>
            </tbody>
          </table>
        </div>

        <div className="profile-section" id="sec-supply" ref={setSectionRef("sec-supply")}>
          <div className="section-title-row">
            <div className="section-icon gray"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
            <span className="section-label">Supply Chain</span>
          </div>
          <table className="profile-table">
            <thead><tr><th>#</th><th>Stage</th><th>Details</th><th>Key Partners / Locations</th><th>Notes</th></tr></thead>
            <tbody>
              {[["1","Drug Substance Mfg","Biologic — recombinant mAb via CHO cell culture",`${drug.originator}; ${drug.company} Biologics (Framingham, MA; Frankfurt, DE)`,"VelocImmune platform"],["2","Drug Product / Fill-Finish","Pre-filled syringe & auto-injector fill-finish",`${drug.company} (France); CMOs in EU/Asia`,"Cold-chain 2–8°C required"],["3","Packaging & Labeling","Region-specific multi-language artwork",`Local ${drug.company} affiliates per market`,"South Africa uses alternate brand"],["4","Distribution","Refrigerated specialty pharmacy channel (US)","McKesson, AmerisourceBergen (US); EU wholesalers","Room temp ≤25°C for ≤14 days"],["5","Quality & Regulatory","cGMP; FDA, EMA, PMDA oversight",`Global QA/QC via ${drug.company} & ${drug.originator}`,"Batch release per region"]].map(row => (
                <tr key={row[0]}><td style={{ color: "var(--gray-300)", fontWeight: 500, width: 30 }}>{row[0]}</td><td style={{ fontWeight: 500 }}>{row[1]}</td><td style={{ fontSize: 11, whiteSpace: "normal", maxWidth: 200 }}>{row[2]}</td><td style={{ fontSize: 11, whiteSpace: "normal", maxWidth: 200, color: "var(--gray-500)" }}>{row[3]}</td><td style={{ fontSize: 11, color: "var(--gray-400)" }}>{row[4]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── DRUGS LIST PAGE ──────────────────────────────────────────────────────────
const DRUG_COLUMNS = [
  { key: "drugName", label: "Drug Name" }, { key: "company", label: "Company" },
  { key: "devCompany", label: "Dev. Company" }, { key: "country", label: "Country" },
  { key: "brandName", label: "Brand Name" }, { key: "indication", label: "Indication" },
  { key: "stage", label: "Stage" }, { key: "moleculeNature", label: "Molecule Type" },
  { key: "therapyArea", label: "Therapy Area" }, { key: "innovation", label: "Innovation" },
];
const STAGES = ["All", "Approved Commercialized", "Phase III", "Phase II", "Phase I"];
const THERAPY_AREAS = ["All", "Dermatology", "Oncology", "Neurology", "Endocrinology", "Respiratory", "Infectious Disease", "Hematology"];
const DRUG_PAGE_SIZE = 6;

const DrugsPage = () => {
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [therapyFilter, setTherapyFilter] = useState("All");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = useCallback((key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  }, [sortKey]);

  const filtered = useMemo(() => {
    let data = [...DRUGS];
    if (search) { const q = search.toLowerCase(); data = data.filter(d => d.drugName.toLowerCase().includes(q) || d.brandName.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) || d.indication.toLowerCase().includes(q)); }
    if (stageFilter !== "All") data = data.filter(d => d.stage === stageFilter);
    if (therapyFilter !== "All") data = data.filter(d => d.therapyArea === therapyFilter);
    if (sortKey) { data.sort((a, b) => { const av = (a[sortKey] || "").toString().toLowerCase(); const bv = (b[sortKey] || "").toString().toLowerCase(); return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av); }); }
    return data;
  }, [search, stageFilter, therapyFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / DRUG_PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * DRUG_PAGE_SIZE, currentPage * DRUG_PAGE_SIZE);

  if (selectedDrug) return <DrugProfile drug={selectedDrug} onBack={() => { setSelectedDrug(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />;

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-info">Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>, Total Rows: <strong>{filtered.length.toLocaleString()}</strong></div>
        <div className="search-box"><span className="search-icon"><SearchIcon /></span><input placeholder="Search drug name, company, indication…" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} /></div>
        <select className="filter-select" value={stageFilter} onChange={e => { setStageFilter(e.target.value); setCurrentPage(1); }}>{STAGES.map(s => <option key={s}>{s}</option>)}</select>
        <select className="filter-select" value={therapyFilter} onChange={e => { setTherapyFilter(e.target.value); setCurrentPage(1); }}>{THERAPY_AREAS.map(s => <option key={s}>{s}</option>)}</select>
        <button className="btn-cols"><ColsIcon /> Columns</button>
      </div>
      <div className="table-container">
        <div className="table-scroll">
          <table>
            <thead><tr>{DRUG_COLUMNS.map(col => (<th key={col.key}><div className="th-inner">{col.label}<div className="th-actions"><button className={`th-btn${sortKey === col.key ? " active-sort" : ""}`} onClick={() => handleSort(col.key)}><SortIcon dir={sortKey === col.key ? sortDir : null} /></button><button className="th-btn"><FilterIcon /></button></div></div></th>))}</tr></thead>
            <tbody>
              {paginated.length === 0 ? <tr><td colSpan={DRUG_COLUMNS.length}><div className="empty-state"><div className="empty-icon">🔍</div>No drugs match your search criteria</div></td></tr> :
              paginated.map(drug => (
                <tr key={drug.id}>
                  <td><button className="drug-link" onClick={() => { setSelectedDrug(drug); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{drug.drugName}<span className="drug-link-arrow">↗</span></button></td>
                  <td>{drug.company}</td><td>{drug.devCompany}</td><td>{drug.country}</td>
                  <td style={{ fontWeight: 500 }}>{drug.brandName}</td>
                  <td style={{ maxWidth: 180, whiteSpace: "normal", fontSize: 12 }}>{drug.indication}</td>
                  <td>{getStageBadge(drug.stage)}</td>
                  <td>{drug.moleculeNature}</td><td>{drug.therapyArea}</td>
                  <td>{drug.innovation === "NME" ? <span className="badge badge-nme">NME</span> : <span className="badge badge-biosimilar">{drug.innovation}</span>}{drug.firstInClass && <span className="badge badge-fic" style={{ marginLeft: 4 }}>FIC</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>{filtered.length} records &nbsp;·&nbsp; Page {currentPage} of {totalPages}</span>
          <div className="pag-btns">
            <button className="pag-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
            <button className="pag-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronL /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - currentPage) <= 2).map(p => (<button key={p} className={`pag-btn${p === currentPage ? " active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>))}
            <button className="pag-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronR /></button>
            <button className="pag-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── TRIAL PROFILE — SCROLL NAVIGATION (same pattern as DrugProfile) ──────────
const TRIAL_PROFILE_TABS = [
  { id: "tsec-basic",          label: "Basic" },
  { id: "tsec-design",         label: "Study Design" },
  { id: "tsec-interventions",  label: "Interventions" },
  { id: "tsec-collaborators",  label: "Collaborators" },
  { id: "tsec-outcomes",       label: "Outcomes" },
  { id: "tsec-biomarkers",     label: "BioMarkers" },
  { id: "tsec-investigators",  label: "Investigators" },
  { id: "tsec-sites",          label: "Clinical Sites" },
  { id: "tsec-flow",           label: "Participant Flow" },
  { id: "tsec-ae",             label: "Adverse Events" },
];

const TrialProfile = ({ trial, onBack }) => {
  const [activeTab, setActiveTab] = useState("tsec-basic");
  const tabsBarRef    = useRef(null);
  const tabsWrapperRef = useRef(null);
  const sectionRefs   = useRef({});
  const observerRef   = useRef(null);
  const isClickScrolling = useRef(false);
  const clickScrollTimer = useRef(null);

  const bm   = BIOMARKERS[trial.nctId]        || [];
  const locs = LOCATIONS[trial.nctId]          || [];
  const ae   = ADVERSE_EVENTS[trial.nctId]     || [];
  const flow = PARTICIPANT_FLOW[trial.nctId]   || [];
  const invs = INVESTIGATORS[trial.nctId]      || [];

  // ── scroll-nav helpers (identical pattern to DrugProfile) ──
  const scrollTabIntoView = useCallback((tabId) => {
    const bar = tabsBarRef.current; if (!bar) return;
    const btn = bar.querySelector(`[data-tabid="${tabId}"]`); if (!btn) return;
    const tl = btn.offsetLeft, tw = btn.offsetWidth, bw = bar.clientWidth, bs = bar.scrollLeft;
    if (tl < bs + 16) bar.scrollTo({ left: tl - 16, behavior: "smooth" });
    else if (tl + tw > bs + bw - 16) bar.scrollTo({ left: tl + tw - bw + 16, behavior: "smooth" });
  }, []);

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId); scrollTabIntoView(tabId);
    const target  = sectionRefs.current[tabId];
    const wrapper = tabsWrapperRef.current;
    if (!target || !wrapper) return;
    isClickScrolling.current = true; clearTimeout(clickScrollTimer.current);
    const tabsBottom = wrapper.getBoundingClientRect().bottom;
    const sectionTop = target.getBoundingClientRect().top;
    window.scrollBy({ top: sectionTop - tabsBottom - 2, behavior: "smooth" });
    clickScrollTimer.current = setTimeout(() => { isClickScrolling.current = false; }, 900);
  }, [scrollTabIntoView]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      if (isClickScrolling.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) { setActiveTab(entry.target.id); scrollTabIntoView(entry.target.id); }
      });
    }, { root: null, rootMargin: "-110px 0px -55% 0px", threshold: 0 });
    TRIAL_PROFILE_TABS.forEach(({ id }) => { const el = sectionRefs.current[id]; if (el) observerRef.current.observe(el); });
    return () => { observerRef.current?.disconnect(); clearTimeout(clickScrollTimer.current); };
  }, [scrollTabIntoView]);

  const setSectionRef = (id) => (el) => { sectionRefs.current[id] = el; };

  return (
    <div className="profile">
      {/* breadcrumb */}
      <div className="breadcrumb">
        <button onClick={onBack}>Clinical Trials</button>
        <span>›</span>
        <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>{trial.nctId}</span>
      </div>

      {/* header */}
      <div className="ph">
        <div className="ph-icon"><FlaskIcon /></div>
        <div className="ph-body">
          <div className="ph-nct">{trial.nctId} &nbsp;·&nbsp; {trial.studyType}</div>
          <div className="ph-title">{trial.trialTitle}</div>
          <div className="ph-official">{trial.officialTitle}</div>
          <div className="ph-badges">
            {statusBadge(trial.status)}
            <span className="ph-badge phb-cyan">{trial.studyType}</span>
            <span className="ph-badge phb-amber">{trial.phase}</span>
            <span className="ph-badge phb-blue">{trial.meshCondition}</span>
            {trial.hasResults && <span className="ph-badge phb-green">Results Available</span>}
            {trial.funder === "INDUSTRY" && <span className="ph-badge phb-blue">Industry Funded</span>}
          </div>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-item"><div className="ph-meta-label">Enrolled Subjects</div><div className="ph-meta-val">{trial.enrolledSubjects.toLocaleString()}</div></div>
          <div className="ph-meta-item"><div className="ph-meta-label">Duration</div><div className="ph-meta-val">{trial.trialDurationMonths} months</div></div>
          <div className="ph-meta-item"><div className="ph-meta-label">Results</div><div className={`ph-meta-val ${trial.hasResults ? "positive" : "negative"}`}>{trial.hasResults ? "✓ Posted" : "Not Posted"}</div></div>
        </div>
      </div>

      {/* sticky scroll-nav tabs */}
      <div className="profile-tabs-wrapper" ref={tabsWrapperRef}>
        <div className="profile-tabs" ref={tabsBarRef}>
          {TRIAL_PROFILE_TABS.map(t => (
            <button
              key={t.id}
              data-tabid={t.id}
              className={`ptab${activeTab === t.id ? " active" : ""}`}
              onClick={() => handleTabClick(t.id)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* all sections on one page */}
      <div className="profile-body">

        {/* ── BASIC ── */}
        <div className="profile-section" id="tsec-basic" ref={setSectionRef("tsec-basic")}>
          <div className="section-title-row">
            <div className="section-icon blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div>
            <span className="section-label">Basic Information</span>
          </div>
          <div className="ig">
            {[["NCT ID",trial.nctId],["Start Date",trial.startDate],["Primary Completion",trial.primaryCompletionDate],["Completion Date",trial.completionDate],["Status",trial.status],["Study Type",trial.studyType],["Phase",trial.phase],["Gender",trial.gender],["Min Age",trial.minAge],["Max Age",trial.maxAge||"—"],["Planned Subjects",trial.plannedSubjects.toLocaleString()],["Enrolled Subjects",trial.enrolledSubjects.toLocaleString()],["Countries",trial.countries.join(", ")],["Locations",`${locs.length} sites`],["Funded By",trial.funder],["Sponsor",trial.sponsor],["Duration (months)",trial.trialDurationMonths],["Healthy Volunteers",trial.healthyVolunteers?"Yes":"No"],["Added Date",trial.addedDate],["Last Updated",trial.lastUpdated]].map(([l,v])=>(
              <div key={l} className="ic"><div className="ic-label">{l}</div><div className="ic-val">{v}</div></div>
            ))}
          </div>
          <div className="sh" style={{ marginBottom:".75rem" }}>MeSH Conditions</div>
          <div className="tag-list" style={{ marginBottom:"1.25rem" }}>
            {trial.meshCondition.split(", ").map(k=><span key={k} className="tag">{k}</span>)}
          </div>
          <div className="sh" style={{ marginBottom:".75rem" }}>Keywords</div>
          <div className="tag-list">
            {trial.keywords.map(k=><span key={k} className="tag" style={{ background:"var(--gray-100)",color:"var(--gray-600)",borderColor:"var(--gray-200)" }}>{k}</span>)}
          </div>
          {trial.resultsUrl && (
            <div style={{ marginTop:"1.25rem" }}>
              <div className="sh" style={{ marginBottom:".5rem" }}>Results Link</div>
              <a href={trial.resultsUrl} target="_blank" rel="noreferrer" className="ext-link"><ExtIcon /> {trial.resultsUrl}</a>
            </div>
          )}
        </div>

        {/* ── STUDY DESIGN ── */}
        <div className="profile-section" id="tsec-design" ref={setSectionRef("tsec-design")}>
          <div className="section-title-row">
            <div className="section-icon teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>
            <span className="section-label">Study Design</span>
          </div>
          <div className="ig">
            {[["Study Type",trial.studyType],["Phase",trial.phase],["Allocation","Randomized"],["Intervention Model","Parallel Assignment"],["Masking","Double Blind (Subject, Investigator)"],["Primary Purpose","Treatment"],["Number of Arms","2"],["Endpoint Classification",trial.endpointClassification||"—"],["Observational Model","—"],["Time Perspective","Prospective"],["Sampling Method","—"],["Single/Multi Country",trial.countries.length>1?"Multi-Country":"Single Country"],["Number of Locations",locs.length||"—"]].map(([l,v])=>(
              <div key={l} className="ic"><div className="ic-label">{l}</div><div className="ic-val">{v}</div></div>
            ))}
          </div>
          <div className="sh" style={{ marginBottom:".75rem" }}>Outcome Classification</div>
          <div className={`result-box${trial.hasResults ? "" : " result-box-neg"}`}>
            <div className="result-classification">{trial.endpointClassification || "No results posted"}</div>
            <div className="result-text">{trial.trialOutcome}</div>
          </div>
        </div>

        {/* ── INTERVENTIONS ── */}
        <div className="profile-section" id="tsec-interventions" ref={setSectionRef("tsec-interventions")}>
          <div className="section-title-row">
            <div className="section-icon amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M9 3h6M9 3v8l-4.5 7.5A2 2 0 006.24 21h11.52a2 2 0 001.74-2.5L15 11V3M9 3h6"/><path d="M6.5 16h11" strokeDasharray="2 2"/></svg></div>
            <span className="section-label">Interventions</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table className="pt">
              <thead><tr><th>Intervention Type</th><th>Drug / Product Name</th><th>Description</th><th>Arm</th><th>Dose</th></tr></thead>
              <tbody>
                <tr><td>{intBadge(trial.interventionType)}</td><td style={{ fontWeight:600, color:"var(--blue)" }}>{trial.drugName}</td><td style={{ whiteSpace:"normal", maxWidth:260 }}>Active treatment arm — {trial.drugName} administered as per protocol.</td><td>Experimental</td><td>Per protocol</td></tr>
                <tr><td><span className="badge b-other">DRUG</span></td><td style={{ fontWeight:500 }}>Placebo</td><td style={{ whiteSpace:"normal", maxWidth:260 }}>Matched placebo comparator</td><td>Placebo Comparator</td><td>Per protocol</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── COLLABORATORS ── */}
        <div className="profile-section" id="tsec-collaborators" ref={setSectionRef("tsec-collaborators")}>
          <div className="section-title-row">
            <div className="section-icon purple"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
            <span className="section-label">Collaborators</span>
          </div>
          <table className="pt">
            <thead><tr><th>Role</th><th>Organization</th><th>Type</th><th>Country</th></tr></thead>
            <tbody>
              <tr><td style={{ fontWeight:500 }}>Sponsor (Lead)</td><td style={{ fontWeight:600 }}>{trial.sponsor}</td><td>{funderBadge(trial.funder)}</td><td>United States</td></tr>
              {trial.collaborator && <tr><td>Collaborator</td><td>{trial.collaborator}</td><td>{funderBadge("INDUSTRY")}</td><td>United States</td></tr>}
            </tbody>
          </table>
        </div>

        {/* ── OUTCOMES ── */}
        <div className="profile-section" id="tsec-outcomes" ref={setSectionRef("tsec-outcomes")}>
          <div className="section-title-row">
            <div className="section-icon green"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div>
            <span className="section-label">Outcomes</span>
          </div>
          {trial.hasResults ? (
            <>
              <div className="result-box" style={{ marginBottom:"1.25rem" }}>
                <div className="result-classification">{trial.endpointClassification}</div>
                <div className="result-text">{trial.trialOutcome}</div>
              </div>
              <div className="ig">
                <div className="ic"><div className="ic-label">Results Posted</div><div className="ic-val">{trial.resultsPostedDate}</div></div>
                {trial.resultsUrl && <div className="ic"><div className="ic-label">Study URL</div><div className="ic-val"><a href={trial.resultsUrl} className="ext-link" target="_blank" rel="noreferrer"><ExtIcon /> View</a></div></div>}
              </div>
              <div className="sh" style={{ marginBottom:"1rem" }}>Primary &amp; Secondary Outcomes</div>
              <table className="pt">
                <thead><tr><th>Type</th><th>Outcome Measure</th><th>Time Frame</th></tr></thead>
                <tbody>
                  <tr><td><span className="badge b-phase3">Primary</span></td><td>Overall Response Rate (ORR)</td><td>Up to 2 years</td></tr>
                  <tr><td><span className="badge b-phase2">Secondary</span></td><td>Progression-Free Survival (PFS)</td><td>Up to 3 years</td></tr>
                  <tr><td><span className="badge b-phase2">Secondary</span></td><td>Overall Survival (OS)</td><td>Up to 5 years</td></tr>
                  <tr><td><span className="badge b-phase1">Exploratory</span></td><td>Duration of Response (DoR)</td><td>Up to 5 years</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <div className="result-box result-box-neg"><div className="result-text">No results posted for this trial.</div></div>
          )}
        </div>

        {/* ── BIOMARKERS ── */}
        <div className="profile-section" id="tsec-biomarkers" ref={setSectionRef("tsec-biomarkers")}>
          <div className="section-title-row">
            <div className="section-icon teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
            <span className="section-label">BioMarkers ({bm.length})</span>
          </div>
          {bm.length === 0 ? (
            <div className="empty">No biomarker data available for this trial.</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="pt">
                <thead><tr><th>Normalized Name</th><th>Type</th><th>Specimen</th><th>Assay</th><th>Source Section</th><th>Thresholds</th><th>MeSH ID</th><th>Confidence</th><th>Notes</th></tr></thead>
                <tbody>
                  {bm.map((b, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:500, whiteSpace:"normal", maxWidth:180 }}>{b.normalizedName}</td>
                      <td><span className="badge" style={{ background:b.type==="Genomic"?"var(--purple-light)":b.type==="Inflammatory"?"var(--red-light)":b.type==="Endocrine"?"var(--amber-light)":"var(--accent-light)", color:b.type==="Genomic"?"var(--purple)":b.type==="Inflammatory"?"var(--red)":b.type==="Endocrine"?"var(--amber)":"#086082" }}>{b.type}</span></td>
                      <td>{b.specimen}</td>
                      <td>{b.assay}</td>
                      <td style={{ whiteSpace:"normal", maxWidth:140, fontSize:10 }}>{b.sourceSection}</td>
                      <td>{b.thresholds||"—"}</td>
                      <td style={{ fontSize:10 }}>{b.ontologyMappings.map(m=>`${m.system}:${m.id}`).join(", ")}</td>
                      <td>
                        <div className="conf-bar">
                          <div className="conf-track"><div className="conf-fill" style={{ width:`${b.confidence*100}%` }}/></div>
                          <span className="conf-num">{(b.confidence*100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace:"normal", maxWidth:200, fontSize:10, color:"var(--gray-500)" }}>{b.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── INVESTIGATORS ── */}
        <div className="profile-section" id="tsec-investigators" ref={setSectionRef("tsec-investigators")}>
          <div className="section-title-row">
            <div className="section-icon amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
            <span className="section-label">Investigators</span>
          </div>
          {invs.length === 0 ? (
            <div className="empty">No investigator data available.</div>
          ) : (
            <table className="pt">
              <thead><tr><th>Position</th><th>Investigator</th><th>Qualification</th><th>Company / Affiliation</th><th>Source URL</th></tr></thead>
              <tbody>
                {invs.map((inv, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{inv.position}</td>
                    <td>{inv.investigator}</td>
                    <td>{inv.qualification||"—"}</td>
                    <td>{inv.company}</td>
                    <td><a href={inv.url} target="_blank" rel="noreferrer" className="ext-link"><ExtIcon /> View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── CLINICAL SITES ── */}
        <div className="profile-section" id="tsec-sites" ref={setSectionRef("tsec-sites")}>
          <div className="section-title-row">
            <div className="section-icon blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <span className="section-label">Clinical Sites ({locs.length})</span>
          </div>
          {locs.length === 0 ? (
            <div className="empty">No location data available for this trial.</div>
          ) : (
            <>
              <div className="map-placeholder" style={{ marginBottom:"1rem" }}>
                <div style={{ marginBottom:6 }}><PinIcon /></div>
                <div>{locs.length} clinical sites across {[...new Set(locs.map(l=>l.country))].join(", ")}</div>
                <div style={{ fontSize:10, marginTop:4 }}>Integrate with Mapbox / Google Maps API for interactive map view</div>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table className="pt">
                  <thead><tr><th>#</th><th>Site Name</th><th>Country</th><th>State</th><th>City</th><th>ZIP</th><th>Latitude</th><th>Longitude</th></tr></thead>
                  <tbody>
                    {locs.map((l, i) => (
                      <tr key={i}>
                        <td style={{ color:"var(--gray-300)" }}>{i+1}</td>
                        <td style={{ fontWeight:500, whiteSpace:"normal" }}>{l.siteName}</td>
                        <td>{l.country}</td><td>{l.state||"—"}</td><td>{l.city}</td>
                        <td>{l.zipCode||"—"}</td>
                        <td style={{ fontFamily:"monospace", fontSize:10 }}>{l.lat}</td>
                        <td style={{ fontFamily:"monospace", fontSize:10 }}>{l.lng}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── PARTICIPANT FLOW ── */}
        <div className="profile-section" id="tsec-flow" ref={setSectionRef("tsec-flow")}>
          <div className="section-title-row">
            <div className="section-icon green"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></div>
            <span className="section-label">Participant Flow</span>
          </div>
          {flow.length === 0 ? (
            <div className="empty">No participant flow data available for this trial.</div>
          ) : (
            <>
              <div className="flow-list">
                {flow.map((f, i) => (
                  <div key={i} className="flow-item">
                    <span className="flow-num">{i+1}</span>
                    <span className="flow-label">{f.milestone}</span>
                    <div className="flow-track"><div className="flow-fill" style={{ width:f.percentage }}/></div>
                    <span className="flow-pct">{f.percentage}</span>
                    <span className="flow-n">n = {f.participants.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:"1rem", fontSize:11, color:"var(--gray-400)" }}>Enrolled: {trial.enrolledSubjects.toLocaleString()} · Sponsor: {trial.sponsor}</div>
            </>
          )}
        </div>

        {/* ── ADVERSE EVENTS ── */}
        <div className="profile-section" id="tsec-ae" ref={setSectionRef("tsec-ae")}>
          <div className="section-title-row">
            <div className="section-icon red"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
            <span className="section-label">Adverse Events ({ae.length})</span>
          </div>
          {ae.length === 0 ? (
            <div className="empty">No adverse event data available for this trial.</div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"1.25rem" }}>
                {[{label:"Total AE Events",val:ae.length,color:"var(--blue)"},{label:"Serious AEs",val:ae.filter(a=>a.serious).length,color:"var(--red)"},{label:"Grade 3–4 Events",val:ae.filter(a=>parseFloat(a.grade34)>1).length,color:"var(--amber)"}].map(({label,val,color})=>(
                  <div key={label} className="ic" style={{ textAlign:"center" }}>
                    <div className="ic-label">{label}</div>
                    <div style={{ fontSize:22, fontWeight:600, color }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table className="pt">
                  <thead><tr><th>Event Term</th><th>Category</th><th>Frequency (All Grades)</th><th>Grade 3–4</th><th>Serious</th></tr></thead>
                  <tbody>
                    {ae.map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:500 }}><span className="ae-dot" style={{ background:a.serious?"var(--red)":"var(--blue-mid)" }}/>{a.term}</td>
                        <td>{a.category}</td>
                        <td className="ae-freq">{a.frequency}</td>
                        <td className="ae-g34">{a.grade34}</td>
                        <td>{a.serious ? <span className="badge b-terminated">Serious</span> : <span style={{ color:"var(--gray-300)", fontSize:10 }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── TRIALS LIST PAGE ─────────────────────────────────────────────────────────
const TRIAL_COLUMNS = [
  { key: "nctId", label: "NCT ID" }, { key: "trialTitle", label: "Trial Title" },
  { key: "officialTitle", label: "Official Title" }, { key: "status", label: "Status" },
  { key: "studyType", label: "Study Type" }, { key: "sponsor", label: "Sponsor" },
  { key: "funder", label: "Funder" }, { key: "phase", label: "Phase" },
  { key: "startDate", label: "Start Date" }, { key: "primaryCompletionDate", label: "Primary Completion" },
];
const STATUSES = ["All", "Completed", "Recruiting", "Terminated", "Unknown status"];
const STUDY_TYPES = ["All", "INTERVENTIONAL", "OBSERVATIONAL"];
const TRIAL_PAGE_SIZE = 5;

const TrialsPage = () => {
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [typeF, setTypeF] = useState("All");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const handleSort = useCallback((k) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const filtered = useMemo(() => {
    let d = [...TRIALS];
    if (search) { const q = search.toLowerCase(); d = d.filter(t => t.nctId.toLowerCase().includes(q) || t.trialTitle.toLowerCase().includes(q) || t.sponsor.toLowerCase().includes(q) || t.drugName.toLowerCase().includes(q) || t.meshCondition.toLowerCase().includes(q)); }
    if (statusF !== "All") d = d.filter(t => t.status === statusF);
    if (typeF !== "All") d = d.filter(t => t.studyType === typeF);
    if (sortKey) { d.sort((a, b) => { const av = (a[sortKey] || "").toString().toLowerCase(); const bv = (b[sortKey] || "").toString().toLowerCase(); return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av); }); }
    return d;
  }, [search, statusF, typeF, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / TRIAL_PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * TRIAL_PAGE_SIZE, page * TRIAL_PAGE_SIZE);

  if (selectedTrial) return <TrialProfile trial={selectedTrial} onBack={() => { setSelectedTrial(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />;

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-info">Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>, Total Rows: <strong>{filtered.length.toLocaleString()}</strong></div>
        <div className="search-box"><span className="search-icon"><SearchIcon /></span><input placeholder="Search NCT ID, title, sponsor, drug…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        <select className="filter-select" value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        <select className="filter-select" value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1); }}>{STUDY_TYPES.map(s => <option key={s}>{s}</option>)}</select>
        <button className="btn-cols"><ColsIcon /> Columns</button>
        <div className="pg-controls">
          <select className="pg-sel"><option>25</option><option>50</option><option>100</option></select>
          <button className="pg-btn" disabled={page === 1} onClick={() => setPage(1)}>First</button>
          <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (<button key={p} className={`pg-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>))}
          <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>
      <div className="table-container">
        <div className="table-scroll">
          <table>
            <thead><tr>{TRIAL_COLUMNS.map(c => (<th key={c.key}><div className="th-inner">{c.label}<div className="th-actions"><button className={`th-btn${sortKey === c.key ? " active-sort" : ""}`} onClick={() => handleSort(c.key)}><SortIcon dir={sortKey === c.key ? sortDir : null} /></button><button className="th-btn"><FilterIcon /></button></div></div></th>))}</tr></thead>
            <tbody>
              {paginated.length === 0 ? <tr><td colSpan={TRIAL_COLUMNS.length}><div className="empty">No trials match your search.</div></td></tr> :
              paginated.map(t => (
                <tr key={t.nctId}>
                  <td><button className="nct-link" onClick={() => { setSelectedTrial(t); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t.nctId}<span className="nct-arrow">↗</span></button></td>
                  <td style={{ maxWidth: 320, whiteSpace: "normal", fontSize: 11 }}>{t.trialTitle}</td>
                  <td style={{ maxWidth: 200, whiteSpace: "normal", fontSize: 11, color: "var(--gray-500)" }}>{t.officialTitle.length > 60 ? t.officialTitle.slice(0, 60) + "…" : t.officialTitle}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td><span className={`badge ${t.studyType === "INTERVENTIONAL" ? "b-bio" : "b-phase1"}`}>{t.studyType}</span></td>
                  <td style={{ maxWidth: 160, whiteSpace: "normal", fontSize: 11 }}>{t.sponsor.length > 30 ? t.sponsor.slice(0, 30) + "…" : t.sponsor}</td>
                  <td>{funderBadge(t.funder)}</td>
                  <td>{phaseBadge(t.phase)}</td>
                  <td style={{ fontSize: 11 }}>{t.startDate}</td>
                  <td style={{ fontSize: 11 }}>{t.primaryCompletionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};


// ─── COUNTRY VIEW ─────────────────────────────────────────────────────────────
const REGIONS = ["All Regions", ...Array.from(new Set(COUNTRIES.map(c => c.region)))];

const CountryProfile = ({ country, onBack }) => {
  const maxDiseasePatients = Math.max(...country.topDiseases.map(d => d.patients));
  return (
    <div className="profile-page">
      <div className="profile-breadcrumb"><button onClick={onBack}>Country View</button><span className="crumb-sep">›</span><span>{country.name}</span></div>
      <div className="profile-header">
        <div className="profile-avatar" style={{ fontSize: 34 }}>{country.flag}</div>
        <div className="profile-title">
          <div className="ph-nct">{country.region} · {country.regulatorFull}</div>
          <div className="profile-drug-name">{country.name}</div>
          <div className="profile-subtitle">{country.marketAccess}</div>
          <div className="profile-badges">
            <span className="pbadge pbadge-blue">{country.regulator}</span>
            <span className="pbadge pbadge-teal">{country.currency}</span>
            <span className="pbadge pbadge-amber">+{country.cagr}% CAGR</span>
          </div>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-item"><div className="ph-meta-label">Market 2024</div><div className="ph-meta-val">${country.marketSize2024}B</div></div>
          <div className="ph-meta-item"><div className="ph-meta-label">Active Trials</div><div className="ph-meta-val positive">{country.activeTrials.toLocaleString()}</div></div>
          <div className="ph-meta-item"><div className="ph-meta-label">Access Score</div><div className="ph-meta-val">{country.patientAccessScore}/10</div></div>
        </div>
      </div>
      <div className="profile-body" style={{ borderTop: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)" }}>
        <section className="profile-section">
          <div className="section-title-row"><div className="section-icon blue"><PinIcon /></div><div className="section-label">Country Overview</div></div>
          <div className="info-grid">
            {[["ISO Code", country.iso], ["Population", `${country.population}M`], ["GDP", `${country.gdp}B`], ["Healthcare Spend", `${country.healthcareSpendPct}% GDP`], ["Approved Drugs", country.approvedDrugs.toLocaleString()], ["Companies HQ", country.companiesHQ.toLocaleString()], ["Manufacturing Sites", country.manufacturingSites.toLocaleString()], ["Generic Penetration", country.genericPenetration]].map(([label, value]) => (
              <div key={label} className="info-card"><div className="info-label">{label}</div><div className="info-value">{value}</div></div>
            ))}
          </div>
          <div className="desc-box">{country.pricingPolicy}</div>
          <div className="tag-list">{country.approvalPathways.map(path => <span key={path} className="tag">{path}</span>)}</div>
        </section>
        <section className="profile-section two-col">
          <div>
            <div className="section-heading">Top diseases</div>
            <div className="mini-bars">{country.topDiseases.map(d => (
              <div key={d.name} className="mini-bar-row"><span>{d.name}</span><div className="mini-track"><div className="mini-fill" style={{ width: `${(d.patients / maxDiseasePatients) * 100}%` }} /></div><strong>{d.patients.toLocaleString()}K</strong></div>
            ))}</div>
          </div>
          <div>
            <div className="section-heading">Top companies</div>
            <table className="profile-table"><thead><tr><th>Company</th><th>Revenue</th><th>Pipeline</th></tr></thead><tbody>{country.topCompanies.map(co => <tr key={co.name}><td>{co.name}</td><td>${co.revenue}B</td><td>{co.pipeline}</td></tr>)}</tbody></table>
          </div>
        </section>
        <section className="profile-section">
          <div className="section-title-row"><div className="section-icon teal"><FlaskIcon /></div><div className="section-label">Recent Approvals and Trials</div></div>
          <div className="two-col">
            <table className="profile-table"><thead><tr><th>Drug</th><th>Company</th><th>Indication</th><th>Date</th></tr></thead><tbody>{country.recentApprovals.map(a => <tr key={`${a.drug}-${a.date}`}><td>{a.brand}</td><td>{a.company}</td><td>{a.indication}</td><td>{a.date}</td></tr>)}</tbody></table>
            <table className="profile-table"><thead><tr><th>NCT ID</th><th>Trial</th><th>Phase</th><th>Status</th></tr></thead><tbody>{country.activeTrialsList.map(t => <tr key={t.nctId}><td>{t.nctId}</td><td>{t.title}</td><td>{t.phase}</td><td>{t.status}</td></tr>)}</tbody></table>
          </div>
        </section>
      </div>
    </div>
  );
};

const CountryView = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [sortBy, setSortBy] = useState("marketSize2024");
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COUNTRIES.filter(c => (region === "All Regions" || c.region === region) && (!q || c.name.toLowerCase().includes(q) || c.regulator.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))).sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [search, region, sortBy]);
  const totals = useMemo(() => ({ trials: COUNTRIES.reduce((s, c) => s + c.activeTrials, 0), market: COUNTRIES.reduce((s, c) => s + c.marketSize2024, 0), sites: COUNTRIES.reduce((s, c) => s + c.manufacturingSites, 0) }), []);
  if (selected) return <CountryProfile country={selected} onBack={() => { setSelected(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />;
  return (
    <div className="profile-page">
      <div className="stat-grid">
        {[{ label: "Countries Tracked", val: COUNTRIES.length, delta: "Global coverage" }, { label: "Combined Market", val: `${totals.market.toFixed(0)}B`, delta: "2024 pharma market" }, { label: "Active Trials", val: totals.trials.toLocaleString(), delta: "Across tracked countries" }, { label: "Manufacturing Sites", val: totals.sites.toLocaleString(), delta: "API and fill-finish" }].map(s => <div key={s.label} className="stat-card"><div className="stat-val">{s.val}</div><div className="stat-label">{s.label}</div><div className="stat-delta up">{s.delta}</div></div>)}
      </div>
      <div className="toolbar">
        <div className="search-box"><span className="search-icon"><SearchIcon /></span><input placeholder="Search country, regulator, region..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="filter-select" value={region} onChange={e => setRegion(e.target.value)}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="marketSize2024">Sort: Market Size</option><option value="activeTrials">Sort: Active Trials</option><option value="approvedDrugs">Sort: Approved Drugs</option><option value="cagr">Sort: CAGR</option></select>
        <span className="toolbar-info"><strong>{filtered.length}</strong> countries</span>
      </div>
      <div className="view-grid">{filtered.map(c => <div key={c.id} className="view-card" onClick={() => { setSelected(c); window.scrollTo({ top: 0, behavior: "smooth" }); }}><div className="view-card-title"><span>{c.flag}</span>{c.name}</div><div className="view-card-meta">{c.regulator} · {c.region}</div><div className="view-kpis"><div className="view-kpi"><div className="view-kpi-value">${c.marketSize2024}B</div><div className="view-kpi-label">Market 2024</div></div><div className="view-kpi"><div className="view-kpi-value">{c.activeTrials.toLocaleString()}</div><div className="view-kpi-label">Active Trials</div></div><div className="view-kpi"><div className="view-kpi-value">+{c.cagr}%</div><div className="view-kpi-label">CAGR</div></div><div className="view-kpi"><div className="view-kpi-value">{c.approvedDrugs.toLocaleString()}</div><div className="view-kpi-label">Approved Drugs</div></div><div className="view-kpi"><div className="view-kpi-value">{c.genericPenetration}</div><div className="view-kpi-label">Generic</div></div><div className="view-kpi"><div className="view-kpi-value">{c.patientAccessScore}/10</div><div className="view-kpi-label">Access</div></div></div><div className="view-tags"><span className="tag">{c.regulator}</span>{c.topTherapyAreas.slice(0, 2).map(t => <span key={t} className="tag" style={{ background: "var(--gray-100)", color: "var(--gray-600)", borderColor: "var(--gray-200)" }}>{t}</span>)}</div></div>)}</div>
    </div>
  );
};

// ─── DISEASE VIEW ─────────────────────────────────────────────────────────────
const DiseaseProfile = ({ disease, onBack }) => {
  const pipeline = PIPELINE_DATA[disease.name] || PIPELINE_DATA[disease.aliases?.split(",")[0]] || [];
  const epi = EPIDEMIOLOGY.find(e => e.disease === disease.name || disease.aliases?.includes(e.disease));
  const maxMarket = epi ? Math.max(...epi.marketSize.map(m => m.size)) : disease.marketSize2030;
  return (
    <div className="profile-page">
      <div className="profile-breadcrumb"><button onClick={onBack}>Disease View</button><span className="crumb-sep">›</span><span>{disease.name}</span></div>
      <div className="profile-header">
        <div className="profile-avatar"><DNAIcon /></div>
        <div className="profile-title">
          <div className="ph-nct">Disease Profile · {disease.therapyArea}</div>
          <div className="profile-drug-name">{disease.name}</div>
          <div className="profile-subtitle">{disease.aliases} · ICD-10 {disease.icd10} · MeSH {disease.meshId}</div>
          <div className="profile-badges"><span className="pbadge pbadge-blue">{disease.category}</span><span className="pbadge pbadge-amber">Unmet Need: {disease.unmetNeed}</span><span className="pbadge pbadge-teal">+{disease.cagr}% CAGR</span></div>
        </div>
        <div className="ph-meta"><div className="ph-meta-item"><div className="ph-meta-label">Prevalence</div><div className="ph-meta-val">{disease.prevalence}</div></div><div className="ph-meta-item"><div className="ph-meta-label">Market 2024</div><div className="ph-meta-val">${disease.marketSize2024}B</div></div><div className="ph-meta-item"><div className="ph-meta-label">Trials</div><div className="ph-meta-val positive">{disease.keyTrials.toLocaleString()}</div></div></div>
      </div>
      <div className="profile-body" style={{ borderTop: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)" }}>
        <section className="profile-section"><div className="section-title-row"><div className="section-icon blue"><DNAIcon /></div><div className="section-label">Disease Overview</div></div><div className="desc-box">{disease.description}</div><div className="info-grid">{[["Therapy Area", disease.therapyArea], ["Prevalence", disease.prevalence], ["Incidence", disease.incidence], ["Market 2030", `${disease.marketSize2030}B`], ["Key Trials", disease.keyTrials.toLocaleString()], ["Key Companies", disease.keyCompanies.join(", ")]].map(([label, value]) => <div key={label} className="info-card"><div className="info-label">{label}</div><div className="info-value">{value}</div></div>)}</div><div className="tag-list">{disease.keyDrugs.map(d => <span key={d} className="tag">{d}</span>)}</div></section>
        <section className="profile-section two-col">
          <div><div className="section-heading">Pipeline</div><table className="profile-table"><thead><tr><th>Drug</th><th>Company</th><th>Phase</th><th>Status</th></tr></thead><tbody>{pipeline.length ? pipeline.map(p => <tr key={`${p.drug}-${p.nctId}`}><td>{p.drug}</td><td>{p.company}</td><td>{p.phase}</td><td>{p.status}</td></tr>) : <tr><td colSpan="4">No pipeline records available.</td></tr>}</tbody></table></div>
          <div><div className="section-heading">Market Forecast</div><div className="mini-bars">{(epi?.marketSize || [{ year: 2024, size: disease.marketSize2024 }, { year: 2030, size: disease.marketSize2030 }]).map(m => <div key={m.year} className="mini-bar-row"><span>{m.year}</span><div className="mini-track"><div className="mini-fill" style={{ width: `${(m.size / maxMarket) * 100}%` }} /></div><strong>${m.size}B</strong></div>)}</div></div>
        </section>
        {epi && <section className="profile-section"><div className="section-title-row"><div className="section-icon teal"><PinIcon /></div><div className="section-label">Epidemiology Hotspots</div></div><div className="mini-bars">{epi.topCountries.map(c => <div key={c.country} className="mini-bar-row"><span>{c.country}</span><div className="mini-track"><div className="mini-fill" style={{ width: `${(c.cases / epi.topCountries[0].cases) * 100}%` }} /></div><strong>{c.cases.toLocaleString()}K</strong></div>)}</div></section>}
      </div>
    </div>
  );
};

const DiseaseView = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All");
  const areas = ["All", ...Array.from(new Set(DISEASES.map(d => d.therapyArea)))];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DISEASES.filter(d => (area === "All" || d.therapyArea === area) && (!q || d.name.toLowerCase().includes(q) || d.aliases.toLowerCase().includes(q) || d.therapyArea.toLowerCase().includes(q)));
  }, [search, area]);
  if (selected) return <DiseaseProfile disease={selected} onBack={() => { setSelected(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />;
  return (
    <div className="profile-page">
      <div className="stat-grid">
        {[{ label: "Diseases Tracked", val: DISEASES.length, delta: "Featured therapeutic areas" }, { label: "Pipeline Programs", val: Object.values(PIPELINE_DATA).flat().length, delta: "Mapped records" }, { label: "Active Trials", val: DISEASES.reduce((s, d) => s + d.keyTrials, 0).toLocaleString(), delta: "Across disease set" }, { label: "Global Market 2024", val: `${DISEASES.reduce((s, d) => s + d.marketSize2024, 0).toFixed(1)}B`, delta: "Selected markets" }].map(s => <div key={s.label} className="stat-card"><div className="stat-val">{s.val}</div><div className="stat-label">{s.label}</div><div className="stat-delta up">{s.delta}</div></div>)}
      </div>
      <div className="toolbar"><div className="search-box"><span className="search-icon"><SearchIcon /></span><input placeholder="Search disease name, alias, area..." value={search} onChange={e => setSearch(e.target.value)} /></div><select className="filter-select" value={area} onChange={e => setArea(e.target.value)}>{areas.map(a => <option key={a}>{a}</option>)}</select><span className="toolbar-info"><strong>{filtered.length}</strong> diseases</span></div>
      <div className="view-grid">{filtered.map(d => <div key={d.id} className="view-card" onClick={() => { setSelected(d); window.scrollTo({ top: 0, behavior: "smooth" }); }}><div className="view-card-title">{d.name}</div><div className="view-card-meta">{d.aliases} · ICD-10 {d.icd10}</div><div className="view-kpis"><div className="view-kpi"><div className="view-kpi-value">{d.prevalence}</div><div className="view-kpi-label">Prevalence</div></div><div className="view-kpi"><div className="view-kpi-value">${d.marketSize2024}B</div><div className="view-kpi-label">Market 2024</div></div><div className="view-kpi"><div className="view-kpi-value">+{d.cagr}%</div><div className="view-kpi-label">CAGR</div></div><div className="view-kpi"><div className="view-kpi-value">{d.keyTrials.toLocaleString()}</div><div className="view-kpi-label">Trials</div></div><div className="view-kpi"><div className="view-kpi-value">{d.unmetNeed}</div><div className="view-kpi-label">Unmet Need</div></div><div className="view-kpi"><div className="view-kpi-value">{d.therapyArea}</div><div className="view-kpi-label">Area</div></div></div><div className="view-tags"><span className="tag">{d.category}</span>{d.keyDrugs.slice(0, 2).map(k => <span key={k} className="tag" style={{ background: "var(--gray-100)", color: "var(--gray-600)", borderColor: "var(--gray-200)" }}>{k}</span>)}</div></div>)}</div>
    </div>
  );
};

// ─── PLACEHOLDER PAGE ─────────────────────────────────────────────────────────
const PlaceholderPage = ({ name }) => (
  <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--gray-400)" }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>{name}</div>
    <div style={{ fontSize: 14 }}>This section is under construction.</div>
  </div>
);

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = ["Drugs", "Clinical Trials", "Country View", "Disease View", "Companies", "Analytics", "Sites", "Investigators"];

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState("Drugs");
  const [drugSubTab, setDrugSubTab] = useState("Basic");
  const [trialSubTab, setTrialSubTab] = useState("Basic");

  const handleNav = (item) => {
    setActivePage(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Determine which subtabs to show based on active page
  const showSubtabs = activePage === "Drugs" || activePage === "Clinical Trials";
  const currentSubTabs = activePage === "Drugs" ? DRUG_SUBTABS : TRIAL_SUBTABS;
  const currentSubTab = activePage === "Drugs" ? drugSubTab : trialSubTab;
  const setCurrentSubTab = activePage === "Drugs" ? setDrugSubTab : setTrialSubTab;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="topnav">
          <button className="topnav-logo" onClick={() => handleNav("Drugs")}>
            <div className="topnav-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6"/>
              </svg>
            </div>
            <span className="topnav-brand">Pharma<span>Lens</span></span>
          </button>
          <div className="topnav-links">
            {NAV_ITEMS.map(item => (
              <button key={item} className={`topnav-link${activePage === item ? " active" : ""}`} onClick={() => handleNav(item)}>{item}</button>
            ))}
          </div>
        </nav>

        {/* ── SUBTABS BAR — only on Drugs and Clinical Trials pages ── */}
        {showSubtabs && (
          <div className="subtabs-bar">
            {currentSubTabs.map(tab => (
              <button
                key={tab}
                className={`stab${currentSubTab === tab ? " active" : ""}`}
                onClick={() => setCurrentSubTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        <div className="page-content">
          {activePage === "Drugs"           && <DrugsPage activeSubTab={drugSubTab} />}
          {activePage === "Clinical Trials" && <TrialsPage activeSubTab={trialSubTab} />}
          {activePage === "Country View"    && <CountryView />}
          {activePage === "Disease View"    && <DiseaseView />}
          {activePage === "Companies"       && <PlaceholderPage name="Companies" />}
          {activePage === "Analytics"       && <PlaceholderPage name="Analytics" />}
          {activePage === "Sites"           && <PlaceholderPage name="Sites" />}
          {activePage === "Investigators"   && <PlaceholderPage name="Investigators" />}
        </div>
      </div>
    </>
  );
}
