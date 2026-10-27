# Local static server for previewing the splash page (no Python/Node needed).
# Usage: powershell -ExecutionPolicy Bypass -File .claude/serve.ps1 -Port 5500
param([int]$Port = 5500)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'
  '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.gif' = 'image/gif'
  '.ico' = 'image/x-icon'; '.woff2' = 'font/woff2'; '.woff' = 'font/woff'
  '.mp4' = 'video/mp4'; '.webm' = 'video/webm'; '.txt' = 'text/plain; charset=utf-8'
  '.xml' = 'application/xml'; '.map' = 'application/json'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $path.StartsWith($root) -or -not (Test-Path $path -PathType Leaf)) {
      $res.StatusCode = 404
      Write-Host "404 $($req.Url.AbsolutePath)"
      continue
    }
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $res.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
    $res.Headers['Cache-Control'] = 'no-store'
    $res.Headers['Accept-Ranges'] = 'bytes'

    $fs = [IO.File]::OpenRead($path)
    try {
      $len = $fs.Length; $start = 0; $end = $len - 1
      # Range support so <video> can seek and loop
      if ($req.Headers['Range'] -match '^bytes=(\d*)-(\d*)$') {
        if ($Matches[1]) { $start = [int64]$Matches[1] }
        if ($Matches[2]) { $end = [Math]::Min([int64]$Matches[2], $len - 1) }
        elseif (-not $Matches[1]) { $start = $len - [int64]$Matches[2] }
        $res.StatusCode = 206
        $res.Headers['Content-Range'] = "bytes $start-$end/$len"
      }
      $count = $end - $start + 1
      $res.ContentLength64 = $count
      if ($req.HttpMethod -ne 'HEAD') {
        $fs.Position = $start
        $buf = New-Object byte[] 65536
        while ($count -gt 0) {
          $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $count))
          if ($n -le 0) { break }
          $res.OutputStream.Write($buf, 0, $n); $count -= $n
        }
      }
    } finally { $fs.Close() }
  } catch {
    # Client aborted (e.g. video range cancelled) — ignore
  } finally {
    try { $res.Close() } catch {}
  }
}
