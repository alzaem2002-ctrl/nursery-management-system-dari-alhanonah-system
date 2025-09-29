(function () {
  function humanizeSeconds(sec) {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) return `${hours}س ${minutes}د ${seconds}ث`;
    if (minutes > 0) return `${minutes}د ${seconds}ث`;
    return `${seconds}ث`;
  }

  function renderSummaryCard(summary) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-800 rounded-xl p-4 card-hover">
          <div class="text-gray-400 text-sm mb-1">اسم الملف</div>
          <div class="font-bold">${summary.fileName}</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 card-hover">
          <div class="text-gray-400 text-sm mb-1">النوع</div>
          <div class="font-bold">${summary.kind === 'video' ? 'فيديو' : 'صوت'}</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 card-hover">
          <div class="text-gray-400 text-sm mb-1">الحجم</div>
          <div class="font-bold">${summary.sizeMB} MB</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 card-hover">
          <div class="text-gray-400 text-sm mb-1">المدّة التقديرية</div>
          <div class="font-bold">${humanizeSeconds(summary.durationSec)}</div>
        </div>
      </div>
    `;
  }

  function renderTranscript(lines) {
    const items = lines.map((l) => `<li class="mb-2 leading-relaxed">${l}</li>`).join('');
    return `
      <div class="bg-gray-800 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3">
          <i class="fas fa-file-alt text-blue-400"></i>
          <h3 class="font-bold">تفريغ مختصر</h3>
        </div>
        <ul class="list-disc pr-6">${items}</ul>
      </div>
    `;
  }

  function renderKeywordsChart(canvasEl, labels, values) {
    new Chart(canvasEl, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'تكرار الكلمات',
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#fff' } }
        },
        scales: {
          x: {
            ticks: { color: '#cbd5e1' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            ticks: { color: '#cbd5e1' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            beginAtZero: true,
            precision: 0
          }
        }
      }
    });
  }

  function htmlEscape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sectionHeader(icon, title, actions = '') {
    return `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="${icon}"></i>
          <h3 class="font-bold">${title}</h3>
        </div>
        <div class="flex items-center gap-2">${actions}</div>
      </div>
    `;
  }

  function renderEditableReport(report) {
    // Controls
    const actions = `
      <button id="btnPrint" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded" title="طباعة">
        <i class="fas fa-print"></i>
      </button>
      <button id="btnExportJson" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded" title="تصدير JSON">
        <i class="fas fa-file-export"></i> JSON
      </button>
      <button id="btnExportMd" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded" title="تصدير Markdown">
        <i class="fas fa-file-lines"></i> MD
      </button>
    `;

    return `
      <div id="meetingReport" class="bg-gray-800 rounded-xl p-4 print:bg-white print:text-black">
        ${sectionHeader('fas fa-clipboard-list text-yellow-400', 'تقرير اجتماع النادي الإعلامي', actions)}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-xs text-gray-400">العنوان</label>
            <input id="repTitle" class="w-full mt-1 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(report.meta.title)}" />
          </div>
          <div>
            <label class="text-xs text-gray-400">النادي</label>
            <input id="repClub" class="w-full mt-1 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(report.meta.clubName)}" />
          </div>
          <div>
            <label class="text-xs text-gray-400">التاريخ والوقت</label>
            <input id="repDate" type="datetime-local" class="w-full mt-1 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(report.meta.date)}" />
          </div>
          <div>
            <label class="text-xs text-gray-400">المكان</label>
            <input id="repLocation" class="w-full mt-1 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(report.meta.location)}" />
          </div>
          <div>
            <label class="text-xs text-gray-400">المُيسّر</label>
            <input id="repModerator" class="w-full mt-1 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(report.meta.moderator)}" />
          </div>
          <div>
            <label class="text-xs text-gray-400">المُحرّر</label>
            <input id="repRecorder" class="w-full mt-1 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(report.meta.recorder)}" />
          </div>
        </div>

        <div class="mb-6">
          ${sectionHeader('fas fa-users text-blue-400', 'الحضور')}
          <div id="repParticipants" class="grid gap-2">
            ${report.participants.map((p, idx) => `
              <div class="grid grid-cols-2 gap-2">
                <input data-field="name" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(p.name)}" />
                <input data-field="role" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(p.role)}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-6">
          ${sectionHeader('fas fa-list-check text-green-400', 'جدول الأعمال')}
          <div id="repAgenda" class="grid gap-3">
            ${report.agenda.map((a, idx) => `
              <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input data-field="topic" data-idx="${idx}" class="md:col-span-3 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.topic)}" />
                <input data-field="timeAllocatedMin" data-idx="${idx}" type="number" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.timeAllocatedMin)}" />
                <input data-field="notes" data-idx="${idx}" class="md:col-span-2 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.notes)}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-6">
          ${sectionHeader('fas fa-comments text-purple-400', 'أبرز النقاشات')}
          <div id="repHighlights" class="grid gap-2">
            ${report.discussionHighlights.map((d, idx) => `
              <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input data-field="time" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.time)}" />
                <input data-field="note" data-idx="${idx}" class="md:col-span-3 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.note)}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-6">
          ${sectionHeader('fas fa-gavel text-red-400', 'القرارات والتصويت')}
          <div id="repDecisions" class="grid gap-3">
            ${report.decisions.map((d, idx) => `
              <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input data-field="description" data-idx="${idx}" class="md:col-span-3 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.description)}" />
                <input data-field="rationale" data-idx="${idx}" class="md:col-span-3 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.rationale)}" />
                <div class="grid grid-cols-3 gap-2 md:col-span-3">
                  <input data-field="vote.yes" data-idx="${idx}" type="number" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.vote.yes)}" />
                  <input data-field="vote.no" data-idx="${idx}" type="number" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.vote.no)}" />
                  <input data-field="vote.abstain" data-idx="${idx}" type="number" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.vote.abstain)}" />
                </div>
                <input data-field="owner" data-idx="${idx}" class="md:col-span-2 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(d.owner || '')}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-6">
          ${sectionHeader('fas fa-list-ul text-teal-400', 'مهام المتابعة')}
          <div id="repActions" class="grid gap-2">
            ${report.actionItems.map((a, idx) => `
              <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input data-field="task" data-idx="${idx}" class="md:col-span-2 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.task)}" />
                <input data-field="assignee" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.assignee)}" />
                <input data-field="dueDate" data-idx="${idx}" type="date" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.dueDate)}" />
                <input data-field="priority" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(a.priority)}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-6">
          ${sectionHeader('fas fa-triangle-exclamation text-orange-400', 'المخاطر والإجراءات الوقائية')}
          <div id="repRisks" class="grid gap-2">
            ${report.risks.map((r, idx) => `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input data-field="risk" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(r.risk)}" />
                <input data-field="mitigation" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(r.mitigation)}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-2">
          ${sectionHeader('fas fa-paperclip text-sky-400', 'موارد وروابط مساعدة')}
          <div id="repResources" class="grid gap-2">
            ${report.resources.map((r, idx) => `
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input data-field="label" data-idx="${idx}" class="p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(r.label)}" />
                <input data-field="url" data-idx="${idx}" class="md:col-span-2 p-2 bg-gray-900 rounded border border-gray-700" value="${htmlEscape(r.url)}" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mt-4">
          <label class="text-xs text-gray-400">ملاحظات إضافية</label>
          <textarea id="repNotes" class="w-full mt-1 p-3 bg-gray-900 rounded border border-gray-700" rows="4">${htmlEscape(report.editableNotes || '')}</textarea>
        </div>
      </div>
    `;
  }

  function toMarkdown(report) {
    const lines = [];
    lines.push(`# ${report.meta.title}`);
    lines.push(`- النادي: ${report.meta.clubName}`);
    lines.push(`- التاريخ: ${report.meta.date}`);
    lines.push(`- المكان: ${report.meta.location}`);
    lines.push(`- المُيسّر: ${report.meta.moderator}`);
    lines.push(`- المُحرّر: ${report.meta.recorder}`);
    lines.push(`- المصدر: ${report.meta.sourceType} — ${report.meta.sourceFile}`);
    lines.push('');
    lines.push('## الحضور');
    report.participants.forEach(p => lines.push(`- ${p.name} (${p.role})`));
    lines.push('');
    lines.push('## جدول الأعمال');
    report.agenda.forEach(a => lines.push(`- ${a.topic} — ${a.timeAllocatedMin}د — ${a.notes}`));
    lines.push('');
    lines.push('## أبرز النقاشات');
    report.discussionHighlights.forEach(d => lines.push(`- [${d.time}] ${d.note}`));
    lines.push('');
    lines.push('## القرارات والتصويت');
    report.decisions.forEach(d => lines.push(`- ${d.description} — سبب: ${d.rationale} — تصويت: نعم ${d.vote.yes}، لا ${d.vote.no}، امتناع ${d.vote.abstain} — ${d.approved ? 'معتمد' : 'مرفوض'}`));
    lines.push('');
    lines.push('## مهام المتابعة');
    report.actionItems.forEach(a => lines.push(`- ${a.task} — ${a.assignee} — قبل ${a.dueDate} — أولوية ${a.priority} — حالة ${a.status || 'مفتوح'}`));
    lines.push('');
    lines.push('## المخاطر');
    report.risks.forEach(r => lines.push(`- ${r.risk} — إجراء: ${r.mitigation}`));
    lines.push('');
    lines.push('## الموارد');
    report.resources.forEach(r => lines.push(`- ${r.label}: ${r.url}`));
    lines.push('');
    lines.push('## ملاحظات');
    lines.push(report.editableNotes || '');
    return lines.join('\n');
  }

  function downloadBlob(filename, mime, content) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function bindReportControls(report) {
    const container = document.getElementById('meetingReport');
    const getInputs = (selector) => Array.from(container.querySelectorAll(selector));

    // Update model on input changes
    const metaMap = {
      repTitle: ['meta', 'title'],
      repClub: ['meta', 'clubName'],
      repDate: ['meta', 'date'],
      repLocation: ['meta', 'location'],
      repModerator: ['meta', 'moderator'],
      repRecorder: ['meta', 'recorder']
    };
    Object.keys(metaMap).forEach((id) => {
      const el = document.getElementById(id);
      el?.addEventListener('input', () => {
        const path = metaMap[id];
        report[path[0]][path[1]] = el.value;
      });
    });

    getInputs('#repParticipants input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        report.participants[idx][field] = el.value;
      });
    });

    getInputs('#repAgenda input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        const value = field === 'timeAllocatedMin' ? Number(el.value) : el.value;
        report.agenda[idx][field] = value;
      });
    });

    getInputs('#repHighlights input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        report.discussionHighlights[idx][field] = el.value;
      });
    });

    getInputs('#repDecisions input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        if (field?.startsWith('vote.')) {
          const key = field.split('.')[1];
          report.decisions[idx].vote[key] = Number(el.value);
        } else if (field) {
          report.decisions[idx][field] = el.value;
        }
      });
    });

    getInputs('#repActions input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        report.actionItems[idx][field] = el.value;
      });
    });

    getInputs('#repRisks input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        report.risks[idx][field] = el.value;
      });
    });

    getInputs('#repResources input').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.idx);
        const field = el.dataset.field;
        report.resources[idx][field] = el.value;
      });
    });

    const notesEl = document.getElementById('repNotes');
    notesEl?.addEventListener('input', () => {
      report.editableNotes = notesEl.value;
    });

    document.getElementById('btnPrint')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnExportJson')?.addEventListener('click', () => {
      downloadBlob('meeting-report.json', 'application/json', JSON.stringify(report, null, 2));
    });

    document.getElementById('btnExportMd')?.addEventListener('click', () => {
      downloadBlob('meeting-report.md', 'text/markdown', toMarkdown(report));
    });
  }

  function renderMeetingReport(report) {
    const root = document.getElementById('mainContent');
    if (!root) return;

    root.insertAdjacentHTML('beforeend', `
      <section class="animate-fade-in mt-6">
        ${renderEditableReport(report)}
      </section>
    `);

    bindReportControls(report);
  }

  function render(result) {
    const root = document.getElementById('mainContent');
    if (!root) return;

    root.innerHTML = `
      <section class="animate-fade-in">
        ${renderSummaryCard(result.summary)}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-gray-800 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-chart-column text-green-400"></i>
              <h3 class="font-bold">الكلمات الأكثر تكرارًا</h3>
            </div>
            <canvas id="keywordsChart" height="120"></canvas>
          </div>
          ${renderTranscript(result.transcript)}
        </div>
      </section>
    `;

    const canvas = document.getElementById('keywordsChart');
    if (canvas && result.chartsData?.keywords) {
      renderKeywordsChart(canvas, result.chartsData.keywords.labels, result.chartsData.keywords.values);
    }

    if (result.meetingReport) {
      renderMeetingReport(result.meetingReport);
    }
  }

  window.reportGenerator = { render };
})();