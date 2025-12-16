document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper: prettify email into display name
  function prettifyEmail(email) {
    const name = email.split('@')[0].replace(/\./g, ' ');
    return name.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Helper: get initials for avatar from email
  function prettifyEmailInitials(email) {
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement('div');
        participantsSection.className = 'participants-section';

        const participantsHeader = document.createElement('h5');
        participantsHeader.innerHTML = `Participants <span class="participants-count">(${details.participants.length})</span>`;
        participantsSection.appendChild(participantsHeader);

        if (!details.participants || details.participants.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'participants-empty';
          empty.textContent = 'No participants yet. Be the first!';
          participantsSection.appendChild(empty);
        } else {
          const list = document.createElement('ul');
          list.className = 'participants-list';

          details.participants.forEach((email, idx) => {
            const li = document.createElement('li');
            // Hide extras when more than 3 to keep the card compact
            if (details.participants.length > 3 && idx >= 3) {
              li.classList.add('hidden');
              list.classList.add('collapsed');
            }

            const avatar = document.createElement('span');
            avatar.className = 'participant-avatar';
            avatar.textContent = prettifyEmailInitials(email);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'participant-name';
            nameSpan.textContent = prettifyEmail(email);

            li.appendChild(avatar);
            li.appendChild(nameSpan);
            list.appendChild(li);
          });

          participantsSection.appendChild(list);

          if (details.participants.length > 3) {
            const toggle = document.createElement('button');
            toggle.className = 'participants-toggle';
            toggle.textContent = 'Show all';
            toggle.addEventListener('click', () => {
              const hiddenItems = list.querySelectorAll('li.hidden');
              if (hiddenItems.length) {
                hiddenItems.forEach((item) => item.classList.remove('hidden'));
                list.classList.remove('collapsed');
                toggle.textContent = 'Show less';
              } else {
                const lis = list.querySelectorAll('li');
                lis.forEach((li, i) => {
                  if (i >= 3) li.classList.add('hidden');
                });
                list.classList.add('collapsed');
                toggle.textContent = 'Show all';
              }
            });
            participantsSection.appendChild(toggle);
          }
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
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

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
