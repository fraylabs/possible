import json
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5173"
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_DIR = ROOT / "launch" / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)


def run() -> None:
    report = {"desktop": {}, "mobile": {}, "consoleErrors": [], "pageErrors": [], "externalRequests": []}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        page.emulate_media(reduced_motion="reduce")
        page.on("console", lambda message: report["consoleErrors"].append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: report["pageErrors"].append(str(error)))
        page.on(
            "request",
            lambda request: report["externalRequests"].append(request.url)
            if urlparse(request.url).hostname not in {"127.0.0.1", "localhost", None}
            else None,
        )

        page.goto(f"{BASE_URL}/launch/site/")
        page.wait_for_load_state("networkidle")
        assert page.get_by_role("heading", name='Know what “done” is made of.').is_visible()
        assert page.locator('meta[name="robots"]').get_attribute("content") == "noindex,nofollow"
        assert page.locator("#count-passed").text_content() == "2"
        assert page.locator("#demo-claims [data-status='passed']").count() == 2

        page.get_by_role("button", name="Hidden nonzero exit").click()
        assert page.locator("#count-failed").text_content() == "1"
        assert page.locator("#demo-claims [data-status='failed']").count() == 1
        assert "exit 1" in page.locator("#demo-check").text_content()

        page.get_by_role("button", name="UI without visual proof").click()
        assert page.locator("#count-unsupported").text_content() == "1"
        assert page.locator("#demo-claims [data-status='unsupported']").count() == 1
        assert "No screenshot" in page.locator("#demo-limitation").text_content()

        local_app_href = page.get_by_role("link", name="Open the local app").first.get_attribute("href")
        assert local_app_href == "../../"
        product = context.new_page()
        product.goto(f"{BASE_URL}/")
        product.wait_for_load_state("networkidle")
        assert product.get_by_role("heading", name="Turn the claim into a receipt.").is_visible()
        product.close()

        page.screenshot(path=str(EVIDENCE_DIR / "site-desktop.png"), full_page=True)
        report["desktop"] = {
            "viewport": "1440x1000",
            "firstViewport": "passed",
            "actualLogicFixtureSwitching": "passed",
            "threeOutcomeStates": ["passed", "failed", "unsupported"],
            "localProductLink": "passed",
            "metadata": "passed",
        }

        mobile = context.new_page()
        mobile.set_viewport_size({"width": 390, "height": 844})
        mobile.emulate_media(reduced_motion="reduce")
        mobile.goto(f"{BASE_URL}/launch/site/")
        mobile.wait_for_load_state("networkidle")
        assert mobile.get_by_role("heading", name='Know what “done” is made of.').is_visible()
        mobile.get_by_role("button", name="Hidden nonzero exit").click()
        assert mobile.locator("#count-failed").text_content() == "1"
        overflow = mobile.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        assert overflow <= 1, f"mobile horizontal overflow: {overflow}px"
        mobile.screenshot(path=str(EVIDENCE_DIR / "site-mobile.png"), full_page=True)
        report["mobile"] = {"viewport": "390x844", "fixtureSwitching": "passed", "horizontalOverflowPx": overflow}

        assert not report["externalRequests"], report["externalRequests"]
        assert not report["consoleErrors"], report["consoleErrors"]
        assert not report["pageErrors"], report["pageErrors"]
        browser.close()

    (EVIDENCE_DIR / "browser-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("launch browser flow: PASS")


if __name__ == "__main__":
    run()
