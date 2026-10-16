"""Generate the static Contact mailto QR using the system libqrencode library.

The generated SVG is committed; this script is needed only when the email changes.
"""

from ctypes import POINTER, Structure, c_char_p, c_int, c_ubyte, cdll
from ctypes.util import find_library
from pathlib import Path


EMAIL = "antoniusjairusofficial@gmail.com"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "contact-email-qr.svg"


class QRCode(Structure):
    _fields_ = [
        ("version", c_int),
        ("width", c_int),
        ("data", POINTER(c_ubyte)),
    ]


library_name = find_library("qrencode")
if not library_name:
    raise SystemExit("libqrencode is required to regenerate the static Contact QR")

library = cdll.LoadLibrary(library_name)
library.QRcode_encodeString8bit.argtypes = [c_char_p, c_int, c_int]
library.QRcode_encodeString8bit.restype = POINTER(QRCode)
library.QRcode_free.argtypes = [POINTER(QRCode)]

code = library.QRcode_encodeString8bit(f"mailto:{EMAIL}".encode(), 0, 1)
if not code:
    raise SystemExit("QR encoding failed")

try:
    width = code.contents.width
    quiet = 4
    size = width + 2 * quiet
    modules = [
        f"M{x + quiet} {y + quiet}h1v1h-1z"
        for y in range(width)
        for x in range(width)
        if code.contents.data[y * width + x] & 1
    ]
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
        'shape-rendering="crispEdges" role="img">\n'
        f'<rect width="{size}" height="{size}" fill="#fff"/>\n'
        f'<path fill="#11100f" d="{"".join(modules)}"/>\n'
        '</svg>\n'
    )
    OUTPUT.write_text(svg)
    print(f"Wrote {OUTPUT} ({width} modules, 4-module quiet zone)")
finally:
    library.QRcode_free(code)
