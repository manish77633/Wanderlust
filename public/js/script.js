
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
const taxToggle = document.getElementById("switchCheckDefault");
const gstTexts = document.getElementsByClassName("gst-text");

// Update GST visibility
function updateGSTDisplay() {
  const isChecked = taxToggle.checked;
  for (const info of gstTexts) {
    info.style.display = isChecked ? "inline" : "none";
  }
}

// On load
updateGSTDisplay();

// On toggle change
taxToggle.addEventListener("change", updateGSTDisplay);


// catagory scroll
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");
const filters = document.querySelector(".scrollable-filters");

// Arrow tap scroll
leftBtn.addEventListener("click", () => {
  filters.scrollBy({ left: -200, behavior: "smooth" });
});

rightBtn.addEventListener("click", () => {
  filters.scrollBy({ left: 200, behavior: "smooth" });
});

// Optional: touch swipe support (mobile)
let isDown = false;
let startX;
let scrollLeft;

filters.addEventListener("mousedown", (e) => {
  isDown = true;
  filters.classList.add("active");
  startX = e.pageX - filters.offsetLeft;
  scrollLeft = filters.scrollLeft;
});

filters.addEventListener("mouseleave", () => {
  isDown = false;
  filters.classList.remove("active");
});

filters.addEventListener("mouseup", () => {
  isDown = false;
  filters.classList.remove("active");
});

filters.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - filters.offsetLeft;
  const walk = (x - startX) * 2; // scroll-fast
  filters.scrollLeft = scrollLeft - walk;
});

// Mobile touch
filters.addEventListener("touchstart", (e) => {
  startX = e.touches[0].pageX - filters.offsetLeft;
  scrollLeft = filters.scrollLeft;
});

filters.addEventListener("touchmove", (e) => {
  const x = e.touches[0].pageX - filters.offsetLeft;
  const walk = (x - startX) * 2;
  filters.scrollLeft = scrollLeft - walk;
});
