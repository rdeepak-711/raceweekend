<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Race Weekend</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: #eef0f8;
            color: #1a1a2e;
            min-height: 100vh;
            padding: 2.5rem 1rem 4rem;
          }

          .container { max-width: 960px; margin: 0 auto; }

          /* Site header */
          .site-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
          }
          .site-logo {
            font-size: 1.1rem;
            font-weight: 900;
            color: #3730a3;
            text-decoration: none;
            letter-spacing: -0.02em;
          }

          /* Stats row */
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: #fff;
            border-radius: 1rem;
            border: 1px solid #dde0f0;
            overflow: hidden;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 4px rgba(79,70,229,.07);
          }
          .stat {
            padding: 1.75rem 2.5rem;
          }
          .stat + .stat {
            border-left: 1px solid #dde0f0;
          }
          .stat-value {
            font-size: 2.75rem;
            font-weight: 900;
            color: #4f46e5;
            line-height: 1;
            letter-spacing: -0.04em;
            font-variant-numeric: tabular-nums;
          }
          .stat-label {
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: #9096b0;
            margin-top: 0.5rem;
          }

          /* Card */
          .card {
            background: #fff;
            border-radius: 1rem;
            border: 1px solid #dde0f0;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(79,70,229,.07);
          }
          .card-head {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1.1rem 1.75rem;
            border-bottom: 2.5px solid #4f46e5;
          }
          .card-head h1 {
            font-size: 1.05rem;
            font-weight: 900;
            color: #1a1a2e;
          }
          .badge {
            padding: 0.2rem 0.7rem;
            background: #4f46e5;
            color: #fff;
            font-size: 0.6rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            border-radius: 999px;
          }

          /* Column headers */
          .col-heads {
            display: grid;
            grid-template-columns: 3.25rem 1fr 9.5rem;
            gap: 1rem;
            padding: 0.55rem 1.75rem;
            background: #f4f5fb;
            border-bottom: 1px solid #e8eaf4;
          }
          .col-head {
            font-size: 0.6rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: #9096b0;
          }
          .col-head.right { text-align: right; }

          /* Rows */
          table { width: 100%; border-collapse: collapse; }
          tr { border-bottom: 1px solid #f0f2f9; }
          tr:last-child { border-bottom: none; }
          tr:hover { background: #f8f9fe; }

          td { padding: 0.8rem 0; vertical-align: top; }
          td:first-child { padding-left: 1.75rem; width: 3.25rem; }
          td:last-child  { padding-right: 1.75rem; width: 9.5rem; text-align: right; }

          .row-num {
            font-size: 0.8rem;
            color: #bcc0d6;
            font-variant-numeric: tabular-nums;
            padding-top: 0.1rem;
            display: block;
          }
          .url-link {
            font-size: 0.82rem;
            color: #4f46e5;
            text-decoration: none;
            word-break: break-all;
            line-height: 1.45;
          }
          .url-link:hover { color: #3730a3; text-decoration: underline; }
          .lastmod {
            font-size: 0.8rem;
            color: #555a78;
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-variant-numeric: tabular-nums;
            padding-top: 0.1rem;
            display: block;
          }

          /* Footer */
          .footer {
            margin-top: 1.5rem;
            text-align: center;
            font-size: 0.72rem;
            color: #9096b0;
          }
          .footer a { color: #4f46e5; text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">

          <div class="site-header">
            <a class="site-logo" href="https://raceweekend.co">🏎 Race Weekend — Sitemap</a>
          </div>

          <!-- Stats -->
          <div class="stats">
            <div class="stat">
              <div class="stat-value">
                <xsl:value-of select="count(sm:urlset/sm:url)"/>
              </div>
              <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat">
              <div class="stat-value">
                <!-- Max lastmod = sort descending, take first -->
                <xsl:for-each select="sm:urlset/sm:url/sm:lastmod">
                  <xsl:sort select="." order="descending"/>
                  <xsl:if test="position() = 1">
                    <xsl:value-of select="substring(., 1, 10)"/>
                  </xsl:if>
                </xsl:for-each>
              </div>
              <div class="stat-label">Last Updated</div>
            </div>
          </div>

          <!-- URL table -->
          <div class="card">
            <div class="card-head">
              <h1>All URLs</h1>
              <span class="badge">Sitemap</span>
            </div>
            <div class="col-heads">
              <span class="col-head">#</span>
              <span class="col-head">URL</span>
              <span class="col-head right">Last Modified</span>
            </div>
            <table>
              <tbody>
                <xsl:for-each select="sm:urlset/sm:url">
                  <tr>
                    <td><span class="row-num"><xsl:value-of select="position()"/></span></td>
                    <td>
                      <a class="url-link" href="{sm:loc}">
                        <xsl:value-of select="sm:loc"/>
                      </a>
                    </td>
                    <td><span class="lastmod"><xsl:value-of select="substring(sm:lastmod, 1, 10)"/></span></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Race Weekend ·
              <a href="https://raceweekend.co">raceweekend.co</a>
              · Submit to
              <a href="https://search.google.com/search-console" target="_blank">Google Search Console</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
