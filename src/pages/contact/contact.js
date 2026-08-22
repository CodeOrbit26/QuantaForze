import '../../scripts/core/main.js';

window.openVercelContactModal = function() {
  const modal = document.getElementById('vercelContactModal');
  if (modal) modal.classList.add('active');
};

window.closeVercelContactModal = function() {
  const modal = document.getElementById('vercelContactModal');
  if (modal) modal.classList.remove('active');
};

window.handleContactSalesSubmit = function(event) {
  if (event && event.preventDefault) event.preventDefault();

  const form = event.target;
  const inputs = form.querySelectorAll('input');
  const textarea = form.querySelector('textarea');

  const name = inputs[0] ? inputs[0].value.trim() : '';
  const email = inputs[1] ? inputs[1].value.trim() : '';
  const company = inputs[2] ? inputs[2].value.trim() : '';
  const message = textarea ? textarea.value.trim() : '';

  if (!email || !name) return;

  // Send inquiry to support@quantaforze.com via FormSubmit AJAX endpoint
  fetch('https://formsubmit.co/ajax/support@quantaforze.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      company: company || 'N/A',
      message: message,
      _subject: `Sales & Architecture Inquiry from ${name} (${company || 'Individual'})`
    })
  }).catch(err => console.log('Contact submit error:', err));

  window.closeVercelContactModal();
  if (form) form.reset();

  // Open Pop-Up Modal on screen
  if (window.openJoinModal) {
    window.openJoinModal(email);
  } else {
    alert('Thank you! Your inquiry has been sent to QuantaForze sales & engineering.');
  }
};
