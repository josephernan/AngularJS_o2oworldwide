# /app/libs
Use this for libs that should not be minified, or combine into either `app.{js|css}` or `bower-vendor.{js|css}`.

These files should be ***specifically*** referenced in:
```
/gulpfile.js::custom{
  './app/lib/.../src_file.js':  /* build_root + */ 'assets/js/.../'
}
```
