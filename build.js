#!/usr/bin/env node
/**
 * build.js — Marvio static site build pipeline
 *
 * 1. Cleans and recreates dist/
 * 2. Copies assets/ and CNAME verbatim
 * 3. Concatenates + minifies CSS  → dist/css/style.min.css
 * 4. Concatenates + minifies JS   → dist/js/bundle.min.js
 * 5. Rewrites link/script tags in index.html and minifies → dist/index.html
 *
 * JS and CSS files are concatenated in the exact order they appear in index.html.
 * GSAP is loaded from CDN and is intentionally excluded from the bundle.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const { transform }          = require('lightningcss');
const { minify: minifyJS }   = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── Source file order must match index.html exactly ─────────────────────────

const CSS_FILES = [
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/animations.css',
];

const JS_FILES = [
  'js/hero.js',
  'js/nav.js',
  'js/scroll.js',
  'js/reveal.js',
  'js/parallax.js',
  'js/collab.js',
  'js/form.js',
  'js/main.js',
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

function readAll(files) {
  return files.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
}

// ── Build ────────────────────────────────────────────────────────────────────

async function build() {
  console.log('Building Marvio...\n');

  // 1. Clean dist/
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'js'),  { recursive: true });

  // 2. Copy assets/ and CNAME (CNAME is required for the custom domain marvio.co.uk)
  fs.cpSync(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(DIST, 'CNAME'));
  console.log('✓  assets/ + CNAME copied');

  // 3. Bundle + minify CSS
  const rawCSS = readAll(CSS_FILES);
  const { code: minCSS } = transform({
    filename: 'style.css',
    code: Buffer.from(rawCSS),
    minify: true,
    sourceMap: false,
  });
  fs.writeFileSync(path.join(DIST, 'css', 'style.min.css'), minCSS);
  console.log(`✓  CSS  ${kb(rawCSS.length)} → ${kb(minCSS.length)}`);

  // 4. Bundle + minify JS
  const rawJS = readAll(JS_FILES);
  const { code: minJS } = await minifyJS(rawJS, {
    compress: { passes: 2 },
    mangle:   true,
    format:   { comments: false },
  });
  fs.writeFileSync(path.join(DIST, 'js', 'bundle.min.js'), minJS);
  console.log(`✓  JS   ${kb(rawJS.length)} → ${kb(minJS.length)}`);

  // 5. Rewrite index.html and minify
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // Replace all local <link rel="stylesheet"> tags with a single bundle reference.
  // The regex matches two or more consecutive local stylesheet links.
  html = html.replace(
    /(?:\s*<link rel="stylesheet" href="css\/[^"]+"\s*\/>\s*){2,}/,
    '\n  <link rel="stylesheet" href="css/style.min.css" />\n'
  );

  // Replace all local <script src="js/..."> tags with a single bundle reference.
  // GSAP CDN scripts are left untouched (they use cdnjs.cloudflare.com URLs).
  html = html.replace(
    /(?:\s*<script src="js\/[^"]+"><\/script>\s*){2,}/,
    '\n  <script src="js/bundle.min.js"></script>\n'
  );

  const minHTML = await minifyHTML(html, {
    collapseWhitespace:    true,
    removeComments:        true,
    removeAttributeQuotes: false, // keep quotes — safer for attribute values
    minifyCSS:             true,  // minify inline styles
    minifyJS:              true,  // minify inline scripts (scroll restore snippet)
  });

  fs.writeFileSync(path.join(DIST, 'index.html'), minHTML);
  const rawHTMLSize = fs.statSync(path.join(ROOT, 'index.html')).size;
  console.log(`✓  HTML ${kb(rawHTMLSize)} → ${kb(Buffer.byteLength(minHTML))}`);

  console.log('\n✅  Build complete → dist/');
}

build().catch(err => {
  console.error('\n❌  Build failed:', err.message);
  process.exit(1);
});
