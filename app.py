import http.server
import socketserver
import webbrowser

PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Supaya tidak kena cache saat development
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Server berjalan di {url}")
        print("Tekan CTRL+C untuk menghentikan server.")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()