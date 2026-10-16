const resultsDiv = document.getElementById("results");

async function getJobs(keyword) {
  const res = await fetch(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=10`
  );
  const data = await res.json();
  return data.jobs;
}

function showJobs(jobs) {
  resultsDiv.innerHTML = "";
  jobs.forEach(job => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.company_name} - ${job.candidate_required_location}</p>
      <a href="${job.url}" target="_blank">View posting</a>
    `;
    resultsDiv.appendChild(div);
  });
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const keyword = document.getElementById("search").value;
  const jobs = await getJobs(keyword);
  showJobs(jobs);
});


// Flags fake job postings
const red_flags = [
  "telegram", "whatsapp", "gift card", "wire transfer",
  "pay for your own equipment", "registration fee",
  "no experience needed", "earn $", "per week", "work from home and earn",
  "@gmail.com", "@outlook.com", "@yahoo.com"
];

function checkJob(job) {
  const text = (job.title + " " + job.description).toLowerCase();
  const flags = RED_FLAGS.filter(flag => text.includes(flag));

  if (job.description.length < 300) flags.push("very short description");

  return flags;
}

jobs.forEach(job => {
  const flags = checkJob(job);
  const div = document.createElement("div");
  div.innerHTML = `
    <h3>${job.title}</h3>
    <p>${job.company_name} - ${job.candidate_required_location}</p>
    ${flags.length ? `<p style="color:red">⚠️ Possible red flags: ${flags.join(", ")}</p>` : ""}
    <a href="${job.url}" target="_blank">View posting</a>
  `;
  resultsDiv.appendChild(div);
});