from pathlib import Path
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent
FRAMES = ROOT / "frames"
FRAMES.mkdir(exist_ok=True)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
        page.goto((ROOT / "scene.html").as_uri())
        page.wait_for_function("() => typeof window.__renderAt === 'function'")
        for frame in range(30 * 30):
            page.evaluate("(ms) => window.__renderAt(ms)", frame / 30 * 1000)
            page.screenshot(path=str(FRAMES / f"frame-{frame:05d}.png"), animations="disabled")
        browser.close()


if __name__ == "__main__":
    main()
