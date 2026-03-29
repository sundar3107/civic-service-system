export function buildComplaintNumber(sequenceSeed: number) {
  const suffix = String(sequenceSeed).padStart(6, "0");
  return `CIV-${new Date().getFullYear()}-${suffix}`;
}

export function severityFromVotes(voteCount: number) {
  if (voteCount >= 25) {
    return "Critical";
  }

  if (voteCount >= 10) {
    return "High";
  }

  if (voteCount >= 3) {
    return "Moderate";
  }

  return "Low";
}

