param(
  [int]$MinimumBytes = 1048576,
  [int]$MaximumWidth = 2000,
  [long]$Quality = 88
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Add-Type -AssemblyName System.Drawing

function Get-RelativePath([string]$FromDirectory, [string]$ToPath) {
  $from = New-Object Uri(([IO.Path]::GetFullPath($FromDirectory).TrimEnd('\') + '\'))
  $to = New-Object Uri([IO.Path]::GetFullPath($ToPath))
  return [Uri]::UnescapeDataString($from.MakeRelativeUri($to).ToString())
}

$pageFiles = Get-ChildItem -LiteralPath $projectRoot -Recurse -File |
  Where-Object { $_.FullName -notmatch '[\\/](?:node_modules|\.git|backup|tmp|\.tmp|dist|output|docs)[\\/]' -and $_.Extension -in '.html', '.shtml', '.css' }

$usedImages = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($pageFile in $pageFiles) {
  $content = [IO.File]::ReadAllText($pageFile.FullName, [Text.Encoding]::UTF8)
  foreach ($match in [regex]::Matches($content, '(?:src|href|url\()\s*=?\s*["'']?([^"'')?#]+\.(?:jpe?g|png))', 'IgnoreCase')) {
    $reference = $match.Groups[1].Value
    if ($reference -match '^https?://') { continue }
    $candidate = if ($reference.StartsWith('/')) {
      Join-Path $projectRoot $reference.TrimStart('/')
    } else {
      Join-Path $pageFile.DirectoryName $reference
    }
    $resolved = [IO.Path]::GetFullPath($candidate)
    if ([IO.File]::Exists($resolved)) { [void]$usedImages.Add($resolved) }
  }
}

$replacements = @{}
foreach ($sourcePath in $usedImages) {
  $source = Get-Item -LiteralPath $sourcePath
  if ($source.Length -lt $MinimumBytes) { continue }
  if ($source.BaseName -like '*-web') { continue }

  $destination = Join-Path $source.DirectoryName ($source.BaseName + '-web.jpg')
  if ([IO.File]::Exists($destination) -and (Get-Item -LiteralPath $destination).Length -lt $source.Length) {
    $oldRelative = Get-RelativePath $projectRoot $source.FullName
    $newRelative = Get-RelativePath $projectRoot $destination
    $replacements[$oldRelative] = $newRelative
    continue
  }
  $input = [Drawing.Image]::FromFile($source.FullName)
  try {
    $scale = [Math]::Min(1, $MaximumWidth / $input.Width)
    $width = [Math]::Max(1, [int][Math]::Round($input.Width * $scale))
    $height = [Math]::Max(1, [int][Math]::Round($input.Height * $scale))
    $output = New-Object Drawing.Bitmap($width, $height, [Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $output.SetResolution(72, 72)
      $graphics = [Drawing.Graphics]::FromImage($output)
      try {
        $graphics.Clear([Drawing.Color]::White)
        $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($input, 0, 0, $width, $height)
      } finally { $graphics.Dispose() }

      $jpegCodec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
      $encoderParameters = New-Object Drawing.Imaging.EncoderParameters(1)
      $encoderParameters.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, $Quality)
      $output.Save($destination, $jpegCodec, $encoderParameters)
      $encoderParameters.Dispose()
    } finally { $output.Dispose() }
  } finally { $input.Dispose() }

  if ((Get-Item -LiteralPath $destination).Length -lt $source.Length) {
    $oldRelative = Get-RelativePath $projectRoot $source.FullName
    $newRelative = Get-RelativePath $projectRoot $destination
    $replacements[$oldRelative] = $newRelative
  } else {
    Remove-Item -LiteralPath $destination
  }
}

foreach ($pageFile in $pageFiles) {
  $content = [IO.File]::ReadAllText($pageFile.FullName, [Text.Encoding]::UTF8)
  $updated = $content
  foreach ($oldRelative in $replacements.Keys) {
    $oldAbsolute = Join-Path $projectRoot $oldRelative
    $newAbsolute = Join-Path $projectRoot $replacements[$oldRelative]
    $oldFromPage = Get-RelativePath $pageFile.DirectoryName $oldAbsolute
    $newFromPage = Get-RelativePath $pageFile.DirectoryName $newAbsolute
    $updated = $updated.Replace($oldFromPage, $newFromPage)
    $updated = $updated.Replace('/' + $oldRelative, '/' + $replacements[$oldRelative])
  }
  if ($updated -ne $content) {
    [IO.File]::WriteAllText($pageFile.FullName, $updated, (New-Object Text.UTF8Encoding($false)))
  }
}

$originalBytes = 0L
$optimizedBytes = 0L
foreach ($oldRelative in $replacements.Keys) {
  $originalBytes += (Get-Item -LiteralPath (Join-Path $projectRoot $oldRelative)).Length
  $optimizedBytes += (Get-Item -LiteralPath (Join-Path $projectRoot $replacements[$oldRelative])).Length
}

[PSCustomObject]@{
  OptimizedFiles = $replacements.Count
  OriginalMB = [Math]::Round($originalBytes / 1MB, 1)
  DeliveryMB = [Math]::Round($optimizedBytes / 1MB, 1)
  SavedPercent = if ($originalBytes) { [Math]::Round((1 - $optimizedBytes / $originalBytes) * 100, 1) } else { 0 }
}
