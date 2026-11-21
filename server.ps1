# ShopBridge E-Commerce Marketplace - Local Web Server using TcpListener
$port = 8080
$root = $PSScriptRoot
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)

try {
    $listener.Start()
    $url = "http://localhost:$port/"
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  ShopBridge Marketplace is running at: $url" -ForegroundColor Green
    Write-Host "  Tagline: Buy. Sell. Grow Together." -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Cyan

    Start-Process $url

    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()

        if ($requestLine) {
            $tokens = $requestLine -split ' '
            $urlPath = $tokens[1].TrimStart('/')
            if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = "index.html" }
            $cleanPath = ($urlPath -split '\?')[0]
            $filePath = Join-Path $root ($cleanPath -replace '/', '\')

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".htm"  { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
            } else {
                $nf = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                $nfBytes = [System.Text.Encoding]::UTF8.GetBytes($nf)
                $stream.Write($nfBytes, 0, $nfBytes.Length)
            }
        }
        $client.Close()
    }
} finally {
    $listener.Stop()
}
