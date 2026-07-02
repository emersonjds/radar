---
name: bluespec.skills
description: Load an on-demand security sub-skill and apply it to your code. Sub-skills are focused, language-agnostic knowledge modules that are not loaded by default and are never invoked directly. This command is the single door to them, name a sub-skill to run it, or run it with no input to see what is available. It reads and reports, the calling phase decides what to record.
argument-hint: Name a sub-skill to load (for example `redos`), or leave empty to list them
user-invocable: true
---

## User Input

```text
$ARGUMENTS
```

The User Input above decides how this command runs. Read it before proceeding.

## Outline

You dispatch to a sub-skill, then follow it.

1. **Resolve the input.**
   - **With no input:** list the catalog and stop. The catalog is not written here, get it by running the hook from the project root, which prints each sub-skill's name and the tags that say what it covers:
     ```bash
     node ./.bluespec/hooks/skills.mjs
     ```
   - **Otherwise:** load `.bluespec/skills/<name>.md`, matching a given name directly, or a described context against the tags the hook lists. If nothing fits, say so and stop, never guess.
2. **Follow the sub-skill.** Read the loaded file and do what it says, scoped to any paths the input named. The knowledge lives there, do not improvise beyond it and do not edit the user's code.
3. **Summarize** in plain language: what ran, what it found and the risk each item carries, or that nothing of concern turned up. Report only on the sub-skill you loaded, never on the rest of the catalog you did not. This command reads and reports, the calling phase owns what gets recorded.
