"use client";

import { useEffect } from "react";

const starterRatings: Record<string, { rating: string; reviews: string }> = {
  "Local Table": { rating: "4.7", reviews: "1,221" },
};

function addInlineRating(cardBody: HTMLElement, title: HTMLElement) {
  if (cardBody.querySelector("[data-jrt-inline-rating='1']")) return;

  const businessName = title.textContent?.trim() ?? "";
  const starter = starterRatings[businessName];
  const metaSpans = Array.from(cardBody.querySelectorAll<HTMLElement>(".meta span"));
  const existingRating = metaSpans.find((span) => /\d(?:\.\d)?\s*★\s*·\s*[\d,]+\s*(?:resident\s+)?ratings?/i.test(span.textContent ?? ""));

  let rating = starter?.rating;
  let reviews = starter?.reviews;

  if (!rating || !reviews) {
    const match = existingRating?.textContent?.match(/(\d(?:\.\d)?)\s*★\s*·\s*([\d,]+)/i);
    if (match) {
      rating = match[1];
      reviews = match[2];
    }
  }

  if (!rating || !reviews || Number(reviews.replaceAll(",", "")) <= 0) return;

  const row = document.createElement("div");
  row.dataset.jrtInlineRating = "1";
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "6px";
  row.style.marginTop = "4px";
  row.style.marginBottom = "5px";
  row.style.fontSize = "13px";
  row.style.lineHeight = "1.25";
  row.style.flexWrap = "wrap";
  row.style.color = "inherit";

  const fullStars = Math.max(0, Math.min(5, Math.round(Number(rating))));
  const stars = `${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)}`;
  row.innerHTML = `<span>${rating}</span><span style="color:#f4b400;letter-spacing:1px">${stars}</span><span style="opacity:.55">·</span><span>${Number(reviews.replaceAll(",", "")).toLocaleString()} Reviews</span>`;
  title.insertAdjacentElement("afterend", row);

  if (existingRating) {
    const meta = existingRating.parentElement;
    existingRating.remove();
    if (meta && meta.children.length === 0) meta.remove();
  }
}

function enhanceBusinessDirectory() {
  document.querySelectorAll<HTMLElement>(".card-body").forEach((cardBody) => {
    const title = cardBody.querySelector<HTMLElement>(":scope > .card-title");
    if (!title) return;

    const sponsorButton = Array.from(cardBody.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent?.trim() === "Own this business? Claim it or Sponsor it"
    );
    if (sponsorButton) {
      sponsorButton.textContent = "Own this business? Sponsor it";
      sponsorButton.style.fontSize = "12px";
      sponsorButton.style.whiteSpace = "nowrap";
      sponsorButton.style.paddingLeft = "12px";
      sponsorButton.style.paddingRight = "12px";
    }

    const copy = cardBody.querySelector<HTMLElement>(":scope > .card-copy");
    if (copy?.textContent?.includes("starter directory listing")) {
      copy.textContent = copy.textContent
        .replace(/\s*·\s*starter directory listing/gi, "")
        .replace(/starter directory listing/gi, "")
        .trim();
    }

    const basicMeta = Array.from(cardBody.querySelectorAll<HTMLElement>(".meta")).find((meta) =>
      meta.textContent?.includes("Basic directory listing")
    );
    basicMeta?.remove();

    addInlineRating(cardBody, title);
  });
}

export default function BusinessDirectoryEnhancer() {
  useEffect(() => {
    enhanceBusinessDirectory();
    const observer = new MutationObserver(() => enhanceBusinessDirectory());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
