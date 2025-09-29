(function () {
  const errorEl = document.getElementById('errorAlert');
  const errorMsgEl = document.getElementById('errorMessage');
  const successEl = document.getElementById('successAlert');
  const successMsgEl = document.getElementById('successMessage');

  function show(el) {
    if (el) el.classList.remove('hidden');
  }

  function hide(el) {
    if (el) el.classList.add('hidden');
  }

  window.errorHandler = {
    showError(message) {
      if (errorMsgEl) errorMsgEl.textContent = message || 'حدث خطأ غير معروف';
      show(errorEl);
    },
    hideError() {
      hide(errorEl);
    },
    showSuccess(message) {
      if (successMsgEl) successMsgEl.textContent = message || 'تمت العملية بنجاح';
      show(successEl);
    },
    hideSuccess() {
      hide(successEl);
    }
  };
})();