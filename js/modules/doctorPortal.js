/**
 * MediKiosk Platform - Step 5 Physician Consultation Portal (Module C & D)
 * 15-Second Structured History Digest, Live OPD Queue, Inline Verification & HIS Sign-Off
 */

class DoctorPortal {
  constructor(summarizer, documentAIEngine) {
    this.summarizer = summarizer;
    this.documentAIEngine = documentAIEngine;
    this.activePatientId = "p_01";
    this.isSignedOff = false;

    this.queue = [
      {
        id: "p_01",
        token: "OPD-T24",
        name: "Suresh Kumar",
        age: 54,
        gender: "M",
        abhaId: "91-4521-8890-1234",
        chiefComplaint: "Retrosternal Chest Discomfort (Angina on Exertion)",
        priority: "ROUTINE / CHRONIC REVIEW",
        priorityColor: "emerald",
        waitTime: "4 mins ago",
        hasScannedDocs: true,
        summaryReady: true
      },
      {
        id: "p_02",
        token: "STAT #E-01",
        name: "Rajesh Verma",
        age: 48,
        gender: "M",
        abhaId: "14-9982-3341-7789",
        chiefComplaint: "Acute Crushing Chest Pain + Diaphoresis & Dyspnoea",
        priority: "EMERGENCY RED-FLAG (PRIORITY 1)",
        priorityColor: "rose",
        waitTime: "1 min ago (TRIAGE ALERT)",
        hasScannedDocs: true,
        summaryReady: true
      },
      {
        id: "p_03",
        token: "OPD-T25",
        name: "Meena Devi",
        age: 62,
        gender: "F",
        abhaId: "42-7819-0012-5544",
        chiefComplaint: "Productive Cough > 2 Weeks & Intermittent Evening Fever",
        priority: "SUBACUTE INFECTION / TB SCREEN",
        priorityColor: "amber",
        waitTime: "8 mins ago",
        hasScannedDocs: false,
        summaryReady: true
      }
    ];
  }

  selectPatient(patientId) {
    this.activePatientId = patientId;
    this.isSignedOff = false;
    this.renderDoctorDashboard();
  }

  renderDoctorDashboard() {
    this.renderPatientQueue();
    this.renderSummaryDigest();
  }

  renderPatientQueue() {
    const queueList = document.getElementById('doctor-patient-queue');
    if (!queueList) return;

    queueList.innerHTML = this.queue.map(p => {
      const isSelected = p.id === this.activePatientId;
      const isEmergency = p.priorityColor === 'rose';

      return `
        <button onclick="window.doctorPortal.selectPatient('${p.id}')"
          class="w-full text-left p-3 rounded-xl border transition-all ${
            isSelected
              ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          } ${isEmergency ? 'border-l-4 border-l-rose-500' : ''}">
          <div class="flex items-center justify-between mb-1">
            <span class="font-mono text-xs font-bold ${isEmergency ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}">${p.token}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded ${
              isEmergency
                ? 'bg-rose-500/20 text-rose-300 font-bold'
                : 'bg-slate-800 text-slate-400'
            }">${p.waitTime}</span>
          </div>
          <div class="font-semibold text-sm text-white">${p.name} <span class="text-xs font-normal text-slate-400">(${p.age}y / ${p.gender})</span></div>
          <p class="text-xs text-slate-400 truncate mt-0.5">${p.chiefComplaint}</p>
          <div class="mt-2 flex items-center justify-between text-[10px]">
            <span class="text-slate-500 font-mono">ABHA: ${p.abhaId}</span>
            <span class="text-emerald-400 font-medium flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Summary Ready
            </span>
          </div>
        </button>
      `;
    }).join('');
  }

  renderSummaryDigest() {
    const patient = this.queue.find(p => p.id === this.activePatientId) || this.queue[0];
    const digestContainer = document.getElementById('doctor-summary-container');
    if (!digestContainer) return;

    // Use current summarizer or mock details
    const summary = this.summarizer.currentSummary || this.summarizer.generateSummary(
      patient,
      {
        site: { clinicalTag: "Retrosternal chest" },
        onset: { clinicalTag: "Exertional onset on climbing stairs" },
        character: { clinicalTag: "Dull heavy pressure" },
        radiation: { clinicalTag: "Radiating to left upper arm" },
        associations: { clinicalTag: "Mild diaphoresis, no syncope" },
        time_course: { clinicalTag: "Episodes lasting 5-10 mins" },
        exacerbating: { clinicalTag: "Relieved promptly with rest" },
        severity: { clinicalTag: "Severity 6/10" }
      },
      this.documentAIEngine.scannedDocs,
      'allopathy'
    );

    const isEmergency = patient.priorityColor === 'rose';

    digestContainer.innerHTML = `
      <!-- Header Banner -->
      <div class="p-4 rounded-xl ${isEmergency ? 'bg-rose-950/40 border border-rose-500/50' : 'bg-slate-800/80 border border-slate-700/80'} mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded text-xs font-bold ${
              isEmergency ? 'bg-rose-500 text-white animate-pulse' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }">${patient.token}</span>
            <h2 class="text-lg font-bold text-white">${patient.name}</h2>
            <span class="text-xs text-slate-400 font-mono">(${patient.age}Y &bull; ${patient.gender} &bull; ABHA: ${patient.abhaId})</span>
          </div>
          <p class="text-xs ${isEmergency ? 'text-rose-300 font-medium' : 'text-slate-300'}">
            ${isEmergency ? '&#9888; CRITICAL TRIAGE ALERT: RED FLAG PRIORITY' : 'Routine OPD Clinical History Self-Recorded at MediKiosk Terminal #04'}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="window.doctorPortal.viewFhirBundle()" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            Inspect FHIR R4 Bundle
          </button>
          <button onclick="window.doctorPortal.signOffToHis()" id="btn-sign-off-his" class="px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${
            this.isSignedOff
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
          }">
            ${this.isSignedOff ? '&#10003; Verified & Synced to HIS/EMR' : 'Verify, Sign & Commit to HIS'}
          </button>
        </div>
      </div>

      <!-- Rapid 15-Second Clinical Digest Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Col 1: Chief Complaint & HPI -->
        <div class="lg:col-span-2 space-y-4">
          <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                1. Chief Complaint & HPI (SOCRATES Clinical Reasoning)
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">ICD-10: R07.9 | SNOMED: 29857009</span>
            </div>
            <textarea id="doctor-hpi-edit" rows="3" class="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed resize-none">${summary.hpiNarrative}</textarea>
            <div class="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>&#9998; Editable draft narrative: click to add or modify clinical notes</span>
              <span class="text-emerald-400">Speech-to-Text & Touch-verified</span>
            </div>
          </div>

          <!-- Past Medical / Surgical / Stent Timeline -->
          <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                2. Chronological Medical History & Prior Procedures
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">OCR Synthesized</span>
            </div>
            <div class="space-y-2">
              ${summary.pastDiagnoses.map(d => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span class="font-semibold text-white">${d.condition}</span>
                    <span class="text-slate-400 ml-2 text-[11px]">(${d.duration})</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] ${d.control && d.control.includes('Sub-optimal') ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'} font-medium">
                    ${d.control || d.status}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Col 2: Active Medications, Allergies & Lab Highlights -->
        <div class="space-y-4">
          <!-- Allergies Card -->
          <div class="p-3.5 bg-rose-950/30 rounded-xl border border-rose-500/40">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Drug Allergies (Alert)
              </span>
              <span class="text-[10px] text-rose-400 font-bold">HIGH RISK</span>
            </div>
            ${summary.allergies.map(a => `
              <div class="text-xs text-rose-200 mt-1">
                <p class="font-bold text-white">${a.allergen}</p>
                <p class="text-[11px] text-rose-300/80">${a.reaction}</p>
              </div>
            `).join('')}
          </div>

          <!-- Active Prescribed Regimen -->
          <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">Active Medications (Module B OCR)</span>
            <div class="space-y-1.5 text-xs">
              ${summary.activeMedications.map(m => `
                <div class="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span class="font-medium text-slate-200">${m.name} <span class="text-cyan-400">${m.dosage}</span></span>
                  <span class="text-[10px] text-slate-400">${m.indication}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Out of range Labs -->
          <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">Recent Lab Values (Abnormal Highlighted)</span>
            <div class="space-y-1.5 text-xs">
              ${summary.labHighlights.map(l => `
                <div class="flex items-center justify-between p-1.5 rounded ${
                  l.flag.includes('HIGH') ? 'bg-amber-950/30 border border-amber-500/30 text-amber-200' : 'bg-slate-950 text-slate-300'
                }">
                  <span>${l.test}: <b>${l.result}</b></span>
                  <span class="text-[10px] font-bold ${l.flag.includes('CRITICAL') ? 'text-rose-400' : 'text-amber-400'}">${l.flag}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Doctor Consultation Action / Notes Pad -->
      <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-white uppercase tracking-wider">Physician Clinical Assessment & Plan:</span>
          <span class="text-xs text-slate-400">Dr. Vivek Mehra, MD (Reg: NMC-DL-2014-99812)</span>
        </div>
        <textarea id="doctor-plan-notes" rows="2" placeholder="Enter clinical assessment, physical exam findings (vitals, auscultation), or new prescriptions..." class="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed resize-none">Physician Exam: S1 S2 heard. Chest clear, no wheezing or basal crepitations. ECG reveals sinus rhythm with non-specific T wave flattening in V4-V6. Advised cardiac stress test & Cardiology referral. Adjusted Atorvastatin to 40mg HS.</textarea>
      </div>
    `;
  }

  signOffToHis() {
    this.isSignedOff = true;
    const btn = document.getElementById('btn-sign-off-his');
    if (btn) {
      btn.className = "px-4 py-1.5 rounded-lg font-semibold text-xs bg-emerald-600 text-white cursor-default flex items-center gap-1.5";
      btn.innerHTML = `
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span>Committed & Signed to Hospital EMR (FHIR Sync Done)</span>
      `;
    }

    // Trigger notification toast
    alert("Clinical History Verified & Committed! Structured summary pushed via FHIR R4 Bundle to Hospital EMR and linked to ABHA Record #91-4521-8890-1234.");
  }

  viewFhirBundle() {
    const modal = document.getElementById('fhir-bundle-modal');
    const jsonPre = document.getElementById('fhir-bundle-json');
    if (modal && jsonPre) {
      const bundle = this.summarizer.fhirBundle || this.summarizer.buildFHIRBundle(this.summarizer.currentSummary);
      jsonPre.textContent = JSON.stringify(bundle, null, 2);
      modal.classList.remove('hidden');
    }
  }

  closeFhirModal() {
    const modal = document.getElementById('fhir-bundle-modal');
    if (modal) modal.classList.add('hidden');
  }

  copyFhirJson() {
    const jsonPre = document.getElementById('fhir-bundle-json');
    if (jsonPre) {
      navigator.clipboard.writeText(jsonPre.textContent).then(() => {
        alert("FHIR R4 Bundle JSON copied to clipboard!");
      });
    }
  }
}

window.DoctorPortal = DoctorPortal;
