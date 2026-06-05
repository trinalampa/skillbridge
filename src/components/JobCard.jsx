export default function JobCard({ job, onApply }) {
  const hasMatch = typeof job.matchScore === "number" && job.matchScore > 0;

  return (
    <div className="job-card">
      <div className="job-card-top">
        <div>
          <div className="job-title">{job.title}</div>
          <div className="job-company">{job.companyName}</div>
        </div>
        {hasMatch && (
          <span className="match-badge">
             {job.matchScore} match
          </span>
        )}
      </div>

      <div className="job-meta">
        {job.location && <span> {job.location}</span>}
        {job.jobType  && <span>· {job.jobType}</span>}
      </div>

      {job.description && (
        <p className="job-desc">{job.description}</p>
      )}

      {job.requiredSkills?.length > 0 && (
        <div className="skills-row">
          {job.requiredSkills.map(s => (
            <span className="skill-chip" key={s}>{s}</span>
          ))}
        </div>
      )}

      {onApply && (
        <div className="job-card-footer">
          <button
            className="btn btn-sm"
            style={{ width: "100%" }}
            onClick={() => onApply(job._id)}
          >
            Apply Now
          </button>
        </div>
      )}
    </div>
  );
}
