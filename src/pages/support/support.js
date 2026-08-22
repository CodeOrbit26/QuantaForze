import '../../scripts/core/main.js';

window.handleSupportTicketSubmit = function(event) {
  if (event && event.preventDefault) event.preventDefault();

  const form = event.target;
  const nameInput = form.querySelector('#ticketName');
  const emailInput = form.querySelector('#ticketEmail');
  const productSelect = form.querySelector('#ticketProduct');
  const prioritySelect = form.querySelector('#ticketPriority');
  const subjectInput = form.querySelector('#ticketSubject');
  const messageInput = form.querySelector('#ticketMessage');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const product = productSelect ? productSelect.value : 'General';
  const priority = prioritySelect ? prioritySelect.value : 'Normal';
  const subject = subjectInput ? subjectInput.value.trim() : '';
  const message = messageInput ? messageInput.value.trim() : '';

  if (!email || !name) return;

  // Send support ticket to support@quantaforze.com via FormSubmit AJAX endpoint
  fetch('https://formsubmit.co/ajax/support@quantaforze.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      product: product,
      priority: priority,
      subject: subject,
      message: message,
      _subject: `[Support Ticket - ${priority}] ${subject || product}`
    })
  }).catch(err => console.log('Support ticket submit error:', err));

  if (form) form.reset();

  // Show pop-up modal on screen
  if (window.openJoinModal) {
    window.openJoinModal(email);
  } else {
    alert('Thank you! Your support ticket has been submitted to QuantaForze engineering.');
  }
};

window.toggleFaq = function(button) {
  const item = button.closest('.q-faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('active');

  document.querySelectorAll('.q-faq-item').forEach(el => el.classList.remove('active'));

  if (!isOpen) {
    item.classList.add('active');
  }
};

window.filterFaqs = function(query) {
  const q = query.toLowerCase().trim();
  const items = document.querySelectorAll('.q-faq-item');
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    if (!q || text.includes(q)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
};
