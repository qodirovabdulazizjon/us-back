// Bosqichlarni almashtiruvchi funksiya
function showStep(stepName) {
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });
  
  const activeStep = document.getElementById(`step-${stepName}`);
  if (activeStep) {
    activeStep.classList.add('active');
  }
}

// Backend so'rovini taqlid qiluvchi soxta API (Mock Fetch)
async function mockBackendAPI(endpoint, payload) {
  // Tarmoq kechikishini taqlid qilish (1 soniya)
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (endpoint === '/api/send-phone') {
    // Telefon yuborildi -> Backend sms kod talab qiladi
    return { success: true, nextStep: 'code' };
  } 
  
  if (endpoint === '/api/verify-code') {
    // Agar kod 12345 bo'lsa 2FA so'raymiz, aks holda to'g'ridan-to'g'ri kiramiz
    if (payload.code === "12345") {
      return { success: true, nextStep: '2fa' };
    }
    return { success: true, nextStep: 'success' };
  }

  if (endpoint === '/api/verify-2fa') {
    return { success: true, nextStep: 'success' };
  }

  return { success: false };
}

// 1. Telefon raqami formasi
document.getElementById('phone-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('phone-input').value;

  // Backend response olish
  const response = await mockBackendAPI('/api/send-phone', { phone });

  if (response.nextStep === 'code') {
    document.getElementById('code-sent-to').innerText = `Kodni ${phone} raqamiga yubordik:`;
    showStep('code');
  }
});

// 2. Kodni tekshirish formasi
document.getElementById('code-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('code-input').value;

  const response = await mockBackendAPI('/api/verify-code', { code });

  // Backend javobiga qarab mos UI ko'rsatiladi
  if (response.nextStep === '2fa') {
    showStep('2fa');
  } else if (response.nextStep === 'success') {
    alert("Muvaffaqiyatli tizimga kirdingiz!");
  }
});

// 3. 2FA formasi
document.getElementById('fa-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('fa-input').value;

  const response = await mockBackendAPI('/api/verify-2fa', { password });

  if (response.nextStep === 'success') {
    alert("Muvaffaqiyatli tizimga kirdingiz!");
  }
});