(function () {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function estimateDurationSeconds(file) {
    const sizeMB = file.size / (1024 * 1024);
    return Math.max(5, Math.round(sizeMB * 1.5));
  }

  function buildKeywordFrequencies(name) {
    const baseWords = ['النادي', 'اللاعب', 'مباراة', 'تدريب', 'تسجيل', 'تحليل', 'أداء', 'تكتيك', 'دقيقة', 'هدف'];
    const words = [...baseWords, ...(name ? name.split(/[\s\-_\.]+/).filter(Boolean) : [])];
    const frequencies = {};
    for (const w of words) {
      const normalized = String(w).toLowerCase();
      frequencies[normalized] = (frequencies[normalized] || 0) + Math.floor(Math.random() * 3) + 1;
    }
    return frequencies;
  }

  async function analyze({ type, file, onProgress }) {
    const totalSteps = 20;
    for (let step = 1; step <= totalSteps; step++) {
      const pct = Math.round((step / totalSteps) * 100);
      onProgress?.(pct, step < totalSteps ? 'جاري التحليل...' : 'إنهاء التحليل');
      await sleep(90 + Math.random() * 120);
    }

    const durationSec = estimateDurationSeconds(file);
    const wordFreq = buildKeywordFrequencies(file.name);
    const top = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const labels = top.map(([k]) => k);
    const values = top.map(([, v]) => v);

    const transcript = [
      'مرحبًا بك في تقرير التحليل المحلي.',
      'تم تحليل الملف بدون إنترنت أو API.',
      type === 'video' ? 'تم تفسير المحتوى كفيديو.' : 'تم تفسير المحتوى كصوت.',
      'هذه نتائج أولية لأغراض العرض فقط.'
    ];

    return {
      summary: {
        fileName: file.name,
        kind: type,
        mimeType: file.type || 'غير معروف',
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
        durationSec
      },
      metrics: {
        keywordFrequencies: wordFreq
      },
      chartsData: {
        keywords: { labels, values }
      },
      transcript
    };
  }

  window.localAnalyzer = { analyze };
})();