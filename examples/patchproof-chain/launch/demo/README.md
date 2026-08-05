# Launch demonstration

The launch site at `launch/site/index.html` demonstrates PatchProof with three built-in fixture cases:

- passing evidence;
- a hidden nonzero exit;
- a UI claim without visual evidence.

`launch/site/app.js` imports those fixture files and the product’s real `buildReceipt` function. The demonstration is therefore an interface over tested product logic, not a separately authored claim result.

Run `npm run dev`, open `/launch/site/`, and switch the fixture controls. No data leaves the local server.
