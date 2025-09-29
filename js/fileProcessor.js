(function () {
  const MAX_SIZE_MB = 500;

  function validateFile(expectedType, file) {
    if (!file) throw new Error('الرجاء اختيار ملف');
    const isVideo = file.type?.startsWith('video/');
    const isAudio = file.type?.startsWith('audio/');

    if (expectedType === 'video' && !isVideo) {
      throw new Error('الملف المحدد ليس فيديو');
    }
    if (expectedType === 'audio' && !isAudio) {
      throw new Error('الملف المحدد ليس صوتًا');
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      throw new Error(`حجم الملف يتجاوز الحد (${MAX_SIZE_MB}MB)`);
    }
  }

  async function processAndAnalyze(expectedType, file, { onProgress }) {
    validateFile(expectedType, file);
    return await window.localAnalyzer.analyze({
      type: expectedType,
      file,
      onProgress
    });
  }

  window.fileProcessor = {
    processAndAnalyze
  };
})();