import zipfile
import xml.etree.ElementTree as ET
import os

xlsx_path = r"e:\PDD App\node_modules\E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx"

print("Checking file path exists:", os.path.exists(xlsx_path))
if not os.path.exists(xlsx_path):
    exit(1)

with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
    # List all files in the zip
    namelist = zip_ref.namelist()
    print("Files in zip:")
    for name in namelist[:20]:
        print(" -", name)
    
    # Read shared strings if they exist
    shared_strings = []
    if 'xl/sharedStrings.xml' in namelist:
        ss_content = zip_ref.read('xl/sharedStrings.xml')
        root = ET.fromstring(ss_content)
        # Namespace for spreadsheetml
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for t in root.findall('.//ns:t', ns):
            shared_strings.append(t.text)
        print(f"Loaded {len(shared_strings)} shared strings.")
    
    # Read sheet1.xml
    if 'xl/worksheets/sheet1.xml' in namelist:
        sheet_content = zip_ref.read('xl/worksheets/sheet1.xml')
        root = ET.fromstring(sheet_content)
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        # Print first 20 rows
        print("Rows:")
        for row in root.findall('.//ns:row', ns)[:30]:
            row_num = row.attrib.get('r')
            cells = []
            for cell in row.findall('ns:c', ns):
                cell_ref = cell.attrib.get('r')
                cell_type = cell.attrib.get('t')
                val_el = cell.find('ns:v', ns)
                val = val_el.text if val_el is not None else ""
                
                if cell_type == 's':  # shared string
                    val_str = shared_strings[int(val)] if int(val) < len(shared_strings) else f"S_{val}"
                else:
                    val_str = val
                cells.append(f"{cell_ref}:{val_str}")
            print(f"Row {row_num}: {', '.join(cells)}")
