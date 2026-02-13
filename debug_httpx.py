import httpx
print(f"httpx version: {httpx.__version__}")
try:
    from httpx import Client, ASGITransport
    print("Imported Client, ASGITransport")
    print(Client.__init__.__annotations__)
    # print(help(Client))
except Exception as e:
    print(f"Import failed: {e}")

try:
    c = httpx.Client(transport=ASGITransport(app=lambda x,y: None), base_url="http://test")
    print("Client created successfully")
except Exception as e:
    print(f"Client creation failed: {e}")
