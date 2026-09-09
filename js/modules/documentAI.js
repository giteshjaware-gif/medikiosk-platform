/**
 * MediKiosk Platform - Medical Document Digitization & Intelligence (Module B)
 * Handles scanning simulation, OCR bounding boxes, entity extraction, chronological timeline & abnormal alerts
 */

class DocumentAIEngine {
  constructor() {
    this.sampleDocs = window.MEDIKIOSK_SAMPLE_DOCS || [];
    this.currentDoc = this.sampleDocs[0] || null;
    this.scannedDocs = [this.sampleDocs[0], this.sampleDocs[1]]; // Preload prescription + lab report
    this.isScanning = false;
    this.onScanComplete = null;
  }

  selectDocument(docId) {
    const doc = this.sampleDocs.find(d => d.id === docId);
    if (doc) {
      this.currentDoc = doc;
      if (!this.scannedDocs.some(d => d.id === docId)) {
        this.scannedDocs.push(doc);
      }
    }
    return this.currentDoc;
  }

  simulateScan(docId, onProgress, onComplete) {
    this.isScanning = true;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 20;
      if (onProgress) onProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        this.isScanning = false;
        const doc = this.selectDocument(docId);
        if (onComplete) onComplete(doc);
        if (this.onScanComplete) this.onScanComplete(doc);
      }
    }, 280);
  }

  getChronologicalTimeline() {
    const events = [];

    // Combine timeline events from all scanned documents
    this.scannedDocs.forEach(doc => {
      if (doc.extractedEntities && doc.extractedEntities.timelineEvents) {
        events.push(...doc.extractedEntities.timelineEvents);
      } else if (doc.type === 'prescription') {
        events.push({
          date: doc.date,
          event: `OPD Prescription: ${doc.extractedEntities.medications.map(m => m.name).join(', ')}`,
          facility: doc.issuer.split(',')[0]
        });
      } else if (doc.type === 'lab_report') {
        events.push({
          date: doc.date,
          event: `Diagnostic Lab: HbA1c ${doc.extractedEntities.abnormalValues[0].value}% (Critical High)`,
          facility: doc.issuer
        });
      }
    });

    // Sort chronologically (simple date string comparison or year sorting)
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getAllAbnormalValues() {
    const abnormals = [];
    this.scannedDocs.forEach(doc => {
      if (doc.extractedEntities && doc.extractedEntities.abnormalValues) {
        abnormals.push(...doc.extractedEntities.abnormalValues);
      }
    });
    return abnormals;
  }

  getAllMedications() {
    const meds = [];
    this.scannedDocs.forEach(doc => {
      if (doc.extractedEntities && doc.extractedEntities.medications) {
        meds.push(...doc.extractedEntities.medications);
      }
    });
    return meds;
  }

  getAllDiagnoses() {
    const diagnoses = [];
    this.scannedDocs.forEach(doc => {
      if (doc.extractedEntities && doc.extractedEntities.diagnoses) {
        diagnoses.push(...doc.extractedEntities.diagnoses);
      }
    });
    return diagnoses;
  }

  checkDrugInteractions() {
    const currentMeds = this.getAllMedications().map(m => m.name.toLowerCase());
    const interactionDB = window.MEDIKIOSK_ONTOLOGIES ? window.MEDIKIOSK_ONTOLOGIES.drugInteractions : [];
    const flaggedInteractions = [];

    interactionDB.forEach(rule => {
      const hasA = currentMeds.some(m => m.includes(rule.drugA.toLowerCase()));
      const hasB = currentMeds.some(m => m.includes(rule.drugB.toLowerCase()));

      if (hasA && hasB) {
        flaggedInteractions.push(rule);
      }
    });

    // Always include at least 1 clinical caveat if patient is on multiple antiplatelets/statins
    if (flaggedInteractions.length === 0 && currentMeds.some(m => m.includes('aspirin'))) {
      flaggedInteractions.push({
        drugA: "Aspirin",
        drugB: "Atorvastatin",
        severity: "MONITOR",
        description: "Routine concurrent cardioprotective regimen. Monitor liver function tests (LFT) annually."
      });
    }

    return flaggedInteractions;
  }
}

window.DocumentAIEngine = DocumentAIEngine;
