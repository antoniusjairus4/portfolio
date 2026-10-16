from ctypes import CDLL, c_char_p, c_int, c_uint, c_void_p, create_string_buffer
from PIL import Image

image = Image.open('/tmp/phase7-qr.png').convert('L').resize((640, 640), Image.Resampling.NEAREST)
pixels = create_string_buffer(image.tobytes())
library = CDLL('libzbar.so.0')
library.zbar_image_scanner_create.restype = c_void_p
library.zbar_image_create.restype = c_void_p
library.zbar_image_first_symbol.argtypes = [c_void_p]
library.zbar_image_first_symbol.restype = c_void_p
library.zbar_symbol_get_data.argtypes = [c_void_p]
library.zbar_symbol_get_data.restype = c_char_p
library.zbar_image_set_format.argtypes = [c_void_p, c_uint]
library.zbar_image_set_size.argtypes = [c_void_p, c_uint, c_uint]
library.zbar_image_set_data.argtypes = [c_void_p, c_void_p, c_uint, c_void_p]
library.zbar_scan_image.argtypes = [c_void_p, c_void_p]
library.zbar_scan_image.restype = c_int
library.zbar_image_destroy.argtypes = [c_void_p]
library.zbar_image_scanner_destroy.argtypes = [c_void_p]

scanner = library.zbar_image_scanner_create()
qr_image = library.zbar_image_create()
try:
    library.zbar_image_set_format(qr_image, 0x30303859)
    library.zbar_image_set_size(qr_image, image.width, image.height)
    library.zbar_image_set_data(qr_image, pixels, len(pixels), None)
    count = library.zbar_scan_image(scanner, qr_image)
    symbol = library.zbar_image_first_symbol(qr_image)
    decoded = library.zbar_symbol_get_data(symbol).decode() if symbol else None
    print({'symbols': count, 'decoded': decoded})
    assert decoded == 'mailto:antoniusjairusofficial@gmail.com'
finally:
    library.zbar_image_destroy(qr_image)
    library.zbar_image_scanner_destroy(scanner)
