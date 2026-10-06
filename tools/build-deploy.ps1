$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$destinationRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot 'dist'))
if (-not $destinationRoot.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Deployment destination is outside the project.'
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

$publicExtensions = '.html', '.shtml', '.css', '.js', '.xml', '.txt'
$publicFiles = Get-ChildItem -LiteralPath $projectRoot -Recurse -File | Where-Object {
  $_.FullName -notmatch '[\\/](?:\.git|node_modules|tools|docs|dist|backup|tmp|\.tmp|output|cms|server)[\\/]' -and $_.Extension -in $publicExtensions
}

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

$files = Get-ChildItem -LiteralPath $destinationRoot -Recurse -File
[PSCustomObject]@{
  Output = $destinationRoot
  Files = $files.Count
  SizeMB = [Math]::Round((($files | Measure-Object Length -Sum).Sum / 1MB), 1)
}
