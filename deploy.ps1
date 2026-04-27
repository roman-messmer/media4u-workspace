<# Media4u Deploy – VS Code Edition (static deploy)
   - Frontend: local build -> (dist|build) tar -> server:/srv/media4u/site -> optional container reload
   - Subdomains: local build -> (dist|build) tar -> server:/srv/media4u/site/<subdir> (rsync swap)
   - Diverses: pure static sync -> server:/srv/media4u/site/diverses
#>

param(
  [ValidateSet('1','2','3','4','5')]
  [string]$Mode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Server            = "46.231.205.201"
$User              = "roman"

# Local paths (relative to this script)
$Root               = $PSScriptRoot
$LocalReactPath     = Join-Path $Root "media4u.ch"
$LocalProjektePath  = Join-Path $Root "projekte"
$LocalEditorPath    = Join-Path $Root "editor"
$LocalWerbungPath   = Join-Path $Root "werbung"
$LocalDiversesPath  = Join-Path $Root "diverses"

# Server paths
$RemoteBase     = "/srv/media4u"
$RemoteSite     = "$RemoteBase/site"      # outside React
$RemoteCompose  = "/srv/media4u"
$RemoteProj     = "$RemoteSite/projekte"
$RemoteEditor   = "$RemoteSite/editor"
$RemoteWerbung  = "$RemoteSite/werbung"
$RemoteDiverses = "$RemoteSite/diverses"

function Need($exe){ if(!(Get-Command $exe -ErrorAction SilentlyContinue)){ throw "Missing: $exe" } }

function Run-SSH([string]$cmd){
  $lf  = ($cmd -replace "`r`n","`n") -replace "`r",""
  $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($lf))
  & ssh ("{0}@{1}" -f $User,$Server) "bash -lc 'set -e; umask 022; echo $b64 | base64 -d | bash'"
  if($LASTEXITCODE -ne 0){ throw "Remote command failed." }
}

function Deploy-FrontendStatic{
  Need npm; Need tar; Need ssh; Need scp
  if(-not (Test-Path -LiteralPath $LocalReactPath)){ throw "React path missing: $LocalReactPath" }

  Push-Location $LocalReactPath
  try{
    if(-not (Test-Path -LiteralPath "node_modules")){ Write-Host "==> npm ci"; npm ci }
    
    # Der Test-Gatekeeper vor dem Build
    Write-Host "==> npm run test (Gatekeeper aktiv)"
    npm run test
    if($LASTEXITCODE -ne 0){ throw "Tests fehlgeschlagen! Deployment zum Schutz des Live-Servers abgebrochen." }

    Write-Host "==> npm run build"; npm run build
    if($LASTEXITCODE -ne 0){ throw "npm build failed" }

    $outDir = if(Test-Path -LiteralPath "dist"){ Join-Path $LocalReactPath "dist" } else { Join-Path $LocalReactPath "build" }
    if(-not (Test-Path -LiteralPath $outDir)){ throw "Neither dist nor build found." }

    $stamp = Get-Date -Format "yyyyMMddHHmm"
    $pkg   = Join-Path $env:TEMP "site-$stamp.tgz"
    Write-Host ("==> pack: {0}" -f $pkg)
    & tar -C $outDir -czf $pkg .
    if($LASTEXITCODE -ne 0){ throw "tar failed" }

    $remote = @'
set -e
BASE="__BASE__"
SITE="__SITE__"
PKG="$BASE/__PKG__"
TMP="$BASE/site_new"

[ -f "$PKG" ] || { echo "Package missing: $PKG"; exit 1; }

install -d -m 0755 "$SITE" "$TMP"
rm -rf "$TMP"/*
tar -xzf "$PKG" -C "$TMP"
rm -f "$PKG"

if [ ! -e "$TMP/index.html" ] && [ -z "$(ls -A "$TMP")" ]; then
  echo "ERROR: empty build (no files, no index.html)"; exit 1;
fi

EXCLUDES="--exclude=/projekte/** --exclude=/editor/** --exclude=/werbung/** --exclude=/diverses/** \
          --exclude=/projekte --exclude=/editor --exclude=/werbung --exclude=/diverses"

if command -v rsync >/dev/null 2>&1; then
  rsync -rltD --delete --omit-dir-times --no-perms --no-owner --no-group \
        $EXCLUDES "$TMP"/ "$SITE"/
else
  find "$SITE" -mindepth 1 -maxdepth 1 ! -name 'projekte' ! -name 'editor' ! -name 'werbung' ! -name 'diverses' -exec rm -rf {} +
  cp -a "$TMP"/. "$SITE"/
  chmod -R a+rX "$SITE"
fi

rm -rf "$TMP"

if [ -d "__COMPOSE__" ]; then
  cd "__COMPOSE__"
  docker compose up -d --force-recreate frontend || true
fi

curl -sI -H "Host: media4u.ch" http://127.0.0.1/ | head -n1 || true
'@
    $remote = $remote.Replace('__BASE__',$RemoteBase).
                      Replace('__SITE__',$RemoteSite).
                      Replace('__PKG__',(Split-Path -Leaf $pkg)).
                      Replace('__COMPOSE__',$RemoteCompose)

    Write-Host ("==> Upload -> {0}@{1}:{2}/" -f $User,$Server,$RemoteBase)
    & scp $pkg ("{0}@{1}:{2}/" -f $User,$Server,$RemoteBase) | Out-Null
    if($LASTEXITCODE -ne 0){ throw "scp failed (ExitCode=$LASTEXITCODE)" }

    Write-Host "==> swap on server and reload if needed..."
    Run-SSH $remote
    Remove-Item -Force $pkg

    Write-Host "OK: Frontend deployed."
  } finally { Pop-Location }
}

function Deploy-SubSiteBuild([string]$localPath,[string]$remoteTarget){
  Need tar; Need ssh; Need scp
  if(-not (Test-Path -LiteralPath $localPath)){ throw "Path missing: $localPath" }

  $outDir = $null
  if(-not (Test-Path (Join-Path $localPath "package.json"))) {
    Write-Host "==> Kein package.json gefunden. Verarbeite $localPath als statisches Verzeichnis."
    $outDir = $localPath
  } else {
    Need npm
    Push-Location $localPath
    try{
      if(-not (Test-Path -LiteralPath "node_modules")){ Write-Host "==> npm ci"; npm ci }
      
      # Test-Schritt für Sub-Seiten
      Write-Host "==> npm run test (Gatekeeper aktiv)"
      npm run test
      if($LASTEXITCODE -ne 0){ throw "Tests fehlgeschlagen! Deployment abgebrochen." }

      Write-Host "==> npm run build"; npm run build
      if($LASTEXITCODE -ne 0){ throw "npm build failed at $localPath" }
    } finally { Pop-Location }

    $dist   = Join-Path $localPath "dist"
    $build  = Join-Path $localPath "build"
    if(Test-Path -LiteralPath $dist){ $outDir = $dist }
    elseif(Test-Path -LiteralPath $build){ $outDir = $build }
  }

  if(-not $outDir){ throw "Kein Build/Dist gefunden für $localPath." }

  $stamp = Get-Date -Format "yyyyMMddHHmm"
  $pkg   = Join-Path $env:TEMP ("{0}-{1}.tgz" -f (Split-Path -Leaf $remoteTarget),$stamp)
  Write-Host ("==> pack: {0}" -f $pkg)
  & tar -C $outDir -czf $pkg .
  if($LASTEXITCODE -ne 0){ throw "tar failed" }

  $remote = @'
set -e
BASE="__BASE__"
TARGET="__TARGET__"
PKG="$BASE/__PKG__"
TMP="$BASE/__TMP__"

[ -f "$PKG" ] || { echo "Package missing: $PKG"; exit 1; }

install -d -m 0755 "$TARGET" "$TMP"
rm -rf "$TMP"/*
tar -xzf "$PKG" -C "$TMP"
rm -f "$PKG"

if [ ! -e "$TMP/index.html" ] && [ -z "$(ls -A "$TMP")" ]; then
  echo "ERROR: empty build (no files, no index.html)"; exit 1;
fi

if command -v rsync >/dev/null 2>&1; then
  rsync -rltD --delete --omit-dir-times --no-perms --no-owner --no-group \
        --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
        "$TMP"/ "$TARGET"/
else
  rm -rf "$TARGET"/*
  cp -a "$TMP"/. "$TARGET"/
  chmod -R a+rX "$TARGET"
fi

rm -rf "$TMP"
'@
  $remote = $remote.Replace('__BASE__',$RemoteBase).
                    Replace('__TARGET__',$remoteTarget).
                    Replace('__PKG__',(Split-Path -Leaf $pkg)).
                    Replace('__TMP__', ("tmp-" + (Split-Path -Leaf $remoteTarget) + "-new"))

  Write-Host ("==> Upload -> {0}@{1}:{2}/" -f $User,$Server,$RemoteBase)
  & scp $pkg ("{0}@{1}:{2}/" -f $User,$Server,$RemoteBase) | Out-Null
  if($LASTEXITCODE -ne 0){ throw "scp failed (ExitCode=$LASTEXITCODE)" }

  Write-Host ("==> rsync swap into {0} ..." -f $remoteTarget)
  Run-SSH $remote
  Remove-Item -Force $pkg

  Write-Host ("OK: Deployed -> {0}" -f $remoteTarget)
}

function Deploy-Projekte{
  Deploy-SubSiteBuild -localPath $LocalProjektePath -remoteTarget $RemoteProj
  Write-Host "OK: Projekte deployed -> https://projekte.media4u.ch/"
}

function Deploy-Editor{
  Deploy-SubSiteBuild -localPath $LocalEditorPath -remoteTarget $RemoteEditor
  Write-Host "OK: Editor deployed -> https://editor.media4u.ch/ (served at /editor)"
}

function Deploy-Werbung{
  Deploy-SubSiteBuild -localPath $LocalWerbungPath -remoteTarget $RemoteWerbung
  Write-Host "OK: Werbung deployed -> https://werbung.media4u.ch/"
}

function Deploy-Diverses{
  Deploy-SubSiteBuild -localPath $LocalDiversesPath -remoteTarget $RemoteDiverses
  Write-Host "OK: Diverses deployed -> https://diverses.media4u.ch/"
}

function Menu{
  Write-Host ""
  Write-Host "Media4u Deploy"
  Write-Host "1) Frontend (local build -> server swap)"
  Write-Host "2) Projekte (local build -> server swap to /projekte)"
  Write-Host "3) Editor   (local build -> server swap to /editor)"
  Write-Host "4) Werbung  (local build -> server swap to /werbung)"
  Write-Host "5) Diverses (pure static sync to /diverses)"
  Write-Host "0) Exit"
  Write-Host ""
}

try{
  if($PSBoundParameters.ContainsKey('Mode')){
    switch($Mode){
      '1' { Deploy-FrontendStatic }
      '2' { Deploy-Projekte }
      '3' { Deploy-Editor }
      '4' { Deploy-Werbung }
      '5' { Deploy-Diverses }
    }
    exit 0
  }

  do{
    Menu
    $choice = Read-Host "Your choice"
    switch($choice){
      '1' { Deploy-FrontendStatic }
      '2' { Deploy-Projekte }
      '3' { Deploy-Editor }
      '4' { Deploy-Werbung }
      '5' { Deploy-Diverses }
      '0' { break }
      default { Write-Host "Invalid." }
    }
  } while ($true)
}
catch{
  Write-Host ("ERROR: {0}" -f $_.Exception.Message) -ForegroundColor Red
  exit 1
}