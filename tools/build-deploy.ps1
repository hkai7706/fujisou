param([switch]$Production, [switch]$IncludeMailform)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$destinationRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot 'dist'))
if (-not $destinationRoot.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Deployment destination is outside the project.'
}

# Validate prerequisites before replacing an existing upload package.
if ($IncludeMailform) {
  foreach ($folder in 'mailformpro', 'mfp.statics') {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "contact/$folder"))) {
      throw "Missing contact/$folder. Prepare the existing private runtime before requesting a mailform package."
    }
  }
}

if ([IO.Directory]::Exists($destinationRoot)) {
  Remove-Item -LiteralPath $destinationRoot -Recurse -Force
}
[void][IO.Directory]::CreateDirectory($destinationRoot)

function Copy-PublicFile([string]$SourcePath) {
  $source = [IO.Path]::GetFullPath($SourcePath)
  if (-not $source.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { return }
  if (-not [IO.File]::Exists($source)) { return }
  $relative = $source.Substring($projectRoot.Length).TrimStart('\', '/')
  $destination = Join-Path $destinationRoot $relative
  [void][IO.Directory]::CreateDirectory((Split-Path -Parent $destination))
  Copy-Item -LiteralPath $source -Destination $destination -Force
}

$publicExtensions = '.html', '.shtml', '.css', '.js', '.mjs', '.xml', '.txt'
$excludedDirectories = @('.git', 'node_modules', 'tools', 'docs', 'source', 'dist', 'backup', 'tmp', '.tmp', 'output', 'cms', 'server', 'mailformpro', 'mfp.statics', 'iplogs', 'originals', 'analytics-portal', 'analytics-service', 'analytics-portal-dist', 'analytics-service-dist')
function Get-PublicFiles([string]$Directory) {
  foreach ($entry in Get-ChildItem -LiteralPath $Directory -Force) {
    if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
    if ($entry.PSIsContainer) {
      if ($entry.Name -notin $excludedDirectories) { Get-PublicFiles $entry.FullName }
    } elseif ($entry.Extension -in $publicExtensions) {
      $entry
    }
  }
}
$publicFiles = @(Get-PublicFiles $projectRoot)

foreach ($file in $publicFiles) { Copy-PublicFile $file.FullName }
foreach ($rootFile in '.htaccess', 'robots.txt', 'sitemap.xml', 'llms.txt') {
  Copy-PublicFile (Join-Path $projectRoot $rootFile)
}

$assetReferences = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $publicFiles) {
  $content = [IO.File]::ReadAllText($file.FullName, [Text.Encoding]::UTF8)
  foreach ($match in [regex]::Matches($content, '(?:src|href|srcset|url\()\s*=?\s*["'']?([^"'')?#,\s]+)', 'IgnoreCase')) {
    $reference = $match.Groups[1].Value
    if ($reference -match '^(?:https?:|mailto:|tel:|data:|#)') { continue }
    $candidate = if ($reference.StartsWith('/')) {
      Join-Path $projectRoot $reference.TrimStart('/')
    } else {
      Join-Path $file.DirectoryName $reference
    }
    try { $resolved = [IO.Path]::GetFullPath($candidate) } catch { continue }
    if ([IO.File]::Exists($resolved)) { [void]$assetReferences.Add($resolved) }
  }
  foreach ($srcsetMatch in [regex]::Matches($content, 'srcset=["'']([^"'']+)["'']', 'IgnoreCase')) {
    foreach ($candidateEntry in $srcsetMatch.Groups[1].Value.Split(',')) {
      $reference = $candidateEntry.Trim().Split(' ')[0]
      if (-not $reference) { continue }
      $candidate = if ($reference.StartsWith('/')) { Join-Path $projectRoot $reference.TrimStart('/') } else { Join-Path $file.DirectoryName $reference }
      try { $resolved = [IO.Path]::GetFullPath($candidate) } catch { continue }
      if ([IO.File]::Exists($resolved)) { [void]$assetReferences.Add($resolved) }
    }
  }
}

foreach ($asset in $assetReferences) { Copy-PublicFile $asset }

# Packaging transforms only dist/. Source regeneration is an explicit npm run
# refresh operation; ordinary builds must not create thousand-file Git diffs.
& node (Join-Path $PSScriptRoot 'build-shared-css.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Shared stylesheet assembly failed.' }
& node (Join-Path $PSScriptRoot 'embed-shared-chrome.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Shared component assembly failed.' }
& node (Join-Path $PSScriptRoot 'build-event-state.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Event state assembly failed.' }
& node (Join-Path $PSScriptRoot 'add-analytics.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Analytics tracker assembly failed.' }
& node (Join-Path $PSScriptRoot 'standardize-page-heroes.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Inner-page hero assembly failed.' }
& node (Join-Path $PSScriptRoot 'sync-customer-support.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Customer support assembly failed.' }
& node (Join-Path $PSScriptRoot 'build-home-blog.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Homepage blog assembly failed.' }
& node (Join-Path $PSScriptRoot 'build-consultation-banners.mjs') $destinationRoot
& node (Join-Path $PSScriptRoot 'build-home-inquiries.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Consultation banner assembly failed.' }
Push-Location -LiteralPath $destinationRoot
try {
  foreach ($step in 'build-home-css.mjs', 'build-home-delivery.mjs') {
    & node (Join-Path $PSScriptRoot $step)
    if ($LASTEXITCODE -ne 0) { throw "Deployment assembly failed: $step" }
  }
} finally { Pop-Location }
& node (Join-Path $PSScriptRoot 'version-public-assets.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Asset versioning failed.' }

if ($IncludeMailform) {
  & node (Join-Path $PSScriptRoot 'harden-contact-mailform.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'Mailform runtime is missing or could not be prepared.' }
  foreach ($folder in 'mailformpro', 'mfp.statics') {
    $runtime = Join-Path $projectRoot "contact/$folder"
    if (-not (Test-Path -LiteralPath $runtime)) { throw "Missing contact/$folder" }
    foreach ($file in Get-ChildItem -LiteralPath $runtime -Recurse -File -Force) {
      # Never package customer submissions, logs, sessions, or generated JS caches.
      $runtimeRelative = $file.FullName.Substring($runtime.Length).TrimStart('\', '/').Replace('\', '/')
      if ($folder -eq 'mailformpro' -and $runtimeRelative.StartsWith('data/') -and $file.Name -ne '.htaccess') { continue }
      Copy-PublicFile $file.FullName
    }
    if ($folder -eq 'mailformpro') {
      foreach ($directory in Get-ChildItem -LiteralPath (Join-Path $runtime 'data') -Directory -Recurse) {
        $relative = $directory.FullName.Substring($projectRoot.Length).TrimStart('\', '/')
        [void][IO.Directory]::CreateDirectory((Join-Path $destinationRoot $relative))
      }
      [IO.File]::WriteAllText((Join-Path $destinationRoot 'contact/mailformpro/data/dat.mailformpro.cgi'), '0,0,0,0', [Text.UTF8Encoding]::new($false))
    }
  }
}
if ($Production) {
  & node (Join-Path $PSScriptRoot 'prepare-seo.mjs') $destinationRoot --production
} else {
  & node (Join-Path $PSScriptRoot 'prepare-seo.mjs') $destinationRoot
}
if ($LASTEXITCODE -ne 0) { throw 'Deployment indexing preparation failed.' }
& node (Join-Path $PSScriptRoot 'generate-sitemap.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Deployment sitemap preparation failed.' }
& node (Join-Path $PSScriptRoot 'copy-deploy-assets.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Generated asset collection failed.' }
& node (Join-Path $PSScriptRoot 'site-check.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Deployment reference validation failed.' }
& node (Join-Path $PSScriptRoot 'check-seo.mjs') $destinationRoot
if ($LASTEXITCODE -ne 0) { throw 'Deployment SEO validation failed.' }

$files = Get-ChildItem -LiteralPath $destinationRoot -Recurse -File
[PSCustomObject]@{
  Output = $destinationRoot
  Files = $files.Count
  SizeMB = [Math]::Round((($files | Measure-Object Length -Sum).Sum / 1MB), 1)
}
