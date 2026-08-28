/* Nooroxotel Hostel — simple interaction layer: gallery drawer, WhatsApp booking, trailing cursor, and selectable focus veil. */

/* ============================================================
   CONFIGURATION — update these values whenever hostel details change.
   Every WhatsApp link, the Instagram link, and the map/directions
   link on the page are generated from these values, so this is the
   single place to edit.
   ============================================================ */
const CONFIG = {
  // Hostel WhatsApp number in international format, digits only (no "+", spaces, or leading 0).
  WHATSAPP_NUMBER: "923025517400",
  // Official Instagram profile URL.
  INSTAGRAM_URL: "https://www.instagram.com/nooroxotel?igsh=MTY3MGFqNnY2eTloZA==&igsi=MTY3MGFqNnY2eTloZA==",
  // Exact hostel coordinates (from the owner-provided Google Maps location).
  MAP_LAT: 33.711274,
  MAP_LNG: 73.035792,
  MAP_ZOOM: 16,
};
/* ============================================================ */

const body = document.body;
const drawer = document.querySelector("[data-gallery-drawer]");
const openButtons = document.querySelectorAll("[data-gallery-open]");
const closeButtons = document.querySelectorAll("[data-gallery-close]");
const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector(".site-nav");
const bookingForm = document.querySelector("[data-booking-form]");
const status = document.querySelector(".form-status");

/* Wire every WhatsApp chat / call / Instagram / map link on the page to CONFIG,
   so a single number or handle change here updates the whole site. */
function applyConfig() {
  document.querySelectorAll("[data-whatsapp-chat]").forEach(el => {
    el.setAttribute("href", `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`);
  });
  document.querySelectorAll("[data-whatsapp-call]").forEach(el => {
    el.setAttribute("href", `tel:+${CONFIG.WHATSAPP_NUMBER}`);
  });
  document.querySelectorAll("[data-instagram-link]").forEach(el => {
    el.setAttribute("href", CONFIG.INSTAGRAM_URL);
  });
  document.querySelectorAll("[data-directions-link]").forEach(el => {
    el.setAttribute("href", `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.MAP_LAT},${CONFIG.MAP_LNG}`);
  });
  document.querySelectorAll("[data-map-embed]").forEach(el => {
    el.setAttribute("src", `https://www.google.com/maps?q=${CONFIG.MAP_LAT},${CONFIG.MAP_LNG}&z=${CONFIG.MAP_ZOOM}&output=embed`);
  });
}
applyConfig();

function clearFocusVeil() {
  body.classList.remove("cursor-active", "is-focus-mode");
  document.querySelectorAll(".is-focus-target").forEach(element => element.classList.remove("is-focus-target"));
}

function openGallery() {
  clearFocusVeil();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  body.classList.add("no-scroll");
  drawer.querySelector(".drawer-close").focus();
}

function closeGallery() {
  clearFocusVeil();
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  body.classList.remove("no-scroll");
}

openButtons.forEach(button => button.addEventListener("click", openGallery));
closeButtons.forEach(button => button.addEventListener("click", closeGallery));

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && drawer.classList.contains("is-open")) closeGallery();
});

document.querySelectorAll(".site-nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("is-open", !isOpen);
});

/* Keep check-out no earlier than check-in. */
const checkinInput = bookingForm.querySelector('[data-field="checkin"]');
const checkoutInput = bookingForm.querySelector('[data-field="checkout"]');
checkinInput.addEventListener("change", () => {
  if (checkinInput.value) checkoutInput.setAttribute("min", checkinInput.value);
});

bookingForm.addEventListener("submit", event => {
  event.preventDefault();

  const field = name => bookingForm.querySelector(`[data-field="${name}"]`);
  const values = {
    name: field("name").value.trim(),
    phone: field("phone").value.trim(),
    room: field("room").value.trim(),
    guests: field("guests").value.trim(),
    checkin: field("checkin").value,
    checkout: field("checkout").value,
    message: field("message").value.trim(),
  };

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    status.textContent = "Please fill in all required fields before sending your request.";
    return;
  }

  const messageLines = [
    "🏨 New Hostel Booking Request",
    `Guest Name: ${values.name}`,
    `Phone: ${values.phone}`,
    `Room Type: ${values.room}`,
    `Guests: ${values.guests}`,
    `Check-in: ${values.checkin}`,
    `Check-out: ${values.checkout}`,
    `Special Request: ${values.message || "None"}`,
    "",
    "Please confirm room availability and booking.",
  ];

  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(messageLines.join("\n"))}`;
  window.open(whatsappUrl, "_blank", "noopener");

  status.textContent = "Your booking details are ready on WhatsApp — review the message and hit send.";
  bookingForm.reset();
});

const useCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (useCustomCursor) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const ringLabel = ring.querySelector("span");
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  body.classList.add("has-custom-cursor");

  const renderCursor = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  };

  document.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    body.classList.add("cursor-visible");
  });

  document.addEventListener("mouseleave", () => body.classList.remove("cursor-visible"));
  document.addEventListener("mouseenter", () => body.classList.add("cursor-visible"));

  document.querySelectorAll("a, button, input, select, textarea, [data-cursor-label]").forEach(element => {
    element.addEventListener("mouseenter", () => {
      body.classList.add("cursor-active");
      body.classList.add("is-focus-mode");
      element.classList.add("is-focus-target");
      ringLabel.textContent = element.dataset.cursorLabel || "OPEN";
    });
    element.addEventListener("mouseleave", () => {
      body.classList.remove("cursor-active");
      body.classList.remove("is-focus-mode");
      element.classList.remove("is-focus-target");
    });
  });

  renderCursor();
}
