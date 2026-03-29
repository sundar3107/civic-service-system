import { buildComplaintNumber, severityFromVotes } from "../src/common/utils/complaint.util";

describe("complaint helpers", () => {
  it("builds a human-readable complaint number", () => {
    expect(buildComplaintNumber(7)).toContain("000007");
  });

  it("calculates severity from votes", () => {
    expect(severityFromVotes(1)).toBe("Low");
    expect(severityFromVotes(5)).toBe("Moderate");
    expect(severityFromVotes(15)).toBe("High");
    expect(severityFromVotes(30)).toBe("Critical");
  });
});
