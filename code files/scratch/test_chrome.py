import sys
print("Step 1: Importing webdriver...")
sys.stdout.flush()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

print("Step 2: Configuring Chrome options...")
sys.stdout.flush()
o = Options()
o.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
o.add_argument("--headless=new")
o.add_argument("--no-sandbox")
o.add_argument("--disable-gpu")
o.add_argument("--disable-dev-shm-usage")

print("Step 3: Initializing webdriver.Chrome...")
sys.stdout.flush()
try:
    driver = webdriver.Chrome(options=o)
    print("Step 4: Chrome driver initialized successfully!")
    sys.stdout.flush()
    driver.quit()
    print("Step 5: Browser quit successfully.")
    sys.stdout.flush()
except Exception as e:
    print(f"Error during Chrome driver launch: {str(e)}")
    sys.stdout.flush()
