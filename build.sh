#!/bin/sh
# Builds index.html (for GitHub Pages) from mission-control.html (the claude.ai artifact source).
# Edit mission-control.html, then run: ./build.sh
set -e
cd "$(dirname "$0")"
{
cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Explorer 1">
<meta name="theme-color" content="#0b0f12">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="icon" type="image/png" href="assets/icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<style>
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{box-sizing:border-box}
img{max-width:100%}
[hidden]{display:none!important}
</style>
HEAD
cat mission-control.html
} > index.html
echo "Built index.html"
