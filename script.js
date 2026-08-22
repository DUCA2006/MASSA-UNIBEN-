document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. FULL-SCREEN OVERLAY MENU LOGIC
  // ==========================================
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-menu-btn");
  const navOverlayMenu = document.getElementById("nav-overlay-menu");
  const menuLinks = document.querySelectorAll(".menu-link, .menu-btn-contact");

  const openMenu = () => {
    if (navOverlayMenu) {
      navOverlayMenu.classList.add("active");
      document.body.style.overflow = "hidden"; // Block body scrolling while open
    }
  };

  const closeMenu = () => {
    if (navOverlayMenu) {
      navOverlayMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  };

  if (menuBtn) menuBtn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  // Close menu when tapping any link inside
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // ==========================================
  // 2. GPA CALCULATOR LOGIC
  // ==========================================
  const courseList = document.getElementById("course-list");
  const addBtn = document.getElementById("add-course-btn");
  const calcBtn = document.getElementById("calculate-gpa-btn");
  const resultBox = document.getElementById("result-box");
  const gpaDisplay = document.getElementById("gpa-display");
  const gpaClass = document.getElementById("gpa-class");

  if (addBtn && courseList) {
    addBtn.addEventListener("click", () => {
      const newRow = document.createElement("div");
      newRow.classList.add("course-row");
      newRow.innerHTML = `
        <input type="text" placeholder="Course Code" class="course-code" />
        <select class="course-unit">
          <option value="" disabled selected>Units</option>
          <option value="1">1 Unit</option>
          <option value="2">2 Units</option>
          <option value="3">3 Units</option>
          <option value="4">4 Units</option>
          <option value="6">6 Units</option>
        </select>
        <select class="course-grade">
          <option value="" disabled selected>Grade</option>
          <option value="5">A (70-100%)</option>
          <option value="4">B (60-69%)</option>
          <option value="3">C (50-59%)</option>
          <option value="2">D (45-49%)</option>
          <option value="1">E (40-44%)</option>
          <option value="0">F (0-39%)</option>
        </select>
      `;
      courseList.appendChild(newRow);
    });
  }

  if (calcBtn) {
    calcBtn.addEventListener("click", () => {
      const rows = document.querySelectorAll(".course-row");
      let totalQualityPoints = 0;
      let totalUnits = 0;

      rows.forEach((row) => {
        const unitSelect = row.querySelector(".course-unit");
        const gradeSelect = row.querySelector(".course-grade");

        const unitVal = parseFloat(unitSelect ? unitSelect.value : 0);
        const gradeVal = parseFloat(gradeSelect ? gradeSelect.value : 0);

        if (
          !isNaN(unitVal) &&
          !isNaN(gradeVal) &&
          unitSelect.value !== "" &&
          gradeSelect.value !== ""
        ) {
          totalQualityPoints += unitVal * gradeVal;
          totalUnits += unitVal;
        }
      });

      if (totalUnits > 0) {
        const gpa = (totalQualityPoints / totalUnits).toFixed(2);
        if (gpaDisplay) gpaDisplay.innerText = gpa;

        if (gpaClass) {
          if (gpa >= 4.5) {
            gpaClass.innerText = "First Class Honors 🎉";
          } else if (gpa >= 3.5) {
            gpaClass.innerText = "Second Class Upper (2:1) 👏";
          } else if (gpa >= 2.4) {
            gpaClass.innerText = "Second Class Lower (2:2) 👍";
          } else if (gpa >= 1.5) {
            gpaClass.innerText = "Third Class ⚠️";
          } else if (gpa >= 1.0) {
            gpaClass.innerText = "Pass ⚠️";
          } else {
            gpaClass.innerText = "Fail ❌";
          }
        }

        if (resultBox) {
          resultBox.style.display = "block";
          resultBox.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        alert("Please select the Units (e.g. 2 Units, 3 Units) for your courses!");
      }
    });
  }

  // ==========================================
  // 3. PDF UPLOAD & SEARCH LOGIC
  // ==========================================
  const uploadForm = document.getElementById("pdf-upload-form");
  const materialsList = document.getElementById("materials-list");
  const searchInput = document.getElementById("search-materials");

  if (uploadForm && materialsList) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const titleInput = document.getElementById("doc-title");
      const courseInput = document.getElementById("course-code-input");
      const typeInput = document.getElementById("doc-type");
      const fileInput = document.getElementById("pdf-file-input");

      const title = titleInput ? titleInput.value : "Untitled Document";
      const course = courseInput ? courseInput.value.toUpperCase() : "GENERAL";
      const type = typeInput ? typeInput.value : "PDF";
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;

      if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          const fileDataUrl = event.target.result;

          const card = document.createElement("div");
          card.classList.add("material-card");
          card.setAttribute("data-course", course);

          card.innerHTML = `
            <div class="doc-icon"><i class="fas fa-file-pdf"></i></div>
            <div class="doc-info">
              <span class="doc-badge">${type}</span>
              <h4>${title}</h4>
              <p>Course Code: <strong>${course}</strong></p>
            </div>
            <a href="${fileDataUrl}" class="btn-download" download="${file.name}">
              <i class="fas fa-download"></i> View PDF
            </a>
          `;

          materialsList.prepend(card);
          uploadForm.reset();
          alert("PDF uploaded successfully!");
        };

        reader.readAsDataURL(file);
      }
    });
  }

  if (searchInput && materialsList) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const cards = materialsList.querySelectorAll(".material-card");

      cards.forEach((card) => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? "flex" : "none";
      });
    });
  }

  // ==========================================
  // 4. DYNAMIC LOVABLE BACKEND FETCH
  // ==========================================
  const newsContainer = document.querySelector("#news");

  if (newsContainer) {
    fetch("https://faculty-fire-starter.lovable.app/api/public/posts?limit=10")
      .then((response) => response.json())
      .then((data) => {
        // Handles direct array response or object wrapped { posts: [...] }
        const posts = Array.isArray(data) ? data : data.posts;

        if (!posts || posts.length === 0) {
          newsContainer.innerHTML = "<p>No updates published yet.</p>";
          return;
        }

        newsContainer.innerHTML = posts
          .map(
            (p) => `
            <article class="post-card">
              <h3>${p.title}</h3>
              <p>${p.summary || p.content || ""}</p>
            </article>
          `
          )
          .join("");
      })
      .catch((error) => {
        console.error("Error fetching Lovable posts:", error);
        newsContainer.innerHTML = "<p>Unable to load posts at this time.</p>";
      });
  }
});
