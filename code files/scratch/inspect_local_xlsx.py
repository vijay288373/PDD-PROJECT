import zipfile
import xml.etree.ElementTree as ET
import os

xlsx_path = "E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx"

print("Checking file path exists:", os.path.exists(xlsx_path))
if not os.path.exists(xlsx_path):
    exit(1)

with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
    namelist = zip_ref.namelist()
    print("Files in zip:")
    for name in namelist:
        if 'worksheets' in name or 'sharedStrings' in name or 'workbook.xml' in name:
            print(" -", name)
    
    shared_strings = []
    if 'xl/sharedStrings.xml' in namelist:
        ss_content = zip_ref.read('xl/sharedStrings.xml')
        root = ET.fromstring(ss_content)
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for t in root.findall('.//ns:t', ns):
            shared_strings.append(t.text if t.text else "")
            
    # Function to print sheet content
    def print_sheet(sheet_name):
        print(f"\n--- {sheet_name} ---")
        if sheet_name in namelist:
            sheet_content = zip_ref.read(sheet_name)
            root = ET.fromstring(sheet_content)
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            # Print rows
            for row in root.findall('.//ns:row', ns)[:25]:
                row_num = row.attrib.get('r')
                cells = []
                for cell in row.findall('ns:c', ns):
                    cell_ref = cell.attrib.get('r')
                    cell_type = cell.attrib.get('t')
                    val_el = cell.find('ns:v', ns)
                    val = val_el.text if val_el is not None else ""
                    
                    if cell_type == 's':  # shared string
                        val_str = shared_strings[int(val)] if int(val) < len(shared_strings) else f"S_{val}"
                    elif cell_type == 'str':
                        val_str = val
                    elif cell_type == 'inlineStr':
                        t_el = cell.find('.//ns:t', ns)
                        val_str = t_el.text if t_el is not None else ""
                    else:
                        val_str = val
                    cells.append(f"{cell_ref}:{val_str}")
                print(f"Row {row_num}: {', '.join(cells)}")

    print_sheet('xl/worksheets/sheet1.xml')
    print_sheet('xl/worksheets/sheet2.xml')
    print_sheet('xl/worksheets/sheet3.xml')
