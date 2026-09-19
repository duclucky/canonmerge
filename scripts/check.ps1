$ErrorActionPreference = "Stop"
$env:PYTHONUTF8 = "1"
$root = Resolve-Path "$PSScriptRoot\.."
Write-Host "[1/3] genvm-lint"
& "$root\.venv\Scripts\genvm-lint.exe" check "$root\contracts\canonmerge.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "[2/3] direct tests"
& "$root\.venv\Scripts\python.exe" -m pytest "$root\tests\direct" -q
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "[3/3] frontend typecheck, tests, build"
& npm --prefix "$root\frontend" run check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "CHECK_PASS: lint, direct tests, frontend typecheck/tests/build"
