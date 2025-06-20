import re, json
from collections import defaultdict

sales = defaultdict(float)
with open("transaction-log.txt", "r", encoding="utf-8") as file:
    for line in file:
        match = re.search(r"- ([\w.]+) sold .*? for \$(\d+(?:,\d+)?(?:\.\d+)?)", line)
        if match:
            name = match.group(1)
            amount = float(match.group(2).replace(",", ""))
            sales[name] += amount

result = {name: {"total": round(total, 2)} for name, total in sales.items()}
with open("transactions.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)

