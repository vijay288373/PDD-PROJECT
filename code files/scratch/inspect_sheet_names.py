import zipfile
import xml.etree.ElementTree as ET

xlsx_path = "E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx"

with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
    content = zip_ref.read('xl/workbook.xml')
    root = ET.fromstring(content)
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    for sheet in root.findall('.//ns:sheet', ns):
        print("Sheet Name:", sheet.attrib.get('name'), "Sheet ID:", sheet.attrib.get('sheetId'))
