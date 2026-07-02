---
name: bluespec.charter
description: Establish or update the project's security charter, the safe-by-default principles every later Blue Spec phase must respect. Proposes a charter when run with no input, or follows the input when given.
argument-hint: Optionally describe your project, or leave empty to let Blue Spec propose
user-invocable: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input above before proceeding, if it is not empty.

## Outline

You are creating or updating the project's **security charter** at `.bluespec/memory/charter.md`. The charter is the set of safe-by-default security principles that every later phase (detect, plan, harden, verify) must respect. This file is a TEMPLATE containing placeholder tokens in square brackets (for example `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to collect or derive concrete values, fill the template precisely, and write it back.

This phase works the same way whether the project is brand new or already exists. You are establishing the rules, not yet detecting what the system does (that is the detect phase). Infer what you can from whatever code is present, even if there is very little.

Follow this execution flow:

1. Load the charter at `.bluespec/memory/charter.md`. If it does not exist, initialize it from the template at `.bluespec/templates/charter-template.md` first, then continue. Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.

2. Decide the authoring mode from the user input:
   - **Input given** (the User Input above is not empty): treat it as the user's direction. The user describes the project in plain words and may not know the technical terms. Your job here is to turn that description into the project's security context, not to analyze code. Read between the lines and work out what the description implies, including the parts the user did not name. A tool that remembers things between runs implies stored data. Users who see only their own data imply login or access control. Anything that takes input from outside implies untrusted input to validate, and anything that handles money or personal details implies sensitive data. Derive the principles from those implications. Do not limit the charter to only what was said literally.
   - **No input** (the User Input above is empty): **propose** a safe-by-default security charter yourself. Work out the project's purpose from what is at hand (its manifests, structure, dependencies, and any other context you can read) and aim for the same specific, purpose-aware result the user would get by describing it. If the signal points to something specific, the charter should reflect that rather than fall back to a generic checklist: a payment library or an auth setup in a web service, a public API surface in a library, the arguments and shell calls in a CLI, the local storage in a desktop app. When the signal is weak or ambiguous and you cannot tell what the project is, ask the user what it does rather than guessing. Then present the proposed principles in plain language with the risk behind each one, and ask the user to review and adjust before you write the file. Do not require the user to know what to ask for. The intelligence lives in the charter, not in the user.

3. Fill the template:
   - Replace every placeholder with concrete text. Leave no bracket tokens behind.
   - Each principle MUST carry three things: a clear name, a non-negotiable rule, and a plain-language `Why:` line that states the risk it prevents. Explain the risk, not just the fix, so the charter is intelligible to any user, developer or not.
   - The template ships with three starter principles. This is a starting point, not a limit. Add or remove principles so the charter fits the project. Keep the name, rule, and `Why:` shape for every one.
   - Write principles as plain, declarative rules a reader can check against the code. Prefer concrete wording over vague advice.

4. Set governance and version:
   - Fill the Governance section with how the charter is upheld and amended, in plain language.
   - For a brand new charter, set `Version` to `1.0.0`. For an update, increment it: MAJOR for removing or redefining a principle, MINOR for adding a principle or materially expanding one, PATCH for wording and clarity fixes.
   - Set `Ratified` to today's date in ISO format `YYYY-MM-DD`. Keep the original ratification date on later updates.

5. Validate before writing:
   - No bracket tokens remain.
   - Every principle has a name, a rule, and a `Why:` line.
   - The date is ISO `YYYY-MM-DD` and the version line is present.
   - Principles are declarative, specific, and free of vague language.

6. Write the completed charter back to `.bluespec/memory/charter.md`.

7. Output a short summary to the user:
   - The principles that are now in the charter, each with its one-line risk.
   - The version and, for an update, why the version changed.
   - A suggested commit message, for example `docs: establish security charter v1.0.0`.
   - **Next step:** point the user to `/bluespec.detect`, the phase that detects what the system actually does (login, uploads, payments, and so on) so the later phases work from real context. Frame it as the recommended next step, and note they can rerun `/bluespec.charter` any time the principles need to change.

Keep the charter in plain language throughout. A non-developer should be able to read it and understand both the rule and the risk it prevents.
