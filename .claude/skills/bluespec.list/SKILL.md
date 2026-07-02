---
name: bluespec.list
description: List the findings Blue Spec is tracking, by name. It reads `.bluespec/tracking.json` through a hook and prints each tracked finding's name. It has no dependency on any phase and changes nothing, it only reads and reports. If nothing is tracked yet, it says so.
argument-hint: Takes no input, it lists every tracked finding by name
user-invocable: true
---

## User Input

```text
$ARGUMENTS
```

This command takes no input.

## Outline

List the tracked findings.

1. **Run the hook** from the project root:
   ```bash
   node ./.bluespec/hooks/list.mjs
   ```
2. **Report** exactly what the hook printed, in plain language. If the hook reports nothing is tracked yet, say so and stop.
