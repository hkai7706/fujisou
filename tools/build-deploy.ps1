param([switch]$Production, [switch]$IncludeMailform)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$destinationRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot 'dist'))
if (-not $destinationRoot.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Deployment destination is outside the project.'
}

# Reapply shared-code and byte-identical image optimizations after page generators.
Push-Location -LiteralPath $projectRoot
try {
  foreach ($optimization in 'build-videos.mjs', 'add-loan-links.mjs', 'review-health-copy.mjs', 'optimize-shared-chrome.mjs', 'deduplicate-image-references.mjs', 'build-home-css.mjs', 'normalize-folder-links.mjs', 'update-catalog-links.mjs', 'add-favicons.mjs', 'prepare-seo.mjs', 'generate-sitemap.mjs', 'version-public-assets.mjs') {
    & node (Join-Path $PSScriptRoot $optimization)
    if ($LASTEXITCODE -ne 0) { throw "Optimization failed: $optimization" }
  }
} finally { Pop-Location }

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
$excludedDirectories = @('.git', 'node_modules', 'tools', 'docs', 'dist', 'backup', 'tmp', '.tmp', 'output', 'cms', 'server', 'mailformpro', 'mfp.statics', 'iplogs', 'originals')
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

$files = Get-ChildItem -LiteralPath $destinationRoot -Recurse -File
[PSCustomObject]@{
  Output = $destinationRoot
  Files = $files.Count
  SizeMB = [Math]::Round((($files | Measure-Object Length -Sum).Sum / 1MB), 1)
}
