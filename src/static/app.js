document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper to show messages without clobbering base classes
  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.classList.remove("hidden", "success", "error", "info");
    messageDiv.classList.add("message", type);
    setTimeout(() => messageDiv.classList.add("hidden"), 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) {
        throw new Error(`Failed to load activities (${response.status})`);
      }
      const activities = await response.json();

      // Clear loading message and current options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list (safe DOM operations) and dropdown
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const title = document.createElement("h4");
        title.textContent = name;

        const desc = document.createElement("p");
        desc.textContent = details.description;

        const schedule = document.createElement("p");
        const strongSchedule = document.createElement("strong");
        strongSchedule.textContent = "Schedule: ";
        schedule.appendChild(strongSchedule);
        schedule.append(document.createTextNode(details.schedule));

        const spotsLeft = details.max_participants - details.participants.length;
        const availability = document.createElement("p");
        const strongAvail = document.createElement("strong");
        strongAvail.textContent = "Availability: ";
        availability.appendChild(strongAvail);
        availability.append(document.createTextNode(`${spotsLeft} spots left`));

        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);

        // NEW: participants section
        const participantsWrap = document.createElement("div");
        participantsWrap.className = "participants";
        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants";
        participantsWrap.appendChild(participantsTitle);
        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        if (details.participants.length) {
          details.participants.forEach(email => {
            const li = document.createElement("li");
            li.textContent = email;
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
            li.textContent = "No participants yet.";
            li.className = "empty";
            participantsList.appendChild(li);
        }
        participantsWrap.appendChild(participantsList);
        activityCard.appendChild(participantsWrap);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (spotsLeft <= 0) {
          option.disabled = true; // prevent choosing full activities
        }
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const submitBtn = signupForm.querySelector("button[type='submit']");

    if (!activity) {
      showMessage("info", "Please select an activity.");
      return;
    }

    submitBtn.disabled = true;
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showMessage("success", result.message || "Signed up successfully.");
        signupForm.reset();
        await fetchActivities(); // refresh availability
      } else {
        showMessage("error", result.detail || "An error occurred.");
      }
    } catch (error) {
      showMessage("error", "Failed to sign up. Please try again.");
      console.error("Error signing up:", error);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();
});
