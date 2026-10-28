EndpointRadar Windows reporting helper

This helper runs a locally installed EndpointRadar scanner and reports selected
posture evidence over HTTPS. It does not install the scanner. It does not use
WinRM or scan other machines. Install only on devices you are authorized to
assess. The uploaded posture data includes host identifiers, security settings,
findings and recommended actions. It excludes the full software inventory.

1. Install Python 3.10 or newer and Git. In a non-elevated PowerShell window,
   install the scanner revision that emits explicit retest evidence:

   python -m pip install "git+https://github.com/4ryanwalia/EndpointRadar.git@1cf2f97"

   Use the same Windows account that will run the task. Find its installed CLI
   path with `(Get-Command endpointradar.exe).Source`. If that command is not
   found, add the Python Scripts directory to PATH or locate the executable there.
2. From the managed workspace, create a device and copy its workspace ID,
   device ID and one-time device secret. Store the secret securely.
3. Download install-agent.ps1 and run-agent.ps1 into the same directory.
4. Open Windows PowerShell 5.1 in a normal, non-elevated window as that account
   and run:

   .\install-agent.ps1 -WorkspaceId YOUR_WORKSPACE_ID -DeviceId YOUR_DEVICE_ID -ScannerPath 'C:\path\to\endpointradar.exe'

5. Paste the device secret into the hidden prompt. Do not put it on the command
   line. The installer verifies the credentials before creating the task.

The task checks the server every 15 minutes and follows its device schedule.
Intervals are measured from the successful scan's start, with a five-second
tolerance for task scheduling jitter. A later retry retains that scan's start.
It runs only while that account is signed in, at that account's normal limited
privilege. Some checks may report limited visibility. Missed or failed runs must
not be treated as a clean result. Scans and pending uploads are kept under the
current user's local application data. The device secret is protected using
Windows DPAPI for that user. Local administrators can still access the machine.
The task permits scans on battery power and keeps the agent directory as its
working directory. Battery use, sleep and Windows task policies can still affect
when a run completes.

If the server rejects an invalid, oversized, obsolete, or bad-timestamp report,
the helper preserves it as rejected-latest.json in the agent directory and tries
a fresh scan at the next check-in. Check the scanner output and device clock.
Temporary network, rate-limit, and service errors retain the pending report for
retry. The workspace receives a generic failure alert when reachable; it does
not receive the rejected report or its detailed error message.

The task is named EndpointRadar Agent. To stop reporting, disable or revoke the
device in the workspace and unregister that task. Then remove the
EndpointRadarAgent directory under the account's LOCALAPPDATA if it is no longer
needed. The reporting helper is not a security boundary against someone who
controls the same Windows account or machine administrators.
