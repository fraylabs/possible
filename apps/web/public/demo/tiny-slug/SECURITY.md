# Security policy

## Supported versions

No public version has been released as part of this preparation. When releases exist, security fixes are intended for the current release line; support for older lines is not promised unless the project says otherwise in its release notes.

## Report a vulnerability

Do not include vulnerability details in a public issue, discussion, pull request, or example.

Use the repository host's private vulnerability-reporting feature when it is enabled. Include:

- the affected version or commit;
- the impact and conditions required to reproduce it;
- minimal reproduction steps or a proof of concept;
- any workaround or suggested fix you know of; and
- a safe way to contact you for follow-up.

If private vulnerability reporting is unavailable, open a public issue that asks the maintainers to establish private contact, but do not include sensitive details.

> [!IMPORTANT]
> A verified private reporting URL or maintainer security address is not yet configured. It must be added before a public release.

Maintainers should acknowledge a report privately, validate its scope, coordinate a fix and disclosure, and credit the reporter if requested. No response deadline or bug-bounty program is currently promised.

## Scope and safe testing

Reports about the package code, package contents, or release workflow are in scope. Do not test against systems or data you do not own or have permission to use.

Remember that `slugify` is a formatter, not a security control. Its output can be empty or collide for different inputs, and callers must still apply the validation and authorization required by their own use case.
