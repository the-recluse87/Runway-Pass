import sys
import os
import base64
from PIL import Image, ImageDraw, ImageFont
import qrcode

# Get arguments from command line
name = sys.argv[1] if len(sys.argv) > 1 else "John Smith"
departure = sys.argv[2] if len(sys.argv) > 2 else "Dallas"
arrival = sys.argv[3] if len(sys.argv) > 3 else "Chicago"
confirmation = sys.argv[4] if len(sys.argv) > 4 else "X7L29Z"

# Load template from images/ folder
template = Image.open("runway-pass/images/RunwayPassTemplate.png").convert("RGBA")
draw = ImageDraw.Draw(template)

# Font setup
try:
    font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'SouthwestSans-Regular.ttf')
    font = ImageFont.truetype(font_path, 60)

    bold_font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'SouthwestSans-Bold.ttf')
    bold_font = ImageFont.truetype(bold_font_path, 70)
except:
    font = ImageFont.load_default()

# Draw text on the image
draw.text((125, 230), f"{departure}", font=bold_font, fill="black")
draw.text((420, 230), f"{arrival}", font=bold_font, fill="black")
image_width, _ = template.size
name_text = f"{name}"
bbox = draw.textbbox((0, 0), name_text, font=font)
name_width = bbox[2] - bbox[0]
name_x = (image_width - name_width) // 3
name_x = name_x - 60
draw.text((name_x, 325), name_text, font=font, fill="black")

draw.text((220, 500), f"{confirmation}", font=font, fill="black")
draw.text((220, 500), f"{confirmation}", font=font, fill="black")

# Generate QR code
qr_data = f"{name}, {departure} to {arrival}, Conf: {confirmation}"
qr_img = qrcode.make(qr_data).resize((190, 190))
template.paste(qr_img, (795, 305))

# Save final image (unique filename)
output_dir = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(output_dir, exist_ok=True)
filename = os.path.join(output_dir, f"runway_pass_{confirmation}.png")
template.save(filename)

# Convert the image to Base64
with open(filename, "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

# Print the Base64-encoded image to stdout
print(base64_image)