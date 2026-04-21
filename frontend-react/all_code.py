import os

output_file = "all_code.txt"

# All extensions used in your stack
extensions = ('.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.sql', '.json')

# Folders to skip
skip_dirs = {'node_modules', '__pycache__', '.git', 'dist', '.venv', 'build', '.next'}

with open(output_file, 'w', encoding='utf-8') as out:
    for root, dirs, files in os.walk('.'):
        # Remove skipped dirs in-place so os.walk doesn't recurse into them
        dirs[:] = [d for d in dirs if d not in skip_dirs]

        for fname in sorted(files):
            if fname.endswith(extensions):
                fpath = os.path.join(root, fname)
                out.write(f"\n{'='*60}\n")
                out.write(f"FILE: {fpath}\n")
                out.write(f"{'='*60}\n")
                try:
                    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                        out.write(f.read())
                except Exception as e:
                    out.write(f"[ERROR READING FILE: {e}]\n")
                out.write('\n')

print(f"Done! All code written to {output_file}")