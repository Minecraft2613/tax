import re, json
from collections import defaultdict

taxes = defaultdict(float)

with open("transaction-log.txt", "r", encoding="utf-8") as file:
    for line in file:
        match = re.search(r"- ([\w.]+) sold .*? for \$(\d+(?:,\d+)?(?:\.\d+)?)", line)
        if match:
            name = match.group(1)
            sale_amount = float(match.group(2).replace(",", ""))
            tax = round(sale_amount * 0.10, 2)  # 10% tax
            taxes[name] += tax

# Create transactions.json
result = {name: {"tax": round(total, 2)} for name, total in taxes.items()}

with open("transactions.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)

print("✅ Created transactions.json with tax info.")
