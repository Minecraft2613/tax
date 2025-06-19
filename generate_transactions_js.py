import re
from collections import defaultdict

# Step 1: Parse the TXT and calculate total sales
file_path = "transaction-log.txt"
sales = defaultdict(float)

pattern = re.compile(r"- ([\w.]+) sold .*? for \$(\d+\.?\d*)")

try:
    with open(file_path, "r") as file:
        for line in file:
            match = pattern.search(line)
            if match:
                player = match.group(1)
                amount = float(match.group(2))
                sales[player] += amount
except FileNotFoundError:
    print("❌ File 'transaction-log.txt' not found!")
    exit()

# Step 2: Generate HTML file
html_output = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Player Sales Report</title>
  <style>
    body { font-family: Arial, sans-serif; background: #1f1f1f; color: #eee; text-align: center; padding: 20px; }
    table { width: 60%%; margin: auto; border-collapse: collapse; background: #2a2a2a; }
    th, td { padding: 12px; border-bottom: 1px solid #444; }
    th { background: #333; }
    tr:hover { background: #3a3a3a; }
    h1 { color: #ffb400; }
  </style>
</head>
<body>
  <h1>📊 Minecraft Player Sales Report</h1>
  <table>
    <tr><th>Player Name</th><th>Total Sold ($)</th></tr>
"""

for player, total in sorted(sales.items(), key=lambda x: x[1], reverse=True):
    html_output += f"    <tr><td>{player}</td><td>${total:.2f}</td></tr>\n"

html_output += """  </table>
</body>
</html>"""

# Save the HTML file
with open("sales-report.html", "w") as f:
    f.write(html_output)

print("✅ HTML report generated: sales-report.html")
