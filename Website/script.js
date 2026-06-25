const menuBtn = document.querySelector(".menu-btn");
const navRight = document.querySelector(".nav-right");

if (menuBtn && navRight) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    navRight.classList.toggle("active");
  });

  const navLinks = document.querySelectorAll(".nav-right a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuBtn.classList.remove("active");
      navRight.classList.remove("active");
    });
  });
}

const feedbackForm = document.getElementById("feedbackForm");
const successOverlay = document.getElementById("successOverlay");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(feedbackForm);

    await fetch(feedbackForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    successOverlay.classList.add("active");

    setTimeout(() => {
      window.location.href = "/Thank/";
    }, 1800);
  });
}

const visitorCount = document.getElementById("visitor-count");

if (visitorCount) {
  fetch("https://api.counterapi.dev/v1/jaiwateam/portfolio/up")
    .then((res) => res.json())
    .then((data) => {
      visitorCount.textContent = data.count;
    })
    .catch(() => {
      visitorCount.textContent = "Unavailable";
    });
}

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach((item) => {
    const top = item.getBoundingClientRect().top;

    if (top < window.innerHeight - 100) {
      item.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();