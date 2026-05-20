/**
 * form.js — Contact form submission via Web3Forms
 */

function initForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status    = document.getElementById('form-status');
  var submitBtn = form.querySelector('button[type="submit"] span');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var originalText      = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    status.style.display  = 'none';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body:   new FormData(form),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.success) throw new Error(data.message || 'Something went wrong.');
      status.textContent   = "Message sent successfully. We'll be in touch!";
      status.style.color   = 'var(--indicator)';
      status.style.display = 'block';
      form.reset();
      submitBtn.textContent = originalText;
    })
    .catch(function() {
      status.textContent    = 'Failed to send. Please email contact@marvio.co.uk directly.';
      status.style.color    = 'var(--accent)';
      status.style.display  = 'block';
      submitBtn.textContent = originalText;
    });
  });
}
