from database import engine

try:
    connection = engine.connect()

    print("=================================")
    print("PostgreSQL connection successful!")
    print("=================================")

    connection.close()

except Exception as e:

    print("=================================")
    print("PostgreSQL connection FAILED!")
    print("=================================")

    print(e)