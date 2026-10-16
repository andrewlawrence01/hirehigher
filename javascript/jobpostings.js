// DO NOT DELETE ANY OF THIS!!!!!!!!!
// MOLLI SAYS SO >:(
const resultsDiv = document.getElementById("results");
const searchForm = document.getElementById("searchForm");

const RED_FLAGS = [
  "telegram",
  "whatsapp",
  "gift card",
  "wire transfer",
  "pay for your own equipment",
  "registration fee",
  "no experience needed",
  "earn $",
  "per week",
  "work from home and earn",
  "@gmail.com",
  "@outlook.com",
  "@yahoo.com"
];

async function getJobs(keyword) {
  const response = await fetch(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(
      keyword
    )}&limit=10`
  );

  const data = await response.json();

  // Only show jobs where the keyword appears in the title
  const searchTerm = keyword.toLowerCase();

  return data.jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm)
  );
}

function checkJob(job) {
  const descriptionText = job.description.replace(/<[^>]*>/g, "");

  const text = (
    job.title +
    " " +
    descriptionText
  ).toLowerCase();

  const flags = RED_FLAGS.filter((flag) =>
    text.includes(flag)
  );

  if (descriptionText.length < 300) {
    flags.push("very short description");
  }

  return flags;
}

function showJobs(jobs) {
  resultsDiv.innerHTML = "";

  if (jobs.length === 0) {
    resultsDiv.innerHTML = "<p>No matching jobs found.</p>";
    return;
  }

  jobs.forEach((job) => {
    const flags = checkJob(job);
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${job.title}</h3>

      <p>
        ${job.company_name} -
        ${job.candidate_required_location}
      </p>

      ${
        flags.length > 0
          ? `
            <p style="color: red;">
              ⚠️ Possible red flags: ${flags.join(", ")}
            </p>
          `
          : ""
      }

      <a href="${job.url}" target="_blank">
        View posting
      </a>
    `;

    resultsDiv.appendChild(div);
  });
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const keyword = document.getElementById("search").value.trim();

  if (keyword === "") {
    resultsDiv.innerHTML = "<p>Please enter a job keyword.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading jobs...</p>";

  try {
    const jobs = await getJobs(keyword);
    showJobs(jobs);
  } catch (error) {
    console.error(error);

    resultsDiv.innerHTML =
      "<p>Something went wrong while searching for jobs.</p>";
  }
});