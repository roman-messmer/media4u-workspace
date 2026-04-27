# build.ps1 — Menü + Docker-oder-Lokal (Auto-Fallback), PS 5.1
param(
  [ValidateSet('frontend','projekte','editor','werbung','diverses')]
  [string]$Project,
  [int]$Port,
  [switch]$NoBuild,
  [switch]$UsePreview,
  [switch]$OpenBrowser,
  [switch]$ForceDocker,
  [switch]$NoDocker
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
function TS([string]$m){ Write-Host ('[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) }

$Root = if($PSScriptRoot){ $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$ProjMap = @{
  'frontend' = Join-Path $Root 'media4u.ch'
  'projekte' = Join-Path $Root 'projekte'
  'editor'   = Join-Path $Root 'editor'
  'werbung'  = Join-Path $Root 'werbung'
  'diverses' = Join-Path $Root 'diverses'
}
$DefaultPort = @{ 'frontend'=5173; 'projekte'=5174; 'editor'=5175; 'werbung'=5176; 'diverses'=5177 }

function Show-Menu{
  Write-Host ''
  Write-Host '1) frontend   (media4u.ch)'
  Write-Host '2) projekte   (projekte.media4u.ch)'
  Write-Host '3) editor     (editor.media4u.ch)'
  Write-Host '4) werbung    (werbung.media4u.ch)'
  Write-Host '5) diverses   (diverses.media4u.ch - Pure Static)'
  Write-Host '0) Exit'
  Write-Host ''
  $c = Read-Host 'Deine Wahl'
  switch($c){ '1'{'frontend'} '2'{'projekte'} '3'{'editor'} '4'{'werbung'} '5'{'diverses'} '0'{exit 0} default{Show-Menu} }
}

function Ask-YesNo([string]$q,[bool]$def=$false){
  $d = if($def){'Y'}else{'N'}; $a = Read-Host ("{0} (y/n) [{1}]" -f $q,$d)
  if(!$a){return $def}; $a=$a.ToLower(); return ($a -in @('y','yes','j','ja'))
}

function Has-Docker{
  if($NoDocker){ return $false }
  if(-not (Get-Command docker -ErrorAction SilentlyContinue)){ return $false }
  $p = Start-Process docker -ArgumentList 'info','--format','{{json .ServerVersion}}' -NoNewWindow -PassThru -Wait -RedirectStandardOutput "$env:TEMP\dk.out" -RedirectStandardError "$env:TEMP\dk.err"
  if($p.ExitCode -ne 0){ return $false }
  return $true
}

function Detect-PM($projPath){
  if(Test-Path (Join-Path $projPath 'pnpm-lock.yaml')){ 'pnpm' }
  elseif(Test-Path (Join-Path $projPath 'yarn.lock')){ 'yarn' }
  else{ 'npm' }
}

function Ensure-Build([string]$projPath){
  if(-not (Test-Path (Join-Path $projPath 'package.json'))){
    TS "Kein package.json gefunden. Gehe von rein statischem Projekt aus."
    return $projPath
  }

  $dist = Join-Path $projPath 'dist'; $build = Join-Path $projPath 'build'
  if($NoBuild -and (Test-Path $dist -or Test-Path $build)){ TS '[NoBuild] reuse existing'; if(Test-Path $dist){return $dist}else{return $build} }
  
  $pm = Detect-PM $projPath; TS ("Package manager: {0}" -f $pm)
  Push-Location $projPath
  try{
    switch($pm){
      'pnpm' { 
        if(-not (Test-Path 'node_modules')){ TS 'pnpm i --frozen-lockfile'; pnpm i --frozen-lockfile | Out-Host }
        TS 'pnpm test'; pnpm test | Out-Host; if($LASTEXITCODE -ne 0){ throw 'Tests fehlgeschlagen!' }
        TS 'pnpm build'; pnpm build | Out-Host 
      }
      'yarn' { 
        if(-not (Test-Path 'node_modules')){ TS 'yarn install --frozen-lockfile'; yarn install --frozen-lockfile | Out-Host }
        TS 'yarn test'; yarn test | Out-Host; if($LASTEXITCODE -ne 0){ throw 'Tests fehlgeschlagen!' }
        TS 'yarn build'; yarn build | Out-Host 
      }
      default{ 
        if(-not (Test-Path 'node_modules')){ TS 'npm ci'; npm ci | Out-Host }
        TS 'npm run test'; npm run test | Out-Host; if($LASTEXITCODE -ne 0){ throw 'Tests fehlgeschlagen!' }
        TS 'npm run build'; npm run build | Out-Host 
      }
    }
    if($LASTEXITCODE -ne 0){ throw ('Build failed in {0}' -f $projPath) }
  } finally { Pop-Location }
  if(Test-Path $dist){ $dist } elseif(Test-Path $build){ $build } else { throw ('No build output in {0}' -f $projPath) }
}

try { [void][System.Net.HttpListener] } catch { Add-Type -AssemblyName System | Out-Null }
$Mime = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'
  '.js'='text/javascript; charset=utf-8'; '.mjs'='text/javascript; charset=utf-8'
  '.css'='text/css; charset=utf-8'; '.json'='application/json; charset=utf-8'
  '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'
  '.gif'='image/gif'; '.webp'='image/webp'; '.ico'='image/x-icon'; '.txt'='text/plain; charset=utf-8'
  '.map'='application/json; charset=utf-8'; '.wav'='audio/wav'; '.mp3'='audio/mpeg'; '.mp4'='video/mp4'
  '.woff'='font/woff'; '.woff2'='font/woff2'
}

function Start-StaticServer([string]$root,[int]$port){
  if(-not (Test-Path -LiteralPath $root)){ throw ("Serve path not found: {0}" -f $root) }
  $prefix = ("http://localhost:{0}/" -f $port)
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add($prefix)
  try{ $listener.Start() } catch { throw ("Port {0} belegt? {1}" -f $port,$_) }
  TS ("Serving {0} on {1} (CTRL+C to stop)" -f $root,$prefix)
  if($OpenBrowser){ Start-Process $prefix | Out-Null }
  while($listener.IsListening){
    try{
      $ctx=$listener.GetContext(); $req=$ctx.Request; $res=$ctx.Response
      $p=[Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/')); if(!$p){$p='index.html'}
      $fs=Join-Path $root $p; if(-not (Test-Path $fs)){ $fs=Join-Path $root 'index.html'; if(-not (Test-Path $fs)){ $res.StatusCode=404; $b=[Text.Encoding]::UTF8.GetBytes('404 Not Found'); $res.OutputStream.Write($b,0,$b.Length); $res.Close(); continue } }
      $ext=[IO.Path]::GetExtension($fs).ToLowerInvariant(); $ctype= if($Mime.ContainsKey($ext)){$Mime[$ext]}else{'application/octet-stream'}
      $res.Headers['Cache-Control']='no-store'; $res.ContentType=$ctype
      try{ $buf=[IO.File]::ReadAllBytes($fs); $res.ContentLength64=$buf.Length; $res.OutputStream.Write($buf,0,$buf.Length) }
      catch{ $res.StatusCode=500; $b=[Text.Encoding]::UTF8.GetBytes('500 Internal Server Error'); $res.OutputStream.Write($b,0,$b.Length) }
      finally{ $res.OutputStream.Close() }
    } catch [System.Net.HttpListenerException] { break } catch { TS ("Server error: {0}" -f $_.Exception.Message) }
  }
  try{$listener.Stop()}catch{}; try{$listener.Close()}catch{}
}

function Docker-Build([string]$projPath){
  if(-not (Test-Path (Join-Path $projPath 'package.json'))){ return }
  $abs = Convert-Path $projPath; TS ('Docker build in {0}' -f $abs)
  $cmd = @('sh','-lc','set -e; if [ ! -d node_modules ]; then npm ci; fi; npm run test; npm run build')
  docker run --rm -t --mount type=bind,source="${abs}",target=/app -w /app node:22.12-alpine @cmd | Out-Host
  if($LASTEXITCODE -ne 0){ throw ('Docker build failed in {0}' -f $projPath) }
}

function Docker-Preview([string]$projPath,[int]$port){
  $abs = Convert-Path $projPath; TS ('Docker preview on http://localhost:{0}' -f $port)
  $cmd = @('sh','-lc',("npm run preview -- --host 0.0.0.0 --port {0}" -f $port))
  docker run --rm -t -p "${port}:${port}" --mount type=bind,source="${abs}",target=/app -w /app node:22.12-alpine @cmd
}

function Docker-Serve([string]$outDir,[int]$port){
  $site = Convert-Path $outDir
  $tmp = Join-Path $env:TEMP ('caddy-' + (Get-Random)); New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $caddyfile = Join-Path $tmp 'Caddyfile'
@"
:${port} {
  root * /site
  file_server
  try_files {path} /index.html
  header Cache-Control "no-store"
}
"@ | Set-Content -LiteralPath $caddyfile -Encoding UTF8
  TS ('Serving {0} on http://localhost:{1}/ (CTRL+C to stop)' -f $site,$port)
  if($OpenBrowser){ Start-Process ("http://localhost:{0}/" -f $port) | Out-Null }
  docker run --rm -t -p "${port}:${port}" --mount type=bind,source="${site}",target=/site,readonly --mount type=bind,source="${caddyfile}",target=/etc/caddy/Caddyfile,readonly caddy:2-alpine
}

if(-not $Project){ $Project = Show-Menu }
if(-not $ProjMap.ContainsKey($Project)){ throw ('Unknown project: {0}' -f $Project) }
$ProjPath = $ProjMap[$Project]
if(-not $Port){ $Port = $DefaultPort[$Project] }

TS ('Project: {0}' -f $Project)
TS ('Project path: {0}' -f $ProjPath)
TS ('Port: {0}' -f $Port)

if(-not $PSBoundParameters.ContainsKey('NoBuild'))     { $NoBuild     = (Ask-YesNo 'Nur serven (kein Neu-Build)?' $false) }
if(-not $PSBoundParameters.ContainsKey('UsePreview'))  { $UsePreview  = (Ask-YesNo 'Vite Preview verwenden?' $false) }
if(-not $PSBoundParameters.ContainsKey('OpenBrowser')) { $OpenBrowser = (Ask-YesNo 'Browser automatisch oeffnen?' $true) }

$wantDocker = if($ForceDocker){ $true } elseif($NoDocker){ $false } else { Has-Docker }
TS ('Docker available: {0}' -f $wantDocker)

$dist = Join-Path $ProjPath 'dist'; $buildDir = Join-Path $ProjPath 'build'

if($wantDocker){
  if(-not $NoBuild){ Docker-Build $ProjPath }
  $outDir = if(Test-Path $dist){ $dist } elseif(Test-Path $buildDir){ $buildDir } else { $ProjPath }
  if($UsePreview -and (Test-Path (Join-Path $ProjPath 'package.json'))){ Docker-Preview $ProjPath $Port } else { Docker-Serve $outDir $Port }
} else {
  $outDir = if($NoBuild){ if(Test-Path $dist){$dist}elseif(Test-Path $buildDir){$buildDir}else{$ProjPath} } else { '' }
  if(-not $outDir){ $outDir = Ensure-Build $ProjPath }
  TS ("Build output: {0}" -f $outDir)
  if($UsePreview -and (Test-Path (Join-Path $ProjPath 'package.json'))){
    $pm = Detect-PM $ProjPath
    Push-Location $ProjPath; try{
      switch($pm){
        'pnpm' { TS ('pnpm run preview -- --port {0}' -f $Port); pnpm run preview -- --port $Port | Out-Host }
        'yarn' { TS ('yarn preview --port {0}' -f $Port); yarn preview --port $Port | Out-Host }
        default{ TS ('npm run preview -- --port {0}' -f $Port); npm run preview -- --port $Port | Out-Host }
      }
    } finally { Pop-Location }
  } else {
    Start-StaticServer -root $outDir -port $Port
  }
}