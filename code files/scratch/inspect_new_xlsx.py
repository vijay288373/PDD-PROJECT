import zipfile
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

xlsx_path = "E2E_Test_Report_AgriGuard_Latest.xlsx"

with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
    namelist = zip_ref.namelist()
    
    # Read sheet names relation
    content = zip_ref.read('xl/workbook.xml')
    root = ET.fromstring(content)
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    print("--- Worksheet Names ---")
    for sheet in root.findall('.//ns:sheet', ns):
        print(f"Sheet Name: {sheet.attrib.get('name')} (Sheet ID: {sheet.attrib.get('sheetId')})")
        
    shared_strings = []
    if 'xl/sharedStrings.xml' in namelist:
        ss_content = zip_ref.read('xl/sharedStrings.xml')
        root = ET.fromstring(ss_content)
        for t in root.findall('.//ns:t', ns):
            shared_strings.append(t.text if t.text else "")

    for sheet_file in sorted(namelist):
        if 'xl/worksheets/sheet' in sheet_file:
            print(f"\n=== Worksheet: {sheet_file} ===")
            content = zip_ref.read(sheet_file)
            root = ET.fromstring(content)
            for row in root.findall('.//ns:row', ns)[:4]:
                row_num = row.attrib.get('r')
                cells = []
                for cell in row.findall('ns:c', ns):
                    cell_ref = cell.attrib.get('r')
                    cell_type = cell.attrib.get('t')
                    val_el = cell.find('ns:v', ns)
                    val = val_el.text if val_el is not None else ""
                    
                    if cell_type == 's':
                        val_str = shared_strings[int(val)] if int(val) < len(shared_strings) else f"S_{val}"
                    elif cell_type == 'inlineStr':
                        t_el = cell.find('.//ns:t', ns)
                        val_str = t_el.text if t_el is not None else ""
                    else:
                        val_str = val
                    cells.append(f"{cell_ref}:{val_str}")
                print(f"Row {row_num}: {', '.join(cells)}")
