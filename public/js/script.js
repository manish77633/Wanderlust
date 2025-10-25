
(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})();

// Password show/hide
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  this.textContent = type === 'password' ? 'Show' : 'Hide';
});


// ---------------filter toggle ===
const taxCheckbox = document.getElementById("taxCheckbox");
const listings = document.querySelectorAll(".listing");

taxCheckbox.addEventListener("change", () => {
  const isChecked = taxCheckbox.checked;

  listings.forEach(listing => {
    const gstText = listing.querySelector(".gst-text");
    if (gstText) {
      gstText.style.display = isChecked ? "inline" : "none";
    }
  });
});
