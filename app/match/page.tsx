import { redirect } from "next/navigation";

// The Match landing page's marketing content was merged into /match/result
// (shown after the input form + loading), so entering /match now goes
// straight to the form instead of a separate pre-sell page.
export default function MatchPage() {
  redirect("/match/upload");
}
