import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
PREVIEW_ROOT = ROOT / "launch" / "direction" / "previews"
EXPECTED = [
    "PatchProof",
    "Local developer tool",
    "Open the local app",
    "Know what “done” is made of.",
    "PatchProof turns the task, diff, check log, artifacts, and limitations you already have into an inspectable completion receipt—without uploading them.",
    "Read the 5-minute quickstart",
    "34 unit assertions · 12 fixture contracts · desktop + mobile browser flow",
    "Supply evidence. Preserve the result.",
    "Task",
    "Add deterministic receipt export.",
    "Diff",
    "src/lib/receipt.js changed.",
    "Check",
    "npm test exited 0.",
    "Limitation",
    "No semantic code review was performed.",
    "Output",
    "Export claim",
    "passed",
    "UI review claim",
    "unknown",
    "Security claim",
    "unsupported",
    "A receipt describes supplied evidence. It does not prove code correctness, security, readiness, or demand.",
    "Inspect the evidence before accepting “done.”",
    "Open the real local product or follow the verified quickstart.",
]


def normalize(value: str) -> str:
    return " ".join(value.split()).casefold()


decision = json.loads((ROOT / "launch" / "direction" / "decision.json").read_text())
assert decision["candidateCount"] == 3
assert decision["comparisonViewport"] == {"width": 1440, "height": 900}
assert decision["selectionType"] == "agent-selected"
assert len(decision["candidates"]) == 3

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for candidate in decision["candidates"]:
        preview_path = ROOT / candidate["preview"]
        assert preview_path.is_file(), preview_path
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.emulate_media(reduced_motion="reduce")
        page.goto(preview_path.as_uri())
        page.wait_for_load_state("load")
        assert page.locator("main").get_attribute("data-viewport") == "1440x900"
        body = normalize(page.locator("body").inner_text())
        for copy in EXPECTED:
            assert normalize(copy) in body, (candidate["id"], copy)
        page.screenshot(path=str(preview_path.parent / "preview.png"), full_page=False)
        page.close()
    browser.close()

print("remix previews: PASS (3 candidates, identical truthful copy, 1440x900)")
