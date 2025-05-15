import sys
import os
import base64
import random
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import qrcode

# Get arguments from command line
name = sys.argv[1] if len(sys.argv) > 1 else "John Smith"
departure = sys.argv[2] if len(sys.argv) > 2 else "Dallas"
arrival = sys.argv[3] if len(sys.argv) > 3 else "Chicago"
confirmation = sys.argv[4] if len(sys.argv) > 4 else "X7L29Z"
departure_city = sys.argv[5] if len(sys.argv) > 5 else "St. Louis"
arrival_city = sys.argv[6] if len(sys.argv) > 6 else "Washington, D.C."
pass_date = sys.argv[7] if len(sys.argv) > 7 else datetime.now().strftime("%Y-%m-%d")
runway_pass_id = sys.argv[8] if len(sys.argv) > 8 else ""

# Generate a random valid flight number (3-4 digits)
flight_number = str(random.randint(1000, 9999))

# Generate a random time in 12-hour format with am/pm
def random_time():
    hour = random.randint(0, 23)
    minute = random.choice([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
    t = datetime(2000, 1, 1, hour, minute)
    return t.strftime("%I:%M%p").lstrip("0").lower()

depart_time = random_time()

# Load template from images/ folder
template = Image.open("runway-pass/images/RunwayPassTemplate.png").convert("RGBA")
draw = ImageDraw.Draw(template)

# Font setup
try:
    font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'SouthwestSans-Regular.ttf')
    font = ImageFont.truetype(font_path, 60)
    small_font = ImageFont.truetype(font_path, 36)
    name_font = ImageFont.truetype(font_path, 45)

    bold_font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'SouthwestSans-Bold.ttf')
    bold_font = ImageFont.truetype(bold_font_path, 70)
    small_bold_font = ImageFont.truetype(bold_font_path, 50)
    label_font = ImageFont.truetype(bold_font_path, 36)
except:
    font = ImageFont.load_default()
    small_font = font
    label_font = font
    small_bold_font = font
    name_font = font
    bold_font = font

# Draw airport codes
dep_code_x, dep_code_y = 125, 230
arr_code_x, arr_code_y = 420, 230
draw.text((dep_code_x, dep_code_y), f"{departure}", font=bold_font, fill="black")
draw.text((arr_code_x, arr_code_y), f"{arrival}", font=bold_font, fill="black")

# Center city names below the codes
dep_city_y = dep_code_y + 70  # adjust as needed for spacing
arr_city_y = arr_code_y + 70

# Measure text width for centering
dep_code_bbox = draw.textbbox((0, 0), departure, font=bold_font)
dep_code_width = dep_code_bbox[2] - dep_code_bbox[0]
dep_city_bbox = draw.textbbox((0, 0), departure_city, font=small_font)
dep_city_width = dep_city_bbox[2] - dep_city_bbox[0]
dep_city_x = dep_code_x + (dep_code_width - dep_city_width) // 2

arr_code_bbox = draw.textbbox((0, 0), arrival, font=bold_font)
arr_code_width = arr_code_bbox[2] - arr_code_bbox[0]
arr_city_bbox = draw.textbbox((0, 0), arrival_city, font=small_font)
arr_city_width = arr_city_bbox[2] - arr_city_bbox[0]
arr_city_x = arr_code_x + (arr_code_width - arr_city_width) // 2

draw.text((dep_city_x, dep_city_y), departure_city, font=small_font, fill="#ffac01")
draw.text((arr_city_x, arr_city_y), arrival_city, font=small_font, fill="#ffac01")

image_width, _ = template.size
name_text = f"{name}"
bbox = draw.textbbox((0, 0), name_text, font=font)
name_width = bbox[2] - bbox[0]
name_x = (image_width - name_width) // 3
name_x = name_x - 30

# Draw "PASSENGER:" label in bold above the name
passenger_label = "PASSENGER:"
label_font = small_bold_font  # Use the bold font
label_bbox = draw.textbbox((0, 0), passenger_label, font=label_font)
label_width = label_bbox[2] - label_bbox[0]
label_x = (image_width - label_width) // 3 - 60  # Align with name_x
label_y = 385  # Position above the name
draw.text((label_x, label_y), passenger_label, font=label_font, fill="black")

# Draw the passenger's name
draw.text((name_x, 425), name_text, font=name_font, fill="black")

try:
    pretty_date = datetime.strptime(pass_date, "%Y-%m-%d").strftime("%B %d, %Y")
except Exception:
    pretty_date = pass_date

# Draw "DEPARTS" label and date/time
departs_label = "DEPARTS:"
departs_label_x = (image_width - label_width) // 3 - 30
departs_label_y = 475
draw.text((departs_label_x, departs_label_y), departs_label, font=label_font, fill="black")
draw.text((115, departs_label_y + 40), pretty_date, font=name_font, fill="black")
draw.text((385, departs_label_y + 40), depart_time, font=name_font, fill="black")

# Draw "FLIGHT" label and flight number
flight_label = "FLIGHT:"
flight_label_x = (image_width - label_width) // 3 - 10
flight_label_y = 565
draw.text((flight_label_x, flight_label_y), flight_label, font=label_font, fill="black")
draw.text((270, flight_label_y + 40), flight_number, font=name_font, fill="black")

name_parts = name.strip().split()
first_name = name_parts[0]
last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

# Generate QR code
qr_data = f"First Name: {first_name}, Last Name: {last_name}, Date: {pass_date}, Pass ID: {runway_pass_id}"
qr_img = qrcode.make(qr_data).resize((190, 190))
template.paste(qr_img, (795, 305))

# Save final image (unique filename)
output_dir = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(output_dir, exist_ok=True)
filename = os.path.join(output_dir, f"runway_pass_{flight_number}.png")
template.save(filename)

# Convert the image to Base64
with open(filename, "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

# Print the Base64-encoded image to stdout
print(base64_image)