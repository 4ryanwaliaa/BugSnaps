# PhishLens team inbox

The team page uses Firebase Authentication and the existing Realtime Database. The
`database-rules.fragment.json` file contains **only** the new `phishlensTeams`
branch. It is not a complete database rules file. Before deploying it, retrieve
and back up the current live rules, merge this branch into them, review the full
result and deploy the merged rules without changing MyPentest permissions. Do
not replace the existing rules with the fragment.

Team access is granted by user ID: a creator owns a team; administrators add or
remove members and make decisions. All members can read team reports and
submit new ones. Only administrators can set a decision or delete a report.
Submitted evidence is immutable. The owner cannot be removed or demoted.
Messages, full URLs, senders and action notes are stored in the database and
visible to all members of their team. This prototype has no automatic deletion
policy; administrators can remove individual reports. Review the privacy notice
and retention requirements before use with real messages.

## Authorization test

With Java and the Firebase Database emulator installed, start a dedicated local
emulator from a separate terminal, then run the test from the repository root:

```powershell
java -jar "$env:USERPROFILE\.cache\firebase\emulators\firebase-database-emulator-v4.11.2.jar" --host 127.0.0.1 --port 19000 --single_project_mode Error
node scripts/check-phishlens-team.cjs
```

The test loads the fragment into its isolated `demo-phishlens-default-rtdb`
emulator namespace and clears that namespace; it never connects to production.
Expected authorization denials appear as Firebase warnings. A passing run ends
with `PhishLens database authorization checks passed.` Stop the emulator after
the test. These checks do not establish that the production rules are deployed
or that production accounts can sign in.
