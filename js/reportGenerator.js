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
  }

  window.reportGenerator = { render };
})();