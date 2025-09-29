(function () {
  const localNoteEl = document.getElementById('localModeNotification');
  const loadingEl = document.getElementById('loadingState');
  const loadingTitleEl = document.getElementById('loadingTitle');
  const loadingMsgEl = document.getElementById('loadingMessage');
  const loadingPctEl = document.getElementById('loadingPercentage');
  const loadingBarEl = document.getElementById('loadingProgress');
  const mainEl = document.getElementById('mainContent');

  const state = {
    currentType: null,
    selectedFile: null
  };

  function showLoading(title, message) {
    if (loadingTitleEl) loadingTitleEl.textContent = title || 'جاري التحميل';
    if (loadingMsgEl) loadingMsgEl.textContent = message || 'قد تستغرق العملية بضع دقائق...';
    if (loadingBarEl) loadingBarEl.style.width = '0%';
    if (loadingPctEl) loadingPctEl.textContent = '0%';
    if (loadingEl) loadingEl.classList.remove('hidden');
  }

  function updateLoadingProgress(percent, message) {
    const pct = Math.max(0, Math.min(100, Math.round(percent)));
    if (loadingBarEl) loadingBarEl.style.width = pct + '%';
    if (loadingPctEl) loadingPctEl.textContent = pct + '%';
    if (message && loadingMsgEl) loadingMsgEl.textContent = message;
  }

  function hideLoading() {
    if (loadingEl) loadingEl.classList.add('hidden');
  }

  function showNotification() {
    if (localNoteEl) localNoteEl.classList.remove('hidden');
  }

  function hideNotification() {
    if (localNoteEl) localNoteEl.classList.add('hidden');
  }

  function renderLanding() {
    if (!mainEl) return;
    mainEl.innerHTML = `
      <section class="animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-800 rounded-xl p-6 card-hover">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-lg">تحليل فيديو</h2>
              <span class="text-green-400 text-xs">محلي</span>
            </div>
            <p class="text-gray-300 mt-2 mb-4">قم برفع ملف فيديو لتحليل المحتوى.</p>
            <button class="bg-green-700 hover:bg-green-600 px-4 py-2 rounded" onclick="app.showUploadView('video')">
              رفع فيديو
            </button>
          </div>
          <div class="bg-gray-800 rounded-xl p-6 card-hover">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-lg">تحليل صوت</h2>
              <span class="text-green-400 text-xs">محلي</span>
            </div>
            <p class="text-gray-300 mt-2 mb-4">قم برفع ملف صوتي لتحليل المحتوى.</p>
            <button class="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded" onclick="app.showUploadView('audio')">
              رفع صوت
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function renderUpload(type) {
    if (!mainEl) return;
    const accept = type === 'video' ? 'video/*' : 'audio/*';
    mainEl.innerHTML = `
      <section class="animate-fade-in">
        <div class="bg-gray-800 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas ${type === 'video' ? 'fa-video' : 'fa-microphone'} text-blue-400"></i>
            <h2 class="font-bold">${type === 'video' ? 'رفع فيديو' : 'رفع صوت'}</h2>
          </div>
          <div class="grid gap-4">
            <input id="fileInput" class="block w-full text-sm text-gray-200 bg-gray-900 rounded border border-gray-700 p-3"
              type="file" accept="${accept}" />
            <div class="flex items-center gap-3">
              <button id="analyzeBtn" class="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded disabled:opacity-50" disabled>
                بدء التحليل
              </button>
              <button class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onclick="app.init()">
                رجوع
              </button>
              <span class="text-xs text-gray-400">المعالجة محليًا — لا يتم رفع الملف</span>
            </div>
          </div>
        </div>
      </section>
    `;

    const input = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');

    input?.addEventListener('change', () => {
      state.selectedFile = input.files && input.files[0] ? input.files[0] : null;
      if (state.selectedFile) {
        analyzeBtn?.removeAttribute('disabled');
      } else {
        analyzeBtn?.setAttribute('disabled', 'true');
      }
    });

    analyzeBtn?.addEventListener('click', async () => {
      if (!state.selectedFile) return;
      try {
        errorHandler.hideError();
        showLoading('جاري تحليل الملف', 'قد تستغرق العملية بضع دقائق...');
        const result = await fileProcessor.processAndAnalyze(type, state.selectedFile, {
          onProgress: (pct, message) => updateLoadingProgress(pct, message)
        });
        hideLoading();
        errorHandler.showSuccess('تم التحليل بنجاح');
        setTimeout(() => errorHandler.hideSuccess(), 2000);
        reportGenerator.render(result);
      } catch (err) {
        hideLoading();
        errorHandler.showError(err?.message || 'تعذر تحليل الملف');
      }
    });
  }

  window.app = {
    init() {
      state.currentType = null;
      state.selectedFile = null;
      renderLanding();
    },
    showUploadView(type) {
      state.currentType = type;
      state.selectedFile = null;
      renderUpload(type);
    },
    showLocalModeInfo() {
      if (localNoteEl) localNoteEl.classList.remove('hidden');
    },
    hideNotification() {
      if (localNoteEl) localNoteEl.classList.add('hidden');
    },
    hideError: () => errorHandler.hideError(),
    hideSuccess: () => errorHandler.hideSuccess(),
    showLoading,
    updateLoadingProgress,
    hideLoading
  };
})();