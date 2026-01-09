Smart Buy Reviews HTML Template Guide
=====================================

Use this file as the checklist + boilerplate for every new HTML page so the layout, fonts, and spacing stay consistent across the site.

Checklist (every page)
----------------------
1) Head essentials
   - Include the Google Fonts preconnects.
   - Load the Playfair Display + Plus Jakarta Sans font families.
   - Load Tailwind via https://cdn.tailwindcss.com.
   - Load the shared stylesheet: /assets/tailwind.css.
   - Always set <meta charset="UTF-8"> and <meta name="viewport" ...>.

2) Body wrapper
   - Use <body class="min-h-screen">.
   - Wrap everything in <div class="relative">.

3) Header + navigation
   - Use the hero panel background: <div class="absolute inset-0 hero-panel"></div>.
   - The header container should be: max-w-6xl, px-6, py-10, gap-10.
   - Navigation uses uppercase, spaced tracking, and the shared links:
     Home (/), About (/about.html), Privacy Policy (/privacy-policy.html).

4) Page hero
   - Add a badge using the .badge class.
   - Use the page H1 in white text.
   - Add a short description in text-slate-200.

5) Main content
   - Wrap the main section in: <section class="content-card -mt-12 p-8">.
   - Wrap article content in: <div class="review-content">.
   - Use Tailwind utility classes for cards, grids, and spacing.

6) Footer
   - Use the shared footer with footer-link classes.
   - Keep the border-t and text-slate-300 styles.

HTML starter template
---------------------
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title – Smart Buy Reviews</title>
  <meta name="description" content="Short page summary.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/assets/tailwind.css">
</head>
<body class="min-h-screen">
  <div class="relative">
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 hero-panel"></div>
      <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <nav class="flex flex-col gap-6 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <a class="text-2xl font-semibold normal-case text-white" href="/">Smart Buy Reviews</a>
          <div class="flex flex-wrap gap-4">
            <a class="rounded-full px-4 py-2 text-slate-200 transition hover:text-sky-200" href="/">Home</a>
            <a class="rounded-full px-4 py-2 text-slate-200 transition hover:text-sky-200" href="/about.html">About</a>
            <a class="rounded-full px-4 py-2 text-slate-200 transition hover:text-sky-200" href="/privacy-policy.html">Privacy Policy</a>
          </div>
        </nav>

        <div class="flex flex-col gap-6">
          <span class="badge inline-flex w-fit items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Page Badge
          </span>
          <h1 class="text-4xl font-semibold text-white sm:text-5xl">Hero headline goes here.</h1>
          <p class="max-w-2xl text-lg text-slate-200">Short supporting summary copy.</p>
        </div>
      </div>
    </header>

    <main class="relative mx-auto w-full max-w-5xl px-6 pb-16">
      <section class="content-card -mt-12 p-8">
        <div class="review-content">
          <h2>Section title</h2>
          <p>Paragraph text goes here.</p>
        </div>
      </section>
    </main>

    <footer class="border-t border-white/10 px-6 py-10 text-sm text-slate-300">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-lg font-semibold text-white">Smart Buy Reviews</p>
          <div class="flex flex-wrap gap-4 text-sm">
            <a class="footer-link" href="/">Home</a>
            <a class="footer-link" href="/about.html">About</a>
            <a class="footer-link" href="/privacy-policy.html">Privacy Policy</a>
          </div>
        </div>
        <p>&copy; 2026 Smart Buy Reviews.</p>
      </div>
    </footer>
  </div>
</body>
</html>
