# Patch: Define url_quote if it's missing in Werkzeug
try:
    from werkzeug.urls import url_quote
except ImportError:
    from urllib.parse import quote as url_quote
    import werkzeug.urls
    werkzeug.urls.url_quote = url_quote