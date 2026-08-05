import json
import tempfile
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5173"
OUTCOME_DIR = Path(__file__).resolve().parents[1] / "outcome-room"
OUTCOME_DIR.mkdir(exist_ok=True)
SCREENSHOT_DIR = Path(tempfile.gettempdir()) / "patchproof-browser-current"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


def assert_local_request(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme in {"data", "blob"}:
        return
    assert parsed.hostname in {"127.0.0.1", "localhost"}, f"external request: {url}"


def load_fixture(page, fixture_id: str, confirm: bool = False) -> None:
    page.get_by_test_id("fixture-select").select_option(fixture_id)
    if confirm:
        page.once("dialog", lambda dialog: dialog.accept())
    page.get_by_test_id("load-fixture").click()


def run() -> None:
    report = {
        "desktop": {},
        "mobile": {},
        "consoleErrors": [],
        "pageErrors": [],
        "externalRequests": [],
    }

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
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

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        load_fixture(page, "passing-evidence")
        page.wait_for_timeout(150)
        assert page.get_by_test_id("task-input").input_value().startswith("Add deterministic")
        assert page.get_by_test_id("claim-0").is_visible()
        assert page.get_by_test_id("claim-status-0").text_content() == "passed"
        assert page.get_by_test_id("claim-status-1").text_content() == "passed"

        page.get_by_test_id("generate-receipt").click()
        assert page.get_by_test_id("overall-status").text_content() == "passed"
        markdown = page.get_by_test_id("receipt-output").text_content()
        assert "Claim-to-evidence ledger" in markdown
        assert "does not prove semantic code correctness" in markdown

        page.get_by_role("button", name="JSON", exact=True).click()
        first_json = page.get_by_test_id("receipt-output").text_content()
        receipt = json.loads(first_json)
        assert receipt["kind"] == "patchproof.receipt"
        assert receipt["summary"]["passed"] == 2
        assert list(receipt["summary"].keys()) == ["passed", "failed", "skipped", "unknown", "unsupported"]

        with page.expect_download() as download_info:
            page.get_by_test_id("download-output").click()
        assert download_info.value.suggested_filename == "patchproof-receipt.json"

        task = page.get_by_test_id("task-input")
        task.fill("Add deterministic receipt export and preserve the local draft.")
        assert page.get_by_test_id("overall-status").text_content() == "out of date"
        assert page.get_by_test_id("copy-output").is_disabled()
        assert page.get_by_test_id("download-output").is_disabled()
        assert page.get_by_test_id("claim-status-0").text_content() == "passed"

        page.get_by_test_id("generate-receipt").click()
        page.get_by_role("button", name="JSON", exact=True).click()
        regenerated_json = page.get_by_test_id("receipt-output").text_content()
        page.wait_for_timeout(150)
        stored_before_import = page.evaluate("localStorage.getItem('patchproof:draft:v1')")

        page.reload()
        page.wait_for_load_state("networkidle")
        assert page.get_by_test_id("task-input").input_value().endswith("local draft.")
        assert page.locator("#save-state").text_content() == "Recovered locally"
        page.get_by_test_id("generate-receipt").click()
        page.get_by_role("button", name="JSON", exact=True).click()
        assert page.get_by_test_id("receipt-output").text_content() == regenerated_json

        task_before_import = page.get_by_test_id("task-input").input_value()
        page.get_by_test_id("open-import").click()
        assert page.locator("#import-dialog").evaluate("dialog => dialog.open"), {
            "consoleErrors": report["consoleErrors"],
            "pageErrors": report["pageErrors"],
        }
        page.get_by_test_id("import-json").fill('{"kind":"patchproof.draft","schemaVersion":1,"task":"truncated"')
        page.get_by_test_id("confirm-import").click()
        assert "Malformed JSON" in page.locator("#import-error").text_content()
        assert "current draft was not changed" in page.locator("#import-error").text_content()
        assert page.get_by_test_id("task-input").input_value() == task_before_import
        assert page.evaluate("localStorage.getItem('patchproof:draft:v1')") == stored_before_import
        page.locator("#cancel-import").click()

        load_fixture(page, "hidden-nonzero-exit", confirm=True)
        assert page.get_by_test_id("claim-status-0").text_content() == "failed"
        page.get_by_test_id("generate-receipt").click()
        assert page.get_by_test_id("overall-status").text_content() == "failed"

        page.screenshot(path=str(SCREENSHOT_DIR / "browser-desktop.png"), full_page=True)
        report["desktop"] = {
            "viewport": "1440x1000",
            "primaryFlow": "passed",
            "persistenceRecovery": "passed",
            "deterministicReload": "passed",
            "malformedImportAtomicity": "passed",
            "failureClassification": "passed",
            "download": "passed",
        }

        mobile = context.new_page()
        mobile.set_viewport_size({"width": 390, "height": 844})
        mobile.emulate_media(reduced_motion="reduce")
        mobile.goto(BASE_URL)
        mobile.wait_for_load_state("networkidle")
        mobile.evaluate("localStorage.clear()")
        mobile.reload()
        mobile.wait_for_load_state("networkidle")
        load_fixture(mobile, "passing-evidence")
        mobile.get_by_test_id("generate-receipt").click()
        assert mobile.get_by_test_id("overall-status").text_content() == "passed"
        overflow = mobile.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        assert overflow <= 1, f"mobile horizontal overflow: {overflow}px"
        assert mobile.get_by_test_id("download-output").is_visible()
        mobile.screenshot(path=str(SCREENSHOT_DIR / "browser-mobile.png"), full_page=True)
        report["mobile"] = {
            "viewport": "390x844",
            "primaryFlow": "passed",
            "horizontalOverflowPx": overflow,
            "downloadVisible": True,
        }

        for request_url in report["externalRequests"]:
            assert_local_request(request_url)
        assert not report["consoleErrors"], report["consoleErrors"]
        assert not report["pageErrors"], report["pageErrors"]
        browser.close()

    (OUTCOME_DIR / "browser-report.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )
    print("browser flow: PASS")


if __name__ == "__main__":
    run()
