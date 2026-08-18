
import sys

input_file = r'c:\Users\Everton Moura\Documents\GitHub\APEX-LOG-3.0\index.html'

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line numbers are 1-indexed. Deleting from 3436 to 4113 (exclusive, so up to 4112)
# Indices in Python are 0-indexed.
# Line 3436 is index 3435.
# Line 4113 is index 4112.

start_index = 3435
end_index = 4112

del lines[start_index:end_index]

with open(input_file, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"Deleted lines {start_index + 1} to {end_index}")
